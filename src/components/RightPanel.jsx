import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import Lottie from 'lottie-react';
import qrRevealAnimation from '../../public/qr-reveal-animation.json';
import qrAnimation from '../../public/qr-animation.json';

const RightPanel = forwardRef(({ qrOptions, logs, isTerminalMode, animationTrigger }, ref) => {
    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const logsRef = useRef(null);
    const lottieRef = useRef(null);
    const revealLottieRef = useRef(null);
    const [geo, setGeo] = useState({ lat: '--.-', long: '--.-' });
    const [mem, setMem] = useState('00.0');
    const [exportFormat, setExportFormat] = useState('png');

    // Helper to convert Hex to Lottie RGB (0-1 range)
    const hexToLottieColor = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [0, 1, 0.255]; // Default Green
    };

    // Memoize the modified animation data to avoid expensive re-calculations
    // This recursively updates all fill colors in the Lottie JSON
    const modifiedAnimationData = React.useMemo(() => {
        // Deep clone the animation data
        const newData = JSON.parse(JSON.stringify(qrRevealAnimation));
        const targetColor = hexToLottieColor(qrOptions?.dotsOptions?.color || '#00ff41');

        const updateColor = (layers) => {
            if (!layers) return;
            layers.forEach(layer => {
                if (layer.shapes) {
                    layer.shapes.forEach(shape => {
                        // "fl" is the shape type for Fill
                        if (shape.ty === 'fl') {
                            shape.c.k = targetColor;
                        }
                        // Recursive check for group ("gr") items
                        if (shape.it) {
                            shape.it.forEach(item => {
                                if (item.ty === 'fl') {
                                    item.c.k = targetColor;
                                }
                            });
                        }
                    });
                }
                // Check if layer has nested layers (precomps) - typically "assets" in root handles this, 
                // but checking children structure just in case, though usually flat or referenced by refId
            });
        };

        // Update main layers
        updateColor(newData.layers);

        // Update assets (precomps)
        if (newData.assets) {
            newData.assets.forEach(asset => {
                updateColor(asset.layers);
            });
        }

        return newData;
    }, [qrOptions?.dotsOptions?.color]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        exportQR: (name, format = exportFormat) => {
            if (qrCode.current) {
                // Ensure format is valid, default to current state or png
                const ext = ['png', 'svg', 'jpeg', 'jpg'].includes(format) ? format : 'png';
                // qr-code-styling expects 'jpeg' not 'jpg' usually.
                const finalExt = ext === 'jpg' ? 'jpeg' : ext;

                qrCode.current.download({ name: name || 'qr-code', extension: finalExt });
            }
        }
    }));

    // Fetch Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setGeo({
                        lat: position.coords.latitude.toFixed(4),
                        long: position.coords.longitude.toFixed(4)
                    });
                },
                (err) => {
                    console.warn("Geo access denied/error", err);
                    setGeo({ lat: 'N/A', long: 'N/A' });
                }
            );
        }
    }, []);

    // Poll Memory Usage
    useEffect(() => {
        const updateMem = () => {
            if (window.performance && window.performance.memory) {
                // Chrome/Chromium specific
                const used = window.performance.memory.usedJSHeapSize / (1024 * 1024);
                setMem(used.toFixed(1));
            } else {
                // Simulation fallback for other browsers
                setMem(prev => {
                    const base = parseFloat(prev) || 20;
                    const diff = (Math.random() - 0.5) * 2;
                    return Math.max(10, (base + diff)).toFixed(1);
                });
            }
        };

        const interval = setInterval(updateMem, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            lottieRef.current?.play();
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Define default options locally to merge with props
        const options = {
            width: 300,
            height: 300,
            type: 'svg',
            data: 'https://www.example.com',
            image: '',
            dotsOptions: {
                color: '#00ff41',
                type: 'square'
            },
            backgroundOptions: {
                color: 'transparent',
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 20
            },
            ...qrOptions
        };

        // Re-instantiate to ensure clean state (fixes export stale image bug)
        qrCode.current = new QRCodeStyling(options);

        // Append to DOM if visible
        if (isTerminalMode && qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }, [qrOptions, isTerminalMode]);

    // Auto scroll logs
    useEffect(() => {
        if (logsRef.current) {
            logsRef.current.scrollTop = logsRef.current.scrollHeight;
        }
    }, [logs]);



    // Play reveal animation on trigger
    useEffect(() => {
        if (isTerminalMode && revealLottieRef.current) {
            revealLottieRef.current.goToAndPlay(0);
        }
    }, [animationTrigger, isTerminalMode]);

    const handleExportClick = () => {
        if (qrCode.current) {
            // Map jpg to jpeg for library compatibility
            const finalExt = exportFormat === 'jpg' ? 'jpeg' : exportFormat;
            qrCode.current.download({ name: 'qr-code', extension: finalExt });
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: 'var(--spacing-lg)',
            position: 'relative'
        }}>
            {/* Telemetry Corner */}
            <div style={{
                position: 'absolute',
                top: 'var(--spacing-lg)',
                right: 'var(--spacing-lg)', // Move to right side as per design
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--color-neon-green)'
            }}>
                {isTerminalMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            background: 'var(--color-neon-green)',
                            borderRadius: '0px'
                        }} />
                        <span style={{ letterSpacing: '0.1em' }}>MODE: [PREVIEW]</span>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '6px', height: '6px', background: 'var(--color-alert-red)', borderRadius: '50%' }} className="animate-blink" />
                            <span>LIVE</span>
                        </div>
                        <div>LAT : {geo.lat}</div>
                        <div>LONG: {geo.long}</div>
                    </>
                )}

                {/* Decorative corner bracket */}
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '20px',
                    height: '20px',
                    borderTop: '2px solid var(--color-text-muted)',
                    borderRight: '2px solid var(--color-text-muted)'
                }} />
            </div>

            {/* QR Display Section */}
            <div style={{
                flex: 2, // Takes up more space to push logs down
                display: 'flex',
                flexDirection: 'column',
                alignItems: isTerminalMode ? 'center' : 'flex-end', // Center in terminal, right in landing
                justifyContent: 'center', // Center vertically
                paddingRight: 'var(--spacing-lg)',
                marginTop: '120px', // Push down to avoid overlap with telemetry
                position: 'relative',
                width: '100%', // Ensure it takes full width for centering
            }}>
                {isTerminalMode && (
                    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}>
                            <Lottie
                                lottieRef={revealLottieRef}
                                animationData={modifiedAnimationData}
                                loop={false}
                                autoplay={true}
                                renderer="svg"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <div ref={qrRef} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}

                {!isTerminalMode && (
                    <Lottie
                        lottieRef={lottieRef}
                        animationData={qrAnimation}
                        loop={false}
                        autoplay={false}
                        renderer="svg"
                        style={{ width: '300px', height: '300px' }}
                    />
                )}

                {/* Terminal Mode: Verification Status */}
                {isTerminalMode && (
                    <div style={{
                        width: '300px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: '#666',
                        padding: '16px',
                        border: '1px solid #222',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        marginTop: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>&gt; VERIFYING CHECKSUM...</span>
                            <span style={{ color: 'var(--color-neon-green)' }}>OK</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>&gt; OPTIMIZING PIXELS...</span>
                            <span style={{ color: 'var(--color-neon-green)' }}>OK</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Landing Mode: System Logs & Memory Usage */}
            {!isTerminalMode && (
                <>
                    {/* System Logs Section */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        paddingRight: 'var(--spacing-lg)',
                        marginBottom: '60px' // Lift above Memory Usage
                    }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            color: 'var(--color-alert-red)',
                            marginBottom: 'var(--spacing-md)',
                            fontSize: '1.2rem',
                            letterSpacing: '0.1em'
                        }}>
                            SYSTEM LOGS
                        </h3>
                        <div ref={logsRef} style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            textAlign: 'right',
                            height: '150px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            {logs.map((log, i) => (
                                <div key={i}>
                                    <span style={{ opacity: 0.5 }}>[{log.time}]</span>{' '}
                                    <span style={{ color: log.type === 'success' ? 'var(--color-neon-green)' : 'inherit' }}>
                                        {log.msg.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Memory Usage - Bottom Right */}
                    <div style={{
                        position: 'absolute',
                        bottom: 'var(--spacing-lg)',
                        right: 'var(--spacing-lg)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--color-neon-green)'
                    }}>
                        {/* Decorative Corner */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-10px',
                            right: '-10px',
                            width: '20px',
                            height: '20px',
                            borderBottom: '2px solid var(--color-text-muted)',
                            borderRight: '2px solid var(--color-text-muted)'
                        }} />
                        MEMORY USG: {mem}mb
                    </div>
                </>
            )}

            {/* Terminal Mode: Config & Export Buttons */}
            {isTerminalMode && (
                <div style={{
                    position: 'absolute',
                    bottom: 'var(--spacing-lg)',
                    right: 'var(--spacing-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 'var(--spacing-md)'
                }}>
                    <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid var(--color-text-muted)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-mono)',
                            padding: '10px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            outline: 'none',
                            height: '42px', // Match button height roughly
                            textTransform: 'uppercase'
                        }}
                    >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="svg">SVG</option>
                    </select>


                    <button
                        onClick={handleExportClick}
                        style={{
                            background: 'var(--color-alert-red)',
                            border: '1px solid var(--color-alert-red)',
                            color: '#000',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            padding: '10px 24px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--color-alert-red)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'var(--color-alert-red)';
                            e.target.style.color = '#000';
                        }}
                    >
                        EXPORT
                    </button>
                </div>
            )}
        </div>
    );
});

export default RightPanel;
