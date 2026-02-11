import React, { useEffect, useRef, useState } from 'react';
import useQRSystem from '../hooks/useQRSystem';
import QRCodeStyling from 'qr-code-styling';
import Lottie from 'lottie-react';
import qrAnimation from '../../public/qr-animation.json';

const MobileLayout = () => {
    const {
        qrOptions,
        isTerminalMode,
        handleCommand,
        fileInputRef,
        handleFileUpload,
    } = useQRSystem();

    const [inputValue, setInputValue] = useState('');
    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const [exportFormat, setExportFormat] = useState('png');

    // QR Code Initialization & Update (Similar to RightPanel but simplified for mobile)
    useEffect(() => {
        const options = {
            width: 250, // Smaller for mobile
            height: 250,
            type: 'svg',
            ...qrOptions,
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 10,
                ...qrOptions.imageOptions
            }
        };
        qrCode.current = new QRCodeStyling(options);
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }, [qrOptions, isTerminalMode]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(inputValue);
            setInputValue('');
        }
    };

    const handleExport = () => {
        if (qrCode.current) {
            const finalExt = exportFormat === 'jpg' ? 'jpeg' : exportFormat;
            qrCode.current.download({ name: 'qr-code-mobile', extension: finalExt });
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            width: '100vw',
            maxWidth: '100%',
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden',
            position: 'relative',
            padding: '12px 16px',
            boxSizing: 'border-box'
        }}>
            {/* Hidden File Input for /add logo */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
            />
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <img src="/logo_.png" alt="QRYX" style={{ height: '30px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-alert-red)' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-alert-red)', borderRadius: '50%' }} />
                    <span>LIVE</span>
                </div>
            </div>

            {/* Hero Text */}
            <div style={{ marginBottom: '16px', borderLeft: '4px solid var(--color-alert-red)', paddingLeft: '16px' }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    lineHeight: '1.1',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    color: '#fff'
                }}>
                    HELLO EVERYONE
                </h1>
                <p style={{
                    fontSize: '0.7rem',
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Build a system for generating customizable QR codes.
                </p>
            </div>

            {/* QR Display */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                minHeight: 0,
                overflow: 'hidden'
            }}>
                {/* Crosshairs / Brackets */}
                <div style={{
                    position: 'absolute',
                    width: '280px',
                    height: '280px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Corner Brackets */}
                    <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '20px', height: '20px', borderTop: '1px solid #fff', borderLeft: '1px solid #fff' }} />
                    <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '20px', height: '20px', borderTop: '1px solid #fff', borderRight: '1px solid #fff' }} />
                    <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '20px', height: '20px', borderBottom: '1px solid #fff', borderLeft: '1px solid #fff' }} />
                    <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '20px', height: '20px', borderBottom: '1px solid #fff', borderRight: '1px solid #fff' }} />

                    {/* Center Cross */}
                    <div style={{ position: 'absolute', top: '50%', left: '-10%', width: '120%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: '-10%', height: '120%', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Lottie Animation (default) or Generated QR */}
                {!isTerminalMode ? (
                    <div style={{ width: '250px', height: '250px', zIndex: 10 }}>
                        <Lottie
                            animationData={qrAnimation}
                            loop={false}
                            autoplay={true}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                ) : (
                    <div ref={qrRef} style={{ width: '250px', height: '250px', zIndex: 10 }} />
                )}
            </div>

            {/* Export Controls */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '12px',
                marginTop: 'auto',
                flexShrink: 0
            }}>
                <div style={{
                    flex: 1,
                    border: '1px solid var(--color-alert-red)',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-alert-red)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            width: '100%',
                            textAlign: 'center',
                            textTransform: 'uppercase'
                        }}
                    >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="svg">SVG</option>
                    </select>
                    {/* Custom Arrow */}
                    <span style={{ position: 'absolute', right: '10px', color: 'var(--color-alert-red)', fontSize: '0.7rem', pointerEvents: 'none' }}>^</span>
                </div>

                <button
                    onClick={handleExport}
                    style={{
                        flex: 1,
                        backgroundColor: 'var(--color-alert-red)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                    }}
                >
                    EXPORT
                </button>
            </div>

            {/* Command Input */}
            <div style={{
                backgroundColor: '#0c0c0c',
                borderLeft: '4px solid var(--color-alert-red)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '0 4px 4px 0',
                flexShrink: 0,
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}>
                <span style={{ color: 'var(--color-alert-red)', marginRight: '10px', fontWeight: 'bold', flexShrink: 0 }}>qryx:~</span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type A Command"
                    spellCheck="false"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        outline: 'none',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </div>
    );
};

export default MobileLayout;
