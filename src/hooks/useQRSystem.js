import { useState, useEffect, useRef } from 'react';

const useQRSystem = () => {
    const [logs, setLogs] = useState([]);
    const [qrOptions, setQrOptions] = useState({
        data: 'https://example.com'
    });
    const [isTerminalMode, setIsTerminalMode] = useState(false);
    const [commandHistory, setCommandHistory] = useState([]);
    const [animationTrigger, setAnimationTrigger] = useState(0);

    // Refs needed for external interactive commands like file picking or export
    // Note: These refs need to be attached to DOM elements in the consuming component
    const rightPanelRef = useRef(null);
    const fileInputRef = useRef(null);

    const addLog = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [...prev, { time, msg, type }]);
    };

    const addToHistory = (cmd, response, type = 'success') => {
        setCommandHistory(prev => [...prev, { cmd, response, type }]);
    };

    useEffect(() => {
        // Initial Boot Sequence
        const bootSequence = [
            { msg: 'Daemon initialized', delay: 500 },
            { msg: 'Loading core modules... OK', delay: 1200 },
            { msg: 'Mounting file system... OK', delay: 2000 },
            { msg: 'User session created', delay: 2800 },
            { msg: 'Ready for commands', delay: 3500, type: 'success' },
        ];

        bootSequence.forEach(({ msg, delay, type }) => {
            setTimeout(() => addLog(msg, type), delay);
        });
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;
                setQrOptions(prev => ({
                    ...prev,
                    image: result,
                    imageOptions: {
                        ...prev.imageOptions,
                        crossOrigin: 'anonymous',
                        margin: 10,
                        imageSize: 0.4
                    }
                }));
                addLog(`Local logo loaded: ${file.name}`, 'success');
                addToHistory('/add logo', 'logo obstruction: safe', 'success');
            };
            reader.readAsDataURL(file);
        }
        // Reset input so same file can be selected again if needed
        e.target.value = null;
    };

    const handleCommand = (cmdString) => {
        const raw = cmdString.trim();
        if (!raw) return;

        // Activate Terminal Mode on first command
        if (!isTerminalMode) setIsTerminalMode(true);

        const parts = raw.split(/\s+/); // Handle multiple spaces
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Only log command if it's NOT a silent file pick
        addLog(`> ${raw}`, 'info');

        // Trigger reveal animation for commands that change visuals
        if (['/generate', '/color', '/style', '/add', '/remove'].includes(command) || command === 'qr') {
            setAnimationTrigger(prev => prev + 1);
        }

        switch (command) {
            case '/generate':
                if (args.length > 0) {
                    const url = args.join(' ');
                    setQrOptions(prev => ({ ...prev, data: url }));
                    addLog(`Generating QR for: ${url}`, 'success');
                    addToHistory(raw, `qr code generated (version 6, ecc: h)`, 'success');
                } else {
                    addLog('Error: Missing URL argument', 'error');
                    addToHistory(raw, 'error: missing url argument', 'error');
                }
                break;

            case '/color': {
                let cUpdates = 0;
                let newOptions = { ...qrOptions };

                for (let i = 0; i < args.length; i++) {
                    const val = args[i + 1];
                    if (!val) continue;

                    if (args[i] === '-bg') {
                        newOptions.backgroundOptions = { ...newOptions.backgroundOptions, color: val };
                        cUpdates++;
                    } else if (args[i] === '-fg' || args[i] === '-dots') {
                        newOptions.dotsOptions = { ...newOptions.dotsOptions, color: val };
                        cUpdates++;
                    } else if (args[i] === '-corners') {
                        newOptions.cornersSquareOptions = { ...newOptions.cornersSquareOptions, color: val };
                        cUpdates++;
                    } else if (args[i] === '-corners-dot') {
                        newOptions.cornersDotOptions = { ...newOptions.cornersDotOptions, color: val };
                        cUpdates++;
                    }
                }

                if (cUpdates > 0) {
                    setQrOptions(newOptions);
                    addLog(`Applied ${cUpdates} color updates`, 'success');
                    addToHistory(raw, 'colors applied', 'success');
                } else {
                    addToHistory(raw, 'usage: /color -bg [hex] -fg [hex] -corners [hex]', 'error');
                }
                break;
            }

            case '/style': {
                const type = args[0];
                const value = args[1];
                if (type === 'dots' && value) {
                    setQrOptions(prev => ({
                        ...prev,
                        dotsOptions: { ...prev.dotsOptions, type: value }
                    }));
                    addToHistory(raw, `dots style set to ${value}`, 'success');
                } else if (type === 'corners' && value) {
                    setQrOptions(prev => ({
                        ...prev,
                        cornersSquareOptions: { ...prev.cornersSquareOptions, type: value },
                        cornersDotOptions: { ...prev.cornersDotOptions, type: value === 'dot' ? 'dot' : undefined }
                    }));
                    addToHistory(raw, `corners style set to ${value}`, 'success');
                } else {
                    addToHistory(raw, 'usage: /style dots [type] | /style corners [type]', 'error');
                }
                break;
            }

            case '/add':
                if (args[0] === 'logo') {
                    if (args[1]) {
                        // URL mode
                        const logoUrl = args[1];
                        setQrOptions(prev => ({
                            ...prev,
                            image: logoUrl,
                            imageOptions: {
                                ...prev.imageOptions,
                                crossOrigin: 'anonymous',
                                margin: 5,
                                imageSize: 0.9
                            }
                        }));
                        addLog(`Logo loaded: ${logoUrl.substring(0, 15)}...`, 'success');
                        addToHistory(raw, 'logo obstruction: safe', 'success');
                    } else {
                        // Local File Picker mode
                        if (fileInputRef.current) {
                            fileInputRef.current.click();
                        } else {
                            addToHistory(raw, 'error: file input not ready', 'error');
                        }
                    }
                } else {
                    addToHistory(raw, 'usage: /add logo [url] (or empty for local)', 'error');
                }
                break;

            case '/remove':
                if (args[0] === 'logo') {
                    setQrOptions(prev => ({
                        ...prev,
                        image: undefined
                    }));
                    addLog('Logo removed', 'success');
                    addToHistory(raw, 'logo layer cleared', 'success');
                } else {
                    addToHistory(raw, 'usage: /remove logo', 'error');
                }
                break;

            case '/help': {
                const helpText = `
AVAILABLE COMMANDS:
-------------------
/generate [url]       - Generate a new QR code
/color [flags]        - Set colors
  -bg [hex]           - Background color
  -fg [hex]           - Dots color
  -corners [hex]      - Corners square color
/style [part] [type]  - Set shape style
  dots [type]         - square, rounded, dots, classy
  corners [type]      - square, dot, extra-rounded
/add logo [url]       - Add logo (URL or Local)
/remove logo          - Remove the logo
qr export [name] [fmt] - Download QR (fmt: png, jpg, svg)
`;
                addToHistory(raw, helpText.trim(), 'success');
                break;
            }

            case 'qr':
                if (args[0] === 'test') {
                    addToHistory(raw, 'scan reliability: 98.6%\\nerror tolerance: high', 'success');
                } else if (args[0] === 'export') {
                    const filename = args[1] || 'qr-code';
                    const format = args[2] ? args[2].toLowerCase() : 'png';
                    const validFormats = ['png', 'svg', 'jpg', 'jpeg'];

                    if (!validFormats.includes(format)) {
                        addToHistory(raw, `error: invalid format '${format}'. use png, jpg, or svg.`, 'error');
                        return;
                    }

                    if (rightPanelRef.current) {
                        rightPanelRef.current.exportQR(filename, format);
                        addLog(`Exporting ${filename}.${format}`, 'success');
                        addToHistory(raw, `files exported: ${filename}.${format}`, 'success');
                    } else {
                        addToHistory(raw, 'export failed: engine not ready', 'error');
                    }
                } else {
                    addToHistory(raw, 'unknown qr command', 'error');
                }
                break;

            default:
                addLog(`Command not found: ${command}`, 'error');
                addToHistory(raw, `command not found: ${command}. Type /help for options.`, 'error');
        }
    };

    return {
        logs,
        qrOptions,
        isTerminalMode,
        commandHistory,
        animationTrigger,
        rightPanelRef,
        fileInputRef,
        handleCommand,
        handleFileUpload,
        addLog // Exposed just in case, though mostly internal
    };
};

export default useQRSystem;
