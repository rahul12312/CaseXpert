import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const AILegalAssistantChat = () => {
    const { user, isAuthenticated } = useAuth();

    // State management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [chatSessions, setChatSessions] = useState([]);
    const [groupedSessions, setGroupedSessions] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [language, setLanguage] = useState('en');
    const [isListening, setIsListening] = useState(false);

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

    // Auto-scroll to bottom on new messages (scrolls the page)
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Stop recognition when component unmounts
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
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
    };

    /**
     * Send message and get AI response
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();

        // Optimistic UI update - show user message immediately
        const tempUserMsg = {
            role: 'user',
            message: userMessage,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempUserMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/chat/send', {
                sessionId: currentSessionId,
                message: userMessage,
                task: 'general_legal',
                language: language
            });

            if (data.success) {
                // Update session ID for new chats
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
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this chat?')) return;

        // Optimistic UI Update: Remove immediately before API call
        const previousGroups = { ...groupedSessions };

        // Remove from local state
        const newGroups = { ...groupedSessions };
        Object.keys(newGroups).forEach(key => {
            if (Array.isArray(newGroups[key])) {
                newGroups[key] = newGroups[key].filter(session => session.id !== sessionId);
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
        <div className="flex min-h-[calc(100vh-7rem)] bg-slate-50 dark:bg-slate-950 sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* ============================================ */}
            {/* LEFT SIDEBAR - Chat History */}
            {/* ============================================ */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900`}>
                <div className="flex h-full flex-col p-4">
                    {/* New Chat Button */}
                    <button
                        onClick={startNewChat}
                        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <span className="text-xl">+</span>
                        <span>New Chat</span>
                    </button>

                    {/* Chat Sessions List */}
                    <div className="flex-1 overflow-y-auto">
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
                                                    key={session.id}
                                                    session={session}
                                                    isActive={session.id === currentSessionId}
                                                    onClick={() => loadSession(session.id)}
                                                    onDelete={(e) => deleteSession(session.id, e)}
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
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                <span className="text-xl">⚖️</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">
                                    AI Legal Assistant
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                    Powered by Groq • Indian Law Expert
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 hidden sm:inline">🌐 Language:</span>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-sm"
                            title="Select AI response language"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
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

                                {/* Suggestion Cards */}
                                <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                                    {[
                                        { emoji: '⚖️', text: 'Explain my legal rights', query: 'What are my basic legal rights as a citizen in India?' },
                                        { emoji: '📄', text: 'Draft a legal document', query: 'Help me draft a basic rental agreement.' },
                                        { emoji: '🏛️', text: 'Court procedures', query: 'How do I file a case in civil court in India?' },
                                        { emoji: '📹', text: 'Video Consultation', query: 'I would like to book a video consultation with a lawyer.' },
                                    ].map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInput(suggestion.query)}
                                            className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 p-4 text-left shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                                        >
                                            <div className="text-2xl mb-2">{suggestion.emoji}</div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">
                                                {suggestion.text}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Messages
                            <div className="space-y-6">
                                {messages.map((msg, idx) => (
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
                                            className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                : 'border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-900 dark:text-white dark:text-white'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.message}
                                            </div>
                                            <div className={`mt-2 text-xs ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {formatDate(msg.created_at)}
                                            </div>
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                ))}

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
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? '🎙️ Listening... speak now' : 'Ask a legal question...'}
                                className={`flex-1 rounded-xl border px-5 py-3 text-sm text-slate-900 dark:text-white dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                    isListening
                                        ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-red-400/30'
                                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                                }`}
                                disabled={loading}
                            />
                            {/* Mic Button */}
                            <button
                                type="button"
                                onClick={startVoiceInput}
                                disabled={loading}
                                title={isListening ? 'Stop listening' : `Speak in ${LANGUAGES.find(l => l.code === language)?.label || 'selected language'}`}
                                className={`rounded-xl px-4 py-3 font-medium text-white shadow-lg transition-all ${
                                    isListening
                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                        : 'bg-slate-600 hover:bg-slate-700 hover:scale-105'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isListening ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <rect x="6" y="6" width="12" height="12" rx="2" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                )}
                            </button>



                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Send
                                    </span>
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
            className={`group relative mb-2 cursor-pointer rounded-lg p-3 transition-all ${isActive
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 border border-transparent'
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className={`truncate text-sm font-medium ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white dark:text-white'
                        }`}>
                        {session.title}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                            {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {displayDate()}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-opacity"
                    title="Delete chat"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AILegalAssistantChat;
