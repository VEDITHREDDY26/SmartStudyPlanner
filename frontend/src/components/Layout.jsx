import React from 'react';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 relative">
            <AnimatedBackground />
            <ToastContainer 
                position="top-right" 
                autoClose={3000} 
                theme="dark"
                style={{ zIndex: 9999 }}
            />
            <Navbar />
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
};

export default Layout;
