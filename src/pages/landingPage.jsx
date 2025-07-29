import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationComplete(true);
        }, 2000); // Animation completion time

        return () => clearTimeout(timer);
    }, []);
    const UserProfile = () => {
        return (
            <div className="flex items-center justify-center rounded-full ">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-800">
            <div className="relative flex flex-col items-center justify-center w-full h-screen">
                {/* Logo and Name Animation */}
                <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                    }}
                >
                    {/* Replace with your actual logo */}
                    <motion.div
                        className="flex items-center justify-center w-32 h-32 mb-6 text-white bg-blue-500 rounded-full md:w-40 md:h-40"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-4xl font-bold md:text-5xl"><img src="/" alt="" /></span>
                    </motion.div>

                    <motion.h1
                        className="mb-6 text-4xl font-bold text-center md:text-6xl text-slate-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        Mental Wellness Assistant
                    </motion.h1>
                </motion.div>

                {/* Tagline and Button Section */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                        opacity: animationComplete ? 1 : 0,
                        y: animationComplete ? 0 : 50
                    }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="mb-8 text-xl md:text-2xl text-slate-600">
                        Your innovative solution for modern problems
                    </h2>

                    <motion.button
                        className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-full shadow-lg"
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "#2563eb" // blue-700
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                        }}
                    >
                        
                        <UserProfile/>
                    </motion.button>
                </motion.div>
            </div>

            {/* Optional scrolling indicator after animation completes */}
            {animationComplete && (
                <motion.div
                    className="absolute bottom-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="flex items-center justify-center w-8 h-12 border-2 rounded-full border-slate-500"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <div className="w-1.5 h-3 bg-slate-500 rounded-full"></div>
                    </motion.div>
                    <p className="mt-2 text-sm text-slate-500">Scroll Down</p>
                </motion.div>
            )}
        </div>
    );
};

export default LandingPage;
