import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('QRYX Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#050505',
                    color: '#e0e0e0',
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: 'center',
                    padding: '24px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        borderLeft: '4px solid #FF5555',
                        paddingLeft: '24px',
                        textAlign: 'left',
                        maxWidth: '500px'
                    }}>
                        <h1 style={{
                            fontSize: '2rem',
                            letterSpacing: '0.1em',
                            marginBottom: '16px',
                            color: '#FF5555'
                        }}>
                            SYSTEM_FAULT
                        </h1>
                        <p style={{
                            fontSize: '0.85rem',
                            color: '#888',
                            marginBottom: '8px',
                            textTransform: 'uppercase'
                        }}>
                            &gt; An unexpected error occurred in the rendering pipeline.
                        </p>
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#555',
                            marginBottom: '24px',
                            wordBreak: 'break-word'
                        }}>
                            {this.state.error?.message || 'Unknown error'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#FF5555',
                                border: 'none',
                                color: '#000',
                                fontWeight: 'bold',
                                fontFamily: "'JetBrains Mono', monospace",
                                padding: '12px 32px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}
                        >
                            REBOOT SYSTEM
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
