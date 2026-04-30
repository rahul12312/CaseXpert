import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
    Send, 
    Plus, 
    MessageSquare, 
    Trash2, 
    Menu, 
    X, 
    Mic, 
    MicOff, 
    Globe,
    User,
    Scale,
    ChevronDown,
    Search
} from 'lucide-react';

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

    const SPEECH_LANGUAGE_MAP = {
        'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 'ta': 'ta-IN',
        'te': 'te-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
        'pa': 'pa-IN', 'bn': 'bn-IN',
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
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (isAuthenticated) {
            loadChatSessions();
        }
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [isAuthenticated]);

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

    const loadSession = async (sessionId) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/chat/messages/${sessionId}`);
            if (data.success) {
                setMessages(data.messages || []);
                setCurrentSessionId(sessionId);
                if (window.innerWidth < 768) setSidebarOpen(false);
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setCurrentSessionId(null);
        setInput('');
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
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
                if (!currentSessionId && data.sessionId) {
                    setCurrentSessionId(data.sessionId);
                }

                const aiMessage = {
                    role: 'assistant',
                    message: data.aiResponse,
                    created_at: new Date().toISOString()
                };

                setMessages(prev => {
                    const filtered = prev.filter(m => m.created_at !== tempUserMsg.created_at);
                    return [...filtered, 
                        { role: 'user', message: userMessage, created_at: new Date().toISOString() },
                        aiMessage
                    ];
                });
                loadChatSessions();
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                message: '❌ Sorry, I encountered an error. Please try again.',
                created_at: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const deleteSession = async (sessionId, e) => {
        e.stopPropagation();
        if (!confirm('Delete this chat?')) return;

        const previousGroups = { ...groupedSessions };
        const newGroups = { ...groupedSessions };
        Object.keys(newGroups).forEach(key => {
            if (Array.isArray(newGroups[key])) {
                newGroups[key] = newGroups[key].filter(s => s.id !== sessionId);
            }
        });
        setGroupedSessions(newGroups);

        if (sessionId === currentSessionId) startNewChat();

        try {
            await api.delete(`/chat/sessions/${sessionId}`);
            loadChatSessions();
        } catch (error) {
            setGroupedSessions(previousGroups);
        }
    };

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = SPEECH_LANGUAGE_MAP[language] || 'en-IN';
        recognition.interimResults = true;
        
        setIsListening(true);
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#09090b]">
            {/* Sidebar */}
            <aside 
                className={`${
                    sidebarOpen ? 'w-80' : 'w-0'
                } flex flex-col bg-[#171717] transition-all duration-300 ease-in-out border-r border-white/10 overflow-hidden relative z-40`}
            >
                <div className="flex flex-col h-full w-80 p-3">
                    {/* Logo / Home Link */}
                    <div className="px-3 py-4 mb-2">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg group-hover:scale-105 transition-transform">
                                <span className="text-lg font-bold">⚖️</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                CaseXpert
                            </span>
                        </Link>
                    </div>

                    <button
                        onClick={startNewChat}
                        className="flex items-center gap-2 w-full p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-sm text-white"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto mt-4 space-y-6">
                        {['today', 'yesterday', 'lastWeek', 'lastMonth', 'older'].map(groupKey => (
                            groupedSessions[groupKey]?.length > 0 && (
                                <div key={groupKey}>
                                    <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                        {groupKey === 'today' ? 'Today' : groupKey === 'yesterday' ? 'Yesterday' : groupKey.replace(/([A-Z])/g, ' $1')}
                                    </h3>
                                    <div className="space-y-1">
                                        {groupedSessions[groupKey].map(session => (
                                            <div
                                                key={session.id}
                                                onClick={() => loadSession(session.id)}
                                                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                                                    session.id === currentSessionId 
                                                    ? 'bg-white/10' 
                                                    : 'hover:bg-white/5'
                                                }`}
                                            >
                                                <MessageSquare className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                <span className="flex-1 truncate text-sm text-slate-200">
                                                    {session.title || 'Untitled Chat'}
                                                </span>
                                                <button
                                                    onClick={(e) => deleteSession(session.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity text-slate-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-white">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative min-w-0 h-full">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-400"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-slate-900 dark:text-white">AI Legal Assistant</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent border-none text-xs font-medium text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900">
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
                    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                    <Scale className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">How can I help you today?</h1>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">I'm your AI Legal Assistant, expert in Indian law and legal procedures.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-6">
                                    {[
                                        { title: 'Explain Rights', desc: 'What are my basic legal rights?', query: 'Explain my basic legal rights in India.' },
                                        { title: 'Draft Document', desc: 'Help me draft a rental agreement.', query: 'How do I draft a rental agreement in India?' },
                                        { title: 'Court Info', desc: 'How to file a civil case?', query: 'What is the procedure to file a civil case in India?' },
                                        { title: 'Lawyer Find', desc: 'Find specialized lawyers.', query: 'How can I find a good criminal lawyer near me?' }
                                    ].map((card, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(card.query)}
                                            className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-white/5 text-left transition-all group"
                                        >
                                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600">{card.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-32">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                                            msg.role === 'assistant' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-emerald-600 text-white'
                                        }`}>
                                            {msg.role === 'assistant' ? <Scale className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                                                {msg.role === 'assistant' ? 'CaseXpert AI' : 'You'}
                                            </p>
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                                msg.role === 'user' 
                                                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-tr-none' 
                                                : 'bg-transparent text-slate-800 dark:text-slate-200 rounded-tl-none'
                                            }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-4 animate-pulse">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600/50 flex items-center justify-center text-white">
                                            <Scale className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-2 flex-1 pt-2">
                                            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full w-1/4"></div>
                                            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full w-full"></div>
                                            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full w-3/4"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#09090b] dark:via-[#09090b]/95 z-30">
                    <div className="max-w-3xl mx-auto relative group">
                        <form 
                            onSubmit={handleSubmit}
                            className="relative flex items-end gap-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-[2rem] p-2 pr-3 shadow-xl focus-within:border-blue-500/50 transition-all"
                        >
                            <button
                                type="button"
                                onClick={startVoiceInput}
                                className={`p-3 rounded-full transition-all ${
                                    isListening ? 'text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-blue-500'
                                }`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                placeholder="Message AI Assistant..."
                                rows={1}
                                className="flex-1 max-h-48 py-3 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white resize-none scroll-smooth"
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 192)}px`;
                                }}
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className={`p-2.5 rounded-full shadow-lg transition-all ${
                                    input.trim() && !loading
                                    ? 'bg-blue-600 text-white hover:scale-105 hover:bg-blue-700'
                                    : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <p className="mt-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
                            AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AILegalAssistantChat;
