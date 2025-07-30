import React, { useState, useEffect, useCallback } from "react";
import { FaPaperPlane, FaMicrophone } from "react-icons/fa";
import FaceDetectionNew from './FaceDetectionNew';
import ExpertPanel from './ExpertPanel';

const ChatBot = () => {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]); // Tracks conversation history
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [moodData, setMoodData] = useState(null);
    const [mentalHealthRating, setMentalHealthRating] = useState(null);
    const [showExpertPanel, setShowExpertPanel] = useState(false);

    const apiKey = import.meta.env.VITE_GEMENI_API_KEY;

    const handleSubmit = useCallback(async () => {
        if (!question.trim()) return;
        const userMessage = question;
        setQuestion("");
        await fetchChatbotResponse(userMessage);
    }, [question]);

    const fetchChatbotResponse = async (userMessage) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        try {
            console.log("Sending request with API key:", apiKey); // For debugging
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gemini-1.0-pro",
                        contents: [{
                            role: "user",
                            parts: [{
                                text: `Act as Alex, an empathetic mental health assistant your main taask is to understand the user and his problem and you have to analyse his problem provide solution and also keep him interacted with you you have see if he is in depression or not and if you find he is in depression console him and make him comfortable, act like a bestfriend. Your task:
                                  1. Create a safe space for users
                                  2. Provide supportive responses and suggestions
                                  3. Recommend professional help when needed
                                  
                                  Guidelines:
                                  - Validate emotions before suggestions
                                  - Keep responses brief and clear
                                  - Share crisis hotline (1-800-273-8255) if needed
                                  - Never diagnose or prescribe medication
                                  
                                  Key Questions:
                                  1. Current mood and energy levels?
                                  2. Sleep and concentration?
                                  3. Interest in activities?
                                  4. Stress management?
                                  5. Support system and thoughts of self-harm?
                                  
                                  User's Emotional State Data:
                                  ${moodData ? `
                                  - Current Mood: ${moodData.currentMood} (${moodData.confidenceScore}% confidence)
                                  - Dominant Mood Pattern: ${moodData.dominantMood?.mood} (${moodData.dominantMood?.percentage}% of the time)
                                  ${moodData.secondaryMood ? `- Secondary Mood Pattern: ${moodData.secondaryMood.mood} (${moodData.secondaryMood.percentage}% of the time)` : ''}
                                  - Mood History Statistics: ${JSON.stringify(moodData.moodStats)}
                                  ` : 'No emotion data available yet'}

                                  Previous conversation: ${JSON.stringify(messages)}
                                  User's message: "${userMessage}"
                                  
                                  Task:
                                  1. Analyze message and emotion data briefly
                                  2. Generate a mental health rating (0-100) considering:
                                     - Current mood and confidence level
                                     - Mood patterns
                                     - Message content
                                     - Previous chat history
                                  3. Provide a concise response:
                                     - Keep under 3 sentences
                                     - Include one specific suggestion if needed
                                     - End with a brief follow-up question
                                  4. Maintain empathy while being brief
                                  
                                  Note: The mental health rating should consider both positive and negative factors:
                                  - Higher ratings for: consistent positive moods, engagement in conversation, use of coping strategies
                                  - Lower ratings for: persistent negative moods, signs of distress, concerning language
                                  Always explain the rating in a constructive and supportive way.
                                  
                                  Always respond in this exact format (including for first message):

                                  [2-3 sentences maximum for response]

                                  [Single follow-up question]

                                  [RATING (hidden from user): number between 0-100]'}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                        ]
                    })
                }
            );
            const data = await response.json();
            console.log("API Response Status:", response.status);
            console.log("API Response:", data);
            
            if (!response.ok) {
                console.error("API Error Response:", data);
                throw new Error(`API Error: ${response.status} - ${JSON.stringify(data.error || {})}`);
            }

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No response generated by the API");
            }

            const answer = data.candidates[0]?.content?.parts?.[0]?.text;
            if (!answer) {
                throw new Error("Invalid response format from API");
            }

            // Extract mental health rating from the response
            const ratingMatch = answer.match(/\[RATING \(hidden from user\): (\d+)\]/);
            let processedAnswer = answer;
            
            if (ratingMatch) {
                const newRating = parseInt(ratingMatch[1]);
                if (newRating >= 0 && newRating <= 100) {
                    setMentalHealthRating(newRating);
                }
                // Remove the rating line from display
                processedAnswer = answer.replace(/\[RATING \(hidden from user\): \d+\]/, '').trim();
            }

            // Update messages
            setMessages([...messages, { user: userMessage, bot: processedAnswer }]);
            speakText(processedAnswer); // Read response aloud
        } catch (error) {
            console.error("Error generating answer:", error);
            alert("Sorry, I couldn't generate an answer. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Voice Input (Speech-to-Text)
    const startListening = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            handleSubmit();
        };

        recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    // Text-to-Speech for chatbot responses
    const speakText = (text) => {
        if ("speechSynthesis" in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 1;
            
            // Try to find a female voice
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.name.includes("Female") || voice.name.includes("Samantha"));
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Initialize the chat
        if (messages.length === 0) {
            fetchChatbotResponse("Hello");
        }
        // Load available voices
        window.speechSynthesis.getVoices();
    }, []);

    const downloadUserData = () => {
        // Prepare data for download
        const data = {
            mentalHealthRating,
            moodData,
            chatHistory: messages
        };
        
        // Create blob and download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mental-health-report.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="flex w-full min-h-screen gap-6 p-6 bg-gray-100">
            {/* Left Side - Face Detection */}
            <div className="w-[500px] flex-shrink-0">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <h2 className="mb-4 text-lg font-semibold text-teal-600">Emotion Analysis</h2>
                    <FaceDetectionNew onMoodUpdate={setMoodData} />
                </div>
            </div>

            {/* Right Side - Chat Interface */}
            <div className="flex flex-col flex-1 bg-white rounded-lg shadow-xl h-[88vh]">
                {/* Header */}
                <div>
                    {/* Mental Health Rating Banner */}
                    <div className="flex items-center justify-center px-6 py-2 text-white bg-gradient-to-r from-teal-700 to-teal-500">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Current Mental Health Index:</span>
                            <div className="px-4 py-1 bg-white text-teal-700 rounded-full font-bold min-w-[4rem] text-center text-lg shadow-inner">
                                {mentalHealthRating ?? '--'}%
                            </div>
                        </div>
                    </div>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 text-white bg-teal-600">
                        <h3 className="text-xl font-medium">Chat with Alex - Your Mental Health Assistant</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowExpertPanel(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-teal-700 transition-colors bg-white rounded hover:bg-teal-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Book Appointment
                            </button>
                            <button
                                onClick={downloadUserData}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-teal-700 transition-colors bg-white rounded hover:bg-teal-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Report
                            </button>
                            <div className="ml-4 text-sm">Safe Space for Mental Wellness</div>
                        </div>
                    </div>
                </div>

                {/* Chat content */}
                <div className="flex-1 p-6 overflow-auto bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-6">
                            <div className="flex flex-col gap-4">
                                {/* User message */}
                                <div className="flex justify-end">
                                    <div className="bg-teal-100 text-teal-900 p-4 rounded-lg max-w-[80%]">
                                        <div className="mb-1 font-medium">You</div>
                                        <div>{msg.user}</div>
                                    </div>
                                </div>
                                
                                {/* Bot message */}
                                <div className="flex justify-start">
                                    <div className="bg-white shadow-md p-4 rounded-lg max-w-[80%]">
                                        <div className="mb-1 font-medium text-teal-600">Alex</div>
                                        <div className="text-gray-700">{msg.bot}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input area */}
                <div className="p-4 bg-white border-t">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Type your message here..."
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !question.trim()}
                            className="px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPaperPlane />
                        </button>
                        <button
                            onClick={startListening}
                            disabled={isLoading || isListening}
                            className="px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaMicrophone />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expert Panel */}
            {showExpertPanel && (
                <ExpertPanel onClose={() => setShowExpertPanel(false)} />
            )}
        </div>
    );
};

export default ChatBot;
