import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/loading.json';

const Preloader = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Min loading time to prevent flicker usually, but here we just show it until app ready
        // For manual control simulation or "fake load", we can set a timer.
        // Let's assume the app loads fast, so we give it at least 2.5 seconds to show off the animation
        const timer = setTimeout(() => {
            setOpacity(0);
            setTimeout(() => {
                setIsVisible(false);
                if (onComplete) onComplete();
            }, 500); // Wait for fade out
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0, // Ensures full coverage regardless of scrollbar
            backgroundColor: '#1e1e1e',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            transition: 'opacity 0.5s ease-out',
            opacity: opacity,
            pointerEvents: 'none'
        }}>
            <div style={{
                width: 'clamp(500px, 60vw, 800px)', // Responsive width: min 300px, preferred 50vw, max 600px
                maxWidth: '90%', // Ensure it fits on very small screens
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    autoplay={true}
                    renderer="svg"
                    style={{ width: '100%', height: 'auto' }}
                />
            </div>
        </div>
    );
};

export default Preloader;
