import React from 'react';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 relative">
            <AnimatedBackground />
            <Navbar />
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
};

export default Layout;
