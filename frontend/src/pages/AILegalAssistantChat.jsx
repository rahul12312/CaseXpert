import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Scale, 
    User, 
    Mic, 
    MicOff, 
    Send, 
    Plus, 
    Trash2, 
    History, 
    Globe, 
    Menu,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Home,
    ArrowLeft,
    Copy,
    Check,
    Edit2,
    Paperclip,
    Image as ImageIcon,
    Search,
    Telescope,
    FileText,
    X,
    Loader2
} from 'lucide-react';

const AILegalAssistantChat = () => {
    const { user, isAuthenticated, isAdmin, isLawyer } = useAuth();
    const navigate = useNavigate();

    // State management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [chatSessions, setChatSessions] = useState([]);
    const [groupedSessions, setGroupedSessions] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [language, setLanguage] = useState('en');
    const [isListening, setIsListening] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const attachmentMenuRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.txt'];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (allowed.includes(ext)) {
                setSelectedFile(file);
            } else {
                alert(`Invalid file type. Supported: PDF, DOC, DOCX, JPG, PNG, WEBP, TXT`);
            }
        }
    };

    // Maps our language codes to BCP-47 tags for Web Speech API
    const SPEECH_LANGUAGE_MAP = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'gu': 'gu-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'pa': 'pa-IN',
        'bn': 'bn-IN',
    };

    const LANGUAGES = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
        { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
        { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
        { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
        { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
    ];

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom on new messages (scrolls the page)
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleEdit = (text) => {
        setInput(text);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Stop recognition when component unmounts
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Close attachment menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
                setShowAttachmentMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load chat sessions on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadChatSessions();
        }
    }, [isAuthenticated]);

    /**
     * Load all chat sessions from database
     */
    const loadChatSessions = async () => {
        try {
            const { data } = await api.get('/chat/sessions');
            if (data.success) {
                setChatSessions(data.sessions || []);
                setGroupedSessions(data.groupedSessions || {});
            }
        } catch (error) {
            console.error('Failed to load chat sessions:', error);
        }
    };

    /**
     * Load messages for a specific session
     */
    const loadSession = async (sessionId) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/chat/messages/${sessionId}`);

            if (data.success) {
                setMessages(data.messages || []);
                setCurrentSessionId(sessionId);
                if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                }
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Start a new chat session
     */
    const startNewChat = () => {
        setMessages([]);
        setCurrentSessionId(null);
        setInput('');
        setSelectedFile(null);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    /**
     * File Selection Handler
     */
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    /**
     * Upload Document Function
     */
    const uploadDocument = async (sessionId) => {
        if (!selectedFile) return null;

        const formData = new FormData();
        formData.append('document', selectedFile);
        if (sessionId) {
            formData.append('sessionId', sessionId);
        }

        try {
            const { data } = await api.post('/chat/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        } catch (error) {
            console.error('Document upload failed:', error);
            return null;
        }
    };

    /**
     * Send message and get AI response
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !selectedFile) || loading) return;

        const userMessage = input.trim() || `Please analyze the uploaded document (${selectedFile.name}) and summarize its key legal points.`;

        // Optimistic UI update - show user message immediately
        const tempUserMsg = {
            role: 'user',
            message: userMessage,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempUserMsg]);
        setInput('');
        setLoading(true);

        let activeSessionId = currentSessionId;

        try {
            // Upload document if selected
            if (selectedFile) {
                setMessages(prev => [...prev, {
                    role: 'system',
                    message: `📎 Uploading ${selectedFile.name}...`,
                    created_at: new Date().toISOString()
                }]);

                const uploadResult = await uploadDocument(activeSessionId);
                
                if (uploadResult && uploadResult.sessionId) {
                    activeSessionId = uploadResult.sessionId;
                    setCurrentSessionId(activeSessionId);

                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs.pop();
                        return [...newMsgs, {
                            role: 'system',
                            message: `✅ Analyzed ${selectedFile.name}`,
                            created_at: new Date().toISOString()
                        }];
                    });
                } else {
                    throw new Error("Document upload failed");
                }

                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }

            const { data } = await api.post('/chat/send', {
                sessionId: activeSessionId,
                message: userMessage,
                task: 'general_legal',
                language: language
            });

            if (data.success) {
                if (!currentSessionId && data.sessionId) {
                    setCurrentSessionId(data.sessionId);
                }

                // Add AI response to messages
                const aiMessage = {
                    role: 'assistant',
                    message: data.aiResponse,
                    created_at: new Date().toISOString()
                };

                setMessages(prev => {
                    // Remove temp message and add both real messages
                    const filtered = prev.filter(m => m.created_at !== tempUserMsg.created_at);
                    return [...filtered,
                    { role: 'user', message: userMessage, created_at: new Date().toISOString() },
                        aiMessage
                    ];
                });

                // Reload sessions to update sidebar
                loadChatSessions();
            }
        } catch (error) {
            console.error('Chat error:', error);

            // Show error message
            const errorMsg = {
                role: 'assistant',
                message: '❌ Sorry, I encountered an error. Please try again or contact support.',
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Delete a chat session
     */
    const deleteSession = async (sessionId, e) => {
        if (e) e.stopPropagation();

        // Optimistic UI Update: Remove immediately before API call
        const previousGroups = { ...groupedSessions };

        // Remove from local state
        const newGroups = { ...groupedSessions };
        Object.keys(newGroups).forEach(key => {
            if (Array.isArray(newGroups[key])) {
                newGroups[key] = newGroups[key].filter(session => (session.id || session._id) !== sessionId);
            }
        });
        setGroupedSessions(newGroups);

        // If deleted current session, start new chat immediately
        if (sessionId === currentSessionId) {
            startNewChat();
        }

        try {
            const { data } = await api.delete(`/chat/sessions/${sessionId}`);

            if (data.success) {
                // Background sync to ensure consistency
                loadChatSessions();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
            alert("Failed to delete chat session");
            // Revert state on error
            setGroupedSessions(previousGroups);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Auth handled by ProtectedRoute - no redirect needed here

    /**
     * Voice-to-Text using Web Speech API
     */
    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        // If already listening, stop
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Set language based on selected UI language
        recognition.lang = SPEECH_LANGUAGE_MAP[language] || 'en-IN';
        recognition.interimResults = true;      // Show partial results as the user speaks
        recognition.continuous = false;          // Stop after first pause
        recognition.maxAlternatives = 1;

        setIsListening(true);
        setInput('');  // Clear previous input

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);  // Update input box in real-time
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            recognitionRef.current = null;
            if (event.error !== 'aborted') {
                alert(`Voice error: ${event.error}. Please try again.`);
            }
        };

        recognition.start();
    };


    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex h-[calc(100vh-64px)] mt-16 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative"
        >
            {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] border-2 border-dashed border-blue-500 flex flex-col items-center justify-center z-50 pointer-events-none animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                        <Plus className="w-12 h-12 text-blue-600 animate-bounce" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Drop your document or photo here</span>
                        <span className="text-xs text-slate-500">Supports PDF, TXT, DOC, DOCX, PNG, JPG, WEBP</span>
                    </div>
                </div>
            )}
            {/* ============================================ */}
            {/* LEFT SIDEBAR - Chat History */}
            {/* ============================================ */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900`}>
                <div className="flex h-full flex-col p-4">
                    {/* Top Row: New Chat & Close Sidebar */}
                    <div className="mb-6 flex items-center gap-2">
                        <button
                            onClick={startNewChat}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                            <Plus size={20} />
                            <span>New Chat</span>
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="flex h-[48px] w-[48px] items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Close Sidebar"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>

                    {/* Chat Sessions List */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                            <History size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
                        </div>
                        {Object.keys(groupedSessions).length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="text-4xl mb-2">💬</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                    No chat history yet.<br />Start a new conversation!
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Groups Render */}
                                {['today', 'yesterday', 'lastWeek', 'lastMonth', 'older'].map(groupKey => (
                                    groupedSessions[groupKey]?.length > 0 && (
                                        <div key={groupKey} className="mb-4">
                                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                                {groupKey === 'today' ? 'Today' : groupKey === 'yesterday' ? 'Yesterday' : groupKey === 'lastWeek' ? 'Last Week' : groupKey === 'lastMonth' ? 'Last Month' : 'Older'}
                                            </h3>
                                            {groupedSessions[groupKey].map(session => (
                                                <SessionItem
                                                    key={session.id || session._id}
                                                    session={session}
                                                    isActive={(session.id || session._id) === currentSessionId}
                                                    onClick={() => loadSession(session.id || session._id)}
                                                    onDelete={(e) => deleteSession(session.id || session._id, e)}
                                                />
                                            ))}
                                        </div>
                                    )
                                ))}
                            </>
                        )}
                    </div>

                    {/* User Info at Bottom */}
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 dark:border-slate-800 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* MAIN CHAT AREA */}
            {/* ============================================ */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-blue-500/20 shadow-lg">
                                <Scale size={20} />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                                    AI Legal Assistant
                                </h1>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Online • Indian Law Expert
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="relative flex items-center justify-center h-8 w-8 bg-slate-100 dark:bg-white/5 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer">
                            <Globe size={16} className="text-slate-500 dark:text-slate-400" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Change Language"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 custom-scrollbar">
                    <div className="mx-auto max-w-3xl px-4 py-8">
                        {messages.length === 0 ? (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-6 text-7xl">💬</div>
                                <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white dark:text-white">
                                    How can I help you today?
                                </h2>
                                <p className="mb-8 max-w-md text-slate-600 dark:text-slate-400 dark:text-slate-400">
                                    Ask me anything about Indian law, legal procedures, case strategies, or document drafting.
                                </p>

                                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                                    {[
                                        { title: 'Explain Rights', desc: 'What are my basic legal rights?', query: 'Explain my basic legal rights in India.' },
                                        { title: 'Draft Document', desc: 'Help me draft a rental agreement.', query: 'How do I draft a rental agreement in India?' },
                                        { title: 'Court Info', desc: 'How to file a civil case?', query: 'What is the procedure to file a civil case in India?' },
                                        { title: 'Lawyer Find', desc: 'Find specialized lawyers.', query: 'How can I find a good criminal lawyer near me?' }
                                    ].map((card, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(card.query)}
                                            className="group flex flex-col items-start rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 text-left transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 active:scale-95"
                                        >
                                            <span className="mb-2 text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {card.title}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {card.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Messages
                            <div className="space-y-6">
                                {messages.map((msg, idx) => {
                                    if (msg.role === 'system') {
                                        return (
                                            <div key={idx} className="flex justify-center my-2 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                                <span className="text-sm">⚖️</span>
                                            </div>
                                        )}

                                        <div
                                            className={`group max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 marker:text-slate-400">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.message}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {msg.message}
                                                </div>
                                            )}
                                            <div className={`mt-2 flex items-center justify-between text-xs ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                                <span>{formatDate(msg.created_at)}</span>
                                                <div className="flex gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                    {msg.role === 'user' && (
                                                        <button onClick={() => handleEdit(msg.message)} title="Edit Message" className="hover:text-white transition-colors">
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleCopy(msg.message, idx)} title="Copy Message" className="hover:text-blue-500 transition-colors">
                                                        {copiedIndex === idx ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                )})}

                                {/* Loading Indicator */}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                            <span className="text-sm">⚖️</span>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0s' }}></div>
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0.4s' }}></div>
                                                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900 px-4 py-4">
                    <div className="mx-auto max-w-3xl">
                        
                        {/* Selected File Chip */}
                        {selectedFile && (
                            <div className="mb-3 animate-fade-in flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shadow-sm ml-4">
                                <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex flex-col pr-2">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
                                    <span className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="ml-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 pl-2 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all relative">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                            />

                            {/* Attachment Button & Menu */}
                            <div className="relative flex items-center justify-center h-full mb-1" ref={attachmentMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                                    title="Add attachments"
                                >
                                    <Plus size={20} className={`transition-transform duration-200 ${showAttachmentMenu ? 'rotate-45' : ''}`} />
                                </button>
                                
                                {/* Attachment Menu Popover */}
                                {showAttachmentMenu && (
                                    <div className="absolute bottom-12 left-0 w-64 bg-slate-800 rounded-2xl p-2 shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200 z-50">
                                        <button type="button" onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 rounded-xl transition-colors text-slate-200 text-sm font-medium">
                                            <div className="bg-slate-700/50 p-1.5 rounded-lg text-slate-300">
                                                <Paperclip size={16} />
                                            </div>
                                            <span>Add photos & files</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder={selectedFile ? "Ask a question about this document..." : "Ask about Indian law, rights, or procedures..."}
                                rows={1}
                                className="flex-1 max-h-48 py-2.5 bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-900 dark:text-white resize-none scroll-smooth"
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 192)}px`;
                                }}
                            />
                            {/* Mic Button */}
                            <button
                                type="button"
                                onClick={startVoiceInput}
                                className={`p-2.5 rounded-full transition-all ${
                                    isListening 
                                    ? 'text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse' 
                                    : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                title={isListening ? 'Stop listening' : 'Voice input'}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={(!input.trim() && !selectedFile) || loading}
                                className={`p-2.5 rounded-full shadow-md transition-all ${
                                    (input.trim() || selectedFile) && !loading
                                    ? 'bg-blue-600 text-white hover:scale-105 hover:bg-blue-700'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </form>

                        {/* Disclaimer */}
                        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                            CaseXpert provides general legal information. Always consult a qualified lawyer for professional advice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Session Item Component for Sidebar
 */
const SessionItem = ({ session, isActive, onClick, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    // Format date local
    const displayDate = () => {
        if (!session.last_activity_at) return '';
        const date = new Date(session.last_activity_at);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={onClick}
            className={`group relative mb-2 cursor-pointer rounded-xl p-3 transition-all border ${
                isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:text-blue-500 transition-colors flex-shrink-0">
                    <MessageSquare size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className={`truncate text-sm font-semibold ${
                        isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                        {session.title || 'Untitled Chat'}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-400">
                            {session.messages?.length || 0} messages
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {displayDate()}
                        </span>
                    </div>
                </div>

                {showConfirm ? (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(e); setShowConfirm(false); }}
                            className="rounded px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                            Delete
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                            className="rounded px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirm(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        title="Delete chat"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AILegalAssistantChat;
