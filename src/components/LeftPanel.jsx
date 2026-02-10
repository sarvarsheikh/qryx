import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const CommandButton = ({ cmd, label, fullWidth, onClick }) => {
    return (
        <motion.div
            className="command-btn"
            style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}
            onClick={() => onClick(cmd)}
            initial="initial"
            whileHover="hover"
        >
            {/* The expanding fill element */}
            <motion.div
                className="command-btn-fill"
                variants={{
                    initial: { width: '12px', backgroundColor: '#444' },
                    hover: { width: '120%', backgroundColor: '#FF5555' }
                }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1,
                    borderRadius: '0px'
                }}
            >
                {/* The "Bump" on the leading edge */}
                <motion.div
                    style={{
                        position: 'absolute',
                        right: '-8px',
                        top: '50%',
                        translateY: '-50%',
                        width: '16px',
                        height: '16px',
                        backgroundColor: 'inherit',
                        borderRadius: '50%',
                        zIndex: 1
                    }}
                />
            </motion.div>

            <code className="command-btn-text" style={{ position: 'relative', zIndex: 2 }}>{label}</code>
        </motion.div>
    );
};

const LeftPanel = ({ onCommand, isTerminalMode, commandHistory }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onCommand(inputValue);
            setInputValue('');
        }
    };

    // Auto-scroll to bottom of history
    const historyEndRef = useRef(null);
    useEffect(() => {
        if (historyEndRef.current) {
            historyEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [commandHistory]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: 'var(--spacing-lg)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            background: 'linear-gradient(90deg, #050505 0%, #080808 100%)',
            overflow: 'hidden' // Contain children
        }}>
            {/* Spacer to push content to bottom - Only in Landing Mode */}
            {!isTerminalMode && <div style={{ flex: 1 }}></div>}

            {/* Header Block Switch */}
            <div style={{ marginBottom: isTerminalMode ? 'var(--spacing-lg)' : 'var(--spacing-xl)', position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)'
                }}>
                    {/* Red Striped Graphic Recreation using CSS */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        transform: 'skewX(-30deg)',
                        height: '40px',
                        marginRight: '10px'
                    }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{
                                width: '10px',
                                height: '100%',
                                background: '#ffffff',
                                opacity: 0.0,
                                boxShadow: '0 0 10px #1e1e1e'
                            }} />
                        ))}
                    </div>
                    {isTerminalMode && (
                        <h2 style={{
                            fontFamily: 'var(--font-mono)',
                            color: '#e0e0e0',
                            fontSize: '1.5rem',
                            letterSpacing: '0.05em'
                        }}>
                            TERMINAL_ACCESS
                        </h2>
                    )}
                </div>

                {!isTerminalMode && (
                    <div style={{
                        marginTop: 'var(--spacing-lg)',
                        borderLeft: '4px solid var(--color-alert-red)',
                        paddingLeft: 'var(--spacing-md)'
                    }}>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '3.5rem',
                            letterSpacing: '0.05em',
                            lineHeight: '1',
                            color: 'var(--color-text-primary)'
                        }}>
                            HELLO EVERYONE
                        </h1>
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1rem',
                            color: 'var(--color-text-secondary)',
                            marginTop: 'var(--spacing-sm)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            Build a system for generating customizable QR codes.
                        </p>
                    </div>
                )}
            </div>

            {/* Content Switch: Commands Grid vs History Log */}
            {isTerminalMode ? (
                <div style={{
                    flex: 1,
                    minHeight: 0, // Critical for flex child scrolling
                    backgroundColor: '#0c0c0c',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: 'var(--spacing-lg)',
                    overflowY: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    border: '1px solid #1a1a1a',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                }}>
                    {commandHistory.map((entry, i) => (
                        <div key={i} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--color-alert-red)', marginRight: '10px', fontWeight: 'bold' }}>qryx:~</span>
                                <span style={{ color: '#ccc' }}>{entry.cmd}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <div style={{
                                    background: entry.type === 'success' ? '#0f291e' : 'rgba(255, 51, 51, 0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '2px',
                                    color: entry.type === 'success' ? 'var(--color-neon-green)' : 'var(--color-alert-red)',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                    marginRight: '10px',
                                    marginTop: '2px',
                                    letterSpacing: '0.05em'
                                }}>
                                    {entry.type === 'success' ? 'SUCCESS' : 'ERROR'}
                                </div>
                                <span style={{
                                    color: entry.type === 'success' ? 'var(--color-neon-green)' : '#eee',
                                    whiteSpace: 'pre-wrap',
                                    fontWeight: entry.type === 'success' ? 'bold' : 'normal'
                                }}>
                                    {entry.response}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={historyEndRef} />
                </div>
            ) : (
                <div style={{ display: 'flex', marginBottom: 'var(--spacing-lg)' }}>

                    {/* Vertical Decorative Line */}
                    <div style={{
                        width: '2px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        marginRight: 'var(--spacing-lg)',
                        position: 'relative',
                        alignSelf: 'stretch'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '40px',
                            background: 'var(--color-text-primary)',
                            position: 'absolute',
                            top: 0,
                            left: '-1px'
                        }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--spacing-md)',
                            fontSize: '1.5rem',
                            letterSpacing: '0.05em'
                        }}>
                            COMMANDS
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 'var(--spacing-md)',
                            maxWidth: '500px'
                        }}>
                            <CommandButton cmd="/generate " label="/generate [URL]" fullWidth={true} onClick={setInputValue} />
                            <CommandButton cmd="/color -bg " label="/color -bg [HEX]" fullWidth={true} onClick={setInputValue} />
                            <CommandButton cmd="/color -fg " label="/color -fg" fullWidth={false} onClick={setInputValue} />
                            <CommandButton cmd="/add logo " label="/add logo" fullWidth={false} onClick={setInputValue} />
                        </div>
                    </div>
                </div>
            )}


            {/* Terminal Input Area */}
            <div style={{
                marginTop: '0',
                background: '#0c0c0c',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #1a1a1a',
                flexShrink: 0 // Prevent input shrinking
            }}>
                <div style={{
                    height: '20px',
                    width: '4px',
                    background: 'var(--color-alert-red)',
                    marginRight: 'var(--spacing-sm)'
                }} />
                <span style={{
                    color: 'var(--color-alert-red)',
                    marginRight: 'var(--spacing-sm)',
                    fontWeight: 'bold'
                }}>qryx:~</span>
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
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                        flex: 1,
                        outline: 'none',
                        fontSize: '1rem',
                        caretColor: 'var(--color-alert-red)' // blinking cursor color handled by browser mostly, but good to set
                    }}
                />
            </div>
        </div>
    );
};

export default LeftPanel;
