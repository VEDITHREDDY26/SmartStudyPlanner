import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';

const AnimatedBackground = () => {
    const { darkMode } = useContext(ThemeContext);

    // Define colors based on theme
    const colors = darkMode
        ? ['#6366f1', '#a855f7', '#ec4899'] // Indigo 500, Purple 500, Pink 500 (Slightly softer)
        : ['#a5b4fc', '#c4b5fd', '#f9a8d4']; // Light Indigo, Light Violet, Light Pink (Light Mode)

    const backgroundStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        background: darkMode
            ? 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 60%, #020617 100%)' // Deep Indigo to Slate
            : 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)',
    };

    return (
        <div style={backgroundStyle}>
            {/* Floating Orbs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
                    opacity: 0.2,
                    filter: 'blur(60px)',
                }}
            />

            <motion.div
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.5, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
                    opacity: 0.15,
                    filter: 'blur(80px)',
                }}
            />

            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '30%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
                    opacity: 0.2,
                    filter: 'blur(50px)',
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
