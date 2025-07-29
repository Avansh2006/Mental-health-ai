import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OfferLetter from './OfferLater';
import { useLocation } from "react-router-dom";

const Dashboard = () => {
    const location = useLocation();
    const [Progress, setProgress] = useState('')
    const [steps, setSteps] = useState([
        { name: "Offer Letter", completed: false, active: false, value: 1, path: "/offer-letter" },
        { name: "Verification", completed: false, active: false, value: 2, path: "/verify-document" },
        { name: "Complete", completed: false, active: false, value: 3, path: "/compleated" },
    ]);

    const userData = {
        name: user?.fullName || "Pradeep",
        progress: Progress,
        totalSteps: 3,
        hrContact: {
            name: "Sarah Johnson",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        tasks: {
            personalInfo: 75,
            bankDetails: 30,
            itSetup: 50
        },
        documents: {
            offerLetter: "Signed",
            idCard: "Pending",
            addressProof: "Missing"
        },
        daysRemaining: 3
    };

    useEffect(() => {
        const currentPath = location.pathname;
        const currentStepValue = routeStepMap[currentPath];
        
        if (currentStepValue) {
            setProgress(currentStepValue);
            
            // Update steps based on current location
            setSteps(prevSteps => prevSteps.map(step => {
                // Mark previous steps as completed
                if (step.value < currentStepValue) {
                    return { ...step, completed: true, active: false };
                }
                // Mark current step as active
                else if (step.value === currentStepValue) {
                    return { ...step, active: true, completed: false };
                }
                // Future steps are neither active nor completed
                else {
                    return { ...step, active: false, completed: false };
                }
            }));
        }
    }, [location.pathname]);


    // Helper function to determine status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'signed': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'missing': return 'bg-red-500';
            default: return 'bg-gray-300';
        }
    };

    

    // const steps = [
    //     { name: "Offer Letter", completed: false, value: 1, path: "/offer-letter" },
    //     { name: "Verification", completed: false, active: true, value: 2, path: "/verification" },
    //     { name: "Complete", completed: false, value: 3, path: "/complete" },
    //   ];

          // Map routes to their corresponding step numbers
    const routeStepMap = {
        '/offer-letter': 1,
        '/verify-document': 2,
        '/compleated': 3
    };

    // Update the progress whenever location changes
    useEffect(() => {
        const currentPath = location.pathname;
        if (routeStepMap[currentPath]) {
            setProgress(routeStepMap[currentPath]);
        }
    }, [location.pathname]);

    const UserProfile = () => {
        return (
            <div className="flex items-center justify-center  rounded-full bg-gray-200 ">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton  appearance={{ elements: { avatarBox: { width: "70px", height: "70px" }, } }} />
                </SignedIn>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 ">

            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div className='flex items-center'>
                            <UserProfile />
                            <div className="ml-4">
                                <h1 className="text-3xl font-bold text-gray-800">Welcome, {userData.name}!</h1>
                                <p className="text-gray-500 mt-1">We're excited to have you on board.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Step {userData.progress} of {userData.totalSteps} Completed</p>
                            <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                                <div
                                    className="h-2 bg-blue-500 rounded-full"
                                    style={{ width: `${(userData.progress / userData.totalSteps) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between mx-8 items-center">
                        {steps.map((step, index) => (
                            <Link
                                to={step.name === "Offer Letter" ? "/offer-letter" : step.name === "Verification" ? "/verify-document" : step.name === "Complete" ? "/compleated" : "#"} // Add your routes here
                                key={index}
                                className={`flex flex-col items-center ${step.active ? 'text-blue-600 font-medium' : step.completed ? 'text-green-500' : 'text-gray-400'}`}
                            >
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step.active ? 'border-blue-600 text-blue-600' :
                                    step.completed ? 'border-green-500 bg-green-500 text-white' :
                                        'border-gray-300 text-gray-300'
                                    }`}>
                                    {step.completed ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="mt-2 text-sm">{step.name}</span>
                                {index < steps.length - 1 && (
                                    <div className="hidden sm:block absolute left-0 w-full h-0.5 bg-gray-200 -z-10" style={{ top: '2.25rem' }}></div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Status Cards Section */}

                {/* Two Column Layout for Tasks and Documents */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Task Status</h3>

                        <div className="mb-6">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Personal Information</span>
                                <span className="text-sm font-medium text-gray-700">{userData.tasks.personalInfo}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${userData.tasks.personalInfo}%` }}></div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Bank Details</span>
                                <span className="text-sm font-medium text-gray-700">{userData.tasks.bankDetails}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${userData.tasks.bankDetails}%` }}></div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">IT Setup</span>
                                <span className="text-sm font-medium text-gray-700">{userData.tasks.itSetup}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${userData.tasks.itSetup}%` }}></div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Documents Status</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-gray-700">Offer Letter</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.documents.offerLetter)} bg-opacity-20 text-green-800`}>
                                    {userData.documents.offerLetter}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-gray-700">ID Card</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.documents.idCard)} bg-opacity-20 text-yellow-800`}>
                                    {userData.documents.idCard}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-gray-700">Address Proof</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.documents.addressProof)} bg-opacity-20 text-red-800`}>
                                    {userData.documents.addressProof}
                                </span>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* <OfferLetter/> */}
            </div>
        </div>
    );
};

export default Dashboard;
