import React from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

import useQRSystem from '../hooks/useQRSystem';

const TerminalLayout = () => {
    const {
        logs,
        qrOptions,
        isTerminalMode,
        commandHistory,
        animationTrigger,
        rightPanelRef,
        fileInputRef,
        handleCommand,
        handleFileUpload
    } = useQRSystem();

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '70% 30%',
            height: '100vh',
            width: '100vw',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden' // Prevent full page scroll
        }}>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
            />

            <div className="scanlines" />
            <img
                src="/logo_.png"
                alt="QRYX Logo"
                style={{
                    position: 'absolute',
                    top: 'var(--spacing-lg)',
                    left: 'var(--spacing-lg)',
                    width: '100px',
                    zIndex: 50,
                    opacity: 0.9
                }}
            />
            <LeftPanel
                onCommand={handleCommand}
                isTerminalMode={isTerminalMode}
                commandHistory={commandHistory}
            />
            <RightPanel ref={rightPanelRef} qrOptions={qrOptions} logs={logs} isTerminalMode={isTerminalMode} animationTrigger={animationTrigger} />
        </div>
    );
};

export default TerminalLayout;
