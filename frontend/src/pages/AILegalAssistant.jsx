import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TypingEffect from '../components/TypingEffect.jsx';
import { Paperclip, ArrowUp, X, FileText, Loader2, Send, Plus } from 'lucide-react';

const AILegalAssistant = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions();
    }
  }, [isAuthenticated]);

  const loadChatSessions = async () => {
    try {
      const { data } = await api.get('/chat/sessions');
      setChatSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  const loadChatSession = async sid => {
    try {
      const { data } = await api.get(`/chat/messages/${sid}`);
      if (data.messages) {
        setMessages(data.messages.map(m => ({
          ...m,
          content: m.message,
          timestamp: new Date(m.created_at)
        })));
        setSessionId(sid);
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadDocument = async (currentSessionId) => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('document', selectedFile);
    if (currentSessionId) {
      formData.append('sessionId', currentSessionId);
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

  const handleSubmit = async e => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading) return;

    // Use default prompt if only file is uploaded
    const queryText = input.trim() || `Please analyze the uploaded document (${selectedFile.name}) and summarize its key legal points.`;

    const userMessage = {
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let activeSessionId = sessionId;

    try {
      // Upload document if selected
      if (selectedFile) {
        // Optimistic UI update for file upload
        setMessages(prev => [...prev, {
          role: 'system',
          content: `📎 Uploading ${selectedFile.name}...`,
          timestamp: new Date()
        }]);

        const uploadResult = await uploadDocument(activeSessionId);

        if (uploadResult && uploadResult.sessionId) {
          activeSessionId = uploadResult.sessionId;
          setSessionId(activeSessionId);

          // Update system message to success
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs.pop(); // Remove "Uploading..."
            return [...newMsgs, {
              role: 'system',
              content: `✅ Analyzed ${selectedFile.name}`,
              timestamp: new Date()
            }];
          });
        } else {
          throw new Error("Document upload failed");
        }

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      const { data } = await api.post('/chat/send', {
        message: queryText,
        sessionId: activeSessionId,
      });

      const assistantMessage = {
        role: 'assistant',
        content: data.aiResponse,
        timestamp: new Date(),
      };

      setSessionId(data.sessionId);
      setMessages(prev => [...prev, assistantMessage]);
      setTypingMessageId(assistantMessage.timestamp.getTime());

      // Reload sessions list
      loadChatSessions();
    } catch (error) {
      console.error('AI query failed:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your document or request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setSelectedFile(null);
  };

  const deleteSession = async sid => {
    try {
      await api.delete(`/chat/sessions/${sid}`);
      if (sessionId === sid) {
        startNewChat();
      }
      loadChatSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
          <div className="mb-4 text-5xl">🔒</div>
          <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please log in to use the AI Legal Assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Chat History */}
      <div className="hidden w-64 flex-col gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <button
          onClick={startNewChat}
          className="mb-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>
        <div className="text-xs font-semibold uppercase text-slate-500 mt-2 mb-1">Recent Chats</div>
        {chatSessions.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400 italic">No chat history</p>
        ) : (
          chatSessions.map(chat => (
            <div
              key={chat.sessionId}
              className={`group relative cursor-pointer rounded-lg border p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${sessionId === chat.sessionId
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500/20'
                : 'border-slate-200 dark:border-slate-700'
                }`}
              onClick={() => loadChatSession(chat.sessionId)}
            >
              <div className="truncate font-medium text-slate-900 dark:text-white mb-0.5">{chat.title}</div>
              <div className="text-slate-500 flex justify-between items-center">
                <span>{new Date(chat.last_activity_at || Date.now()).toLocaleDateString()}</span>
                <span>{chat.metadata?.totalMessages || 0} msgs</span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteSession(chat.sessionId);
                }}
                className="absolute right-2 top-2 hidden rounded p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 group-hover:block dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-md">
              <span className="text-xl">⚖️</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">AI Legal Assistant</h2>
              <p className="text-xs text-slate-500 font-medium">Powered by Groq LLaMA 3 &bull; PDF Analysis Ready</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 px-3 py-1 bg-slate-100 rounded-full dark:bg-slate-800 border dark:border-slate-700">
            Beta Preview
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-8 animate-fade-in-up">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary-100 rounded-full blur-xl opacity-50 dark:bg-primary-900/20"></div>
                <div className="relative text-6xl">🤖</div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  How can I help you today?
                </h3>
                <p className="max-w-md mx-auto text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  I can explain Indian laws, draft documents, analyze your case files, and provide legal summaries.
                  <br /><span className="font-semibold text-primary-600">Try uploading a PDF!</span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 w-full max-w-2xl px-4">
                {[
                  { icon: "📄", text: "Draft a rent agreement", query: "Draft a comprehensive rent agreement for a residential property in Delhi." },
                  { icon: "👮", text: "How to file an FIR?", query: "What is the detailed process to file an FIR in India for a lost vehicle?" },
                  { icon: "🏠", text: "Tenant rights explanation", query: "Explain the key rights of a tenant under the Model Tenancy Act in India." },
                  { icon: "⚖️", text: "Analyze 498A IPC", query: "Explain Section 498A of the IPC and recent supreme court judgments related to it." }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(item.query)}
                    className="group flex items-center gap-3 p-4 text-left rounded-xl border border-slate-200 bg-white hover:border-primary-300 hover:shadow-md transition-all dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-700"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for Assistant */}
                {msg.role !== 'user' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white text-xs shadow-sm mt-1">
                    AI
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm shadow-sm ${msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : msg.role === 'system'
                      ? 'bg-slate-100 text-slate-600 border border-slate-200 text-xs w-full text-center py-2'
                      : 'bg-white text-slate-800 border border-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-bl-none'
                    }`}
                >
                  {msg.role === 'assistant' && typingMessageId === msg.timestamp?.getTime() ? (
                    <TypingEffect
                      text={msg.content}
                      speed={10}
                      onComplete={() => setTypingMessageId(null)}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  )}
                  <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-primary-100' : 'text-slate-400'}`}>
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Avatar for User */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs shadow-sm mt-1">
                    You
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white text-xs shadow-sm mt-1">
                AI
              </div>
              <div className="rounded-2xl rounded-bl-none bg-white border border-slate-100 px-5 py-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 md:p-5 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">

            {/* Selected File Chip */}
            {selectedFile && (
              <div className="mb-3 animate-fade-in flex items-center gap-2 self-start bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
                <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg">
                  <FileText className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="ml-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`relative flex items-center w-full transition-all duration-200 ${loading ? 'opacity-80' : ''}`}>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />

              <div className="relative w-full">
                {/* Left Attach Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all z-10"
                  title="Attach document/image"
                  disabled={loading}
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Text Input */}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedFile ? "Ask questions about this document..." : "Message AI Legal Assistant..."}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[26px] py-4 pl-12 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                  disabled={loading}
                />

                {/* Right Send Button */}
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !selectedFile)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white transition-all shadow-sm ${(!input.trim() && !selectedFile) || loading
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
                    }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500">
              AI can give confident but incorrect answers. Always verify important information with a human lawyer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILegalAssistant;
