import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

function FaceDetectionNew({ onMoodUpdate }) {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [currentMood, setCurrentMood] = useState(null);
    const [mentalHealthRating, setMentalHealthRating] = useState(null);
    const [llmAnalysis, setLlmAnalysis] = useState(null);
    const [moodHistory, setMoodHistory] = useState(() => {
        const saved = localStorage.getItem('moodHistory');
        if (saved) {
            const parsedHistory = JSON.parse(saved);
            // Convert timestamp strings back to Date objects
            return parsedHistory.map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
        }
        return [];
    });
    const [moodStats, setMoodStats] = useState(() => {
        const saved = localStorage.getItem('moodStats');
        return saved ? JSON.parse(saved) : {};
    });
    const [dominantMood, setDominantMood] = useState(null);
    const [suggestions, setSuggestions] = useState("");
    const [showExercise, setShowExercise] = useState(false);
    const [exerciseType, setExerciseType] = useState(null);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [journal, setJournal] = useState(() => {
        const saved = localStorage.getItem('moodJournal');
        if (saved) {
            const parsedJournal = JSON.parse(saved);
            // Convert timestamp strings back to Date objects
            return parsedJournal.map(entry => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
            }));
        }
        return [];
    });
    const [showJournal, setShowJournal] = useState(false);
    const [journalEntry, setJournalEntry] = useState('');
    const [weeklyTrends, setWeeklyTrends] = useState({});
    const [showTrends, setShowTrends] = useState(false);

    // Save mood history to localStorage
    useEffect(() => {
        localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    }, [moodHistory]);

    // Save mood stats to localStorage
    useEffect(() => {
        localStorage.setItem('moodStats', JSON.stringify(moodStats));
    }, [moodStats]);

    useEffect(() => {
        localStorage.setItem('moodJournal', JSON.stringify(journal));
    }, [journal]);

    // Calculate weekly trends
    useEffect(() => {
        const calculateTrends = () => {
            const weeklyData = {};
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            moodHistory.forEach(item => {
                const date = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
                if (date >= oneWeekAgo) {
                    const dayKey = date.toLocaleDateString();
                    if (!weeklyData[dayKey]) {
                        weeklyData[dayKey] = {};
                    }
                    weeklyData[dayKey][item.mood] = (weeklyData[dayKey][item.mood] || 0) + 1;
                }
            });
            
            setWeeklyTrends(weeklyData);
        };
        
        calculateTrends();
    }, [moodHistory]);

    useEffect(() => {
        const loadModelsAndStartVideo = async () => {
            try {
                const MODEL_URL = '/models';
                console.log('Loading models from:', MODEL_URL);
                
                // Load all models
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);

                // Start video
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: {
                                width: 720,
                                height: 560
                            }
                        });
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                        }
                    } catch (err) {
                        console.error("Error accessing webcam:", err);
                        alert("Error accessing webcam: " + err.message);
                    }
                }
            } catch (err) {
                console.error("Error loading models:", err);
                alert("Error loading face detection models: " + err.message);
            }
        };

        loadModelsAndStartVideo();

        // Cleanup function
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // Handle video play event
    useEffect(() => {
        if (!videoRef.current) return;

        videoRef.current.addEventListener('play', () => {
            // Create canvas if it doesn't exist
            if (!canvasRef.current) {
                const canvas = faceapi.createCanvasFromMedia(videoRef.current);
                canvas.style.position = 'absolute';
                canvasRef.current = canvas;
                videoRef.current.parentNode.appendChild(canvas);
            }

            const displaySize = {
                width: videoRef.current.width,
                height: videoRef.current.height
            };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            // Set canvas transform for mirroring
            const ctx = canvasRef.current.getContext('2d');
            ctx.setTransform(-1, 0, 0, 1, canvasRef.current.width, 0);

            // Run face detection
            const interval = setInterval(async () => {
                if (videoRef.current && !videoRef.current.paused) {
                    const detections = await faceapi.detectAllFaces(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks()
                    .withFaceExpressions();

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    
                    // Clear canvas with proper transform
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    ctx.restore();
                    
                    // Draw all detections
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

                    // Update mood and analyze
                    if (detections.length > 0) {
                        const expressions = detections[0].expressions;
                        const [mood, confidence] = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
                        setCurrentMood(mood);
                        setConfidenceScore(Math.round(confidence * 100));
                        
                        // Update mood history and stats
                        setMoodHistory(prev => {
                            const newHistory = [...prev, { mood, timestamp: new Date() }];
                            return newHistory.slice(-10); // Keep last 10 moods
                        });

                        // Update mood statistics
                        setMoodStats(prev => {
                            const newStats = { ...prev };
                            newStats[mood] = (newStats[mood] || 0) + 1;
                            return newStats;
                        });

                        // Get LLM analysis first
                        const analysis = await generateLLMAnalysis(mood, confidence * 100, moodStats, journal);
                        setLlmAnalysis(analysis);

                        // Update mental health rating with LLM input
                        const rating = calculateMentalHealthRating(moodStats, mood, confidence * 100, analysis);
                        setMentalHealthRating(rating);

                        // Send mood data to parent component
                        if (onMoodUpdate) {
                            onMoodUpdate({
                                currentMood: mood,
                                confidenceScore: Math.round(confidence * 100),
                                dominantMood: calculateAverageMood()?.dominant,
                                secondaryMood: calculateAverageMood()?.secondary,
                                moodStats
                            });
                        }

                        // Analyze dominant mood
                        const newDominantMood = Object.entries(expressions)
                            .sort((a, b) => b[1] - a[1])[0][0];
                        setDominantMood(newDominantMood);

                        // Generate suggestions based on mood
                        const moodSuggestions = {
                            happy: "Great mood! Consider journaling about what made you happy today.",
                            sad: "Take a moment to breathe deeply. Would you like to talk about what's bothering you?",
                            angry: "Try counting to 10 slowly and practice deep breathing exercises.",
                            fearful: "Remember you're safe. Try grounding exercises: name 5 things you can see.",
                            disgusted: "Consider taking a short break or changing your environment.",
                            surprised: "Take a moment to process your emotions.",
                            neutral: "This is a good time for mindfulness or meditation."
                        };
                        setSuggestions(moodSuggestions[newDominantMood] || "Take a moment to check in with yourself.");
                    }
                }
            }, 100);

            return () => clearInterval(interval);
        });
    }, []);

    const getMoodEmoji = (mood) => {
        const emojiMap = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            disgusted: '🤢',
            surprised: '😮',
            fearful: '😨',
            neutral: '😐'
        };
        return emojiMap[mood] || '🤔';
    };

    const getBreathingExercise = () => {
        setExerciseType('breathing');
        setShowExercise(true);
    };

    const getMeditationExercise = () => {
        setExerciseType('meditation');
        setShowExercise(true);
    };

    const getGroundingExercise = () => {
        setExerciseType('grounding');
        setShowExercise(true);
    };

    const handleJournalSubmit = () => {
        if (journalEntry.trim()) {
            setJournal(prev => [...prev, {
                entry: journalEntry,
                mood: currentMood,
                timestamp: new Date().toISOString()
            }]);
            setJournalEntry('');
        }
    };

    const getTrendColor = (count) => {
        if (count > 5) return 'bg-green-100';
        if (count > 3) return 'bg-yellow-100';
        return 'bg-blue-100';
    };

    const formatDate = (date) => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Removed LLM and mental health rating calculations as they are now handled by the chatbot

    const calculateAverageMood = () => {
        if (Object.keys(moodStats).length === 0) return null;
        
        const totalMoods = Object.values(moodStats).reduce((a, b) => a + b, 0);
        const moodPercentages = Object.entries(moodStats).map(([mood, count]) => ({
            mood,
            percentage: Math.round((count / totalMoods) * 100)
        })).sort((a, b) => b.percentage - a.percentage);

        return {
            dominant: moodPercentages[0],
            secondary: moodPercentages[1] || null
        };
    };

    const renderExercise = () => {
        switch (exerciseType) {
            case 'breathing':
                return (
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-lg font-semibold mb-3">4-7-8 Breathing Exercise</h4>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Exhale completely through your mouth</li>
                            <li>Close your mouth and inhale through your nose for 4 seconds</li>
                            <li>Hold your breath for 7 seconds</li>
                            <li>Exhale completely through your mouth for 8 seconds</li>
                            <li>Repeat this cycle 4 times</li>
                        </ol>
                    </div>
                );
            case 'meditation':
                return (
                    <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="text-lg font-semibold mb-3">Quick Meditation</h4>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Find a comfortable sitting position</li>
                            <li>Close your eyes</li>
                            <li>Focus on your natural breathing</li>
                            <li>When your mind wanders, gently return focus to your breath</li>
                            <li>Practice for 5 minutes</li>
                        </ol>
                    </div>
                );
            case 'grounding':
                return (
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="text-lg font-semibold mb-3">5-4-3-2-1 Grounding Exercise</h4>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Name 5 things you can see</li>
                            <li>Name 4 things you can touch</li>
                            <li>Name 3 things you can hear</li>
                            <li>Name 2 things you can smell</li>
                            <li>Name 1 thing you can taste</li>
                        </ol>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-[480px] h-[360px] bg-gray-900 rounded-lg overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    width="480"
                    height="360"
                    className="absolute inset-0"
                    style={{ transform: 'scaleX(-1)' }}
                />
            </div>
            
            {/* Mood Display */}
            <div className="bg-white rounded-lg p-4 shadow-lg w-[480px]">
                <h3 className="mb-2 text-lg font-semibold">Current Mood</h3>
                {currentMood && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xl">
                            <span>{getMoodEmoji(currentMood)}</span>
                            <span className="capitalize">{currentMood}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full">
                                <div 
                                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${confidenceScore}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600">{confidenceScore}% confidence</span>
                        </div>
                    </div>
                )}
                
                {/* Average Mood Analysis */}
                <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Overall Mood Analysis</h4>
                    {calculateAverageMood() ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600 mb-2">Most of the time you feel:</div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getMoodEmoji(calculateAverageMood().dominant.mood)}</span>
                                        <div className="flex flex-col">
                                            <span className="font-medium capitalize">{calculateAverageMood().dominant.mood}</span>
                                            <span className="text-sm text-gray-500">{calculateAverageMood().dominant.percentage}% of the time</span>
                                        </div>
                                    </div>
                                </div>
                                {calculateAverageMood().secondary && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="text-sm text-gray-600 mb-2">Secondary mood:</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getMoodEmoji(calculateAverageMood().secondary.mood)}</span>
                                            <div className="flex flex-col">
                                                <span className="font-medium capitalize">{calculateAverageMood().secondary.mood}</span>
                                                <span className="text-sm text-gray-500">{calculateAverageMood().secondary.percentage}% of the time</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 italic">
                                Based on {Object.values(moodStats).reduce((a, b) => a + b, 0)} mood measurements
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic">
                            Not enough data to analyze mood patterns yet
                        </div>
                    )}
                </div>

                {/* LLM Analysis */}
                {llmAnalysis && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-purple-700">AI Insights</h4>
                        <p className="mt-1 text-sm text-purple-600">{llmAnalysis.analysis}</p>
                        {llmAnalysis.recommendations && (
                            <div className="mt-2">
                                <h5 className="text-sm font-semibold text-purple-700">Recommendations:</h5>
                                <ul className="mt-1 list-disc list-inside text-sm text-purple-600">
                                    {llmAnalysis.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Suggestions */}
                {suggestions && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-700">Suggestion</h4>
                        <p className="mt-1 text-sm text-blue-600">{suggestions}</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-4 shadow-lg w-[480px]">
                <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        className="p-3 bg-green-50 rounded-lg text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
                        onClick={getMeditationExercise}
                    >
                        Meditation
                    </button>
                    <button 
                        className="p-3 bg-purple-50 rounded-lg text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
                        onClick={getBreathingExercise}
                    >
                        Breathing
                    </button>
                    <button 
                        className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                        onClick={getGroundingExercise}
                    >
                        Grounding
                    </button>
                </div>
                
                {showExercise && (
                    <div className="mt-4">
                        {renderExercise()}
                        <button 
                            className="mt-3 w-full p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                            onClick={() => setShowExercise(false)}
                        >
                            Close Exercise
                        </button>
                    </div>
                )}
            </div>
            
            {/* Mood Trends */}
            <div className="bg-white rounded-lg p-4 shadow-lg w-[480px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Weekly Trends</h3>
                    <button 
                        className="text-blue-600 text-sm hover:text-blue-800"
                        onClick={() => setShowTrends(!showTrends)}
                    >
                        {showTrends ? 'Hide' : 'Show'} Trends
                    </button>
                </div>
                {showTrends && (
                    <div className="space-y-2">
                        {Object.entries(weeklyTrends).map(([date, moods]) => (
                            <div key={date} className="p-2 rounded-lg bg-gray-50">
                                <div className="text-sm font-medium">{date}</div>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {Object.entries(moods).map(([mood, count]) => (
                                        <div 
                                            key={mood} 
                                            className={`p-1 rounded text-xs ${getTrendColor(count)}`}
                                        >
                                            {getMoodEmoji(mood)} {count}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Journaling Section */}
            <div className="bg-white rounded-lg p-4 shadow-lg w-[480px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Mood Journal</h3>
                    <button 
                        className="text-blue-600 text-sm hover:text-blue-800"
                        onClick={() => setShowJournal(!showJournal)}
                    >
                        {showJournal ? 'Hide' : 'Show'} Journal
                    </button>
                </div>
                {showJournal && (
                    <div className="space-y-4">
                        <div>
                            <textarea
                                className="w-full p-2 border rounded-lg resize-none h-24"
                                placeholder="How are you feeling today?"
                                value={journalEntry}
                                onChange={(e) => setJournalEntry(e.target.value)}
                            />
                            <button
                                className="mt-2 w-full p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                                onClick={handleJournalSubmit}
                            >
                                Save Entry
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {journal.map((entry, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span>{getMoodEmoji(entry.mood)}</span>
                                        <span className="text-sm text-gray-600">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm">{entry.entry}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Export Data Button */}
            <div className="bg-white rounded-lg p-4 shadow-lg w-[480px]">
                <button 
                    className="w-full p-3 bg-indigo-50 rounded-lg text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
                    onClick={() => {
                        const data = {
                            moodHistory,
                            moodStats,
                            exportDate: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'mood-tracking-data.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }}
                >
                    Export Mood Data
                </button>
            </div>
        </div>
    );
}

export default FaceDetectionNew;
