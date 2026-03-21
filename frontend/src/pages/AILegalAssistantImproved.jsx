import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Bot, User, AlertCircle, Plus, MessageSquare, Trash2, Menu, X,
  Scale, Calculator, FileText, Search, Handshake, Gavel, ShieldAlert, Ear
} from 'lucide-react';

// Direct API URL - bypassing axios instance
const API_URL = 'http://localhost:5001/api/ai-legal-assistant/chat';

const AI_TASKS = [
  { id: 'DEFAULT_CHAT', label: 'General Legal Chat', icon: Bot, desc: 'Ask general legal questions' },
  { id: 'CASE_PREDICTION', label: 'Case Outcome Prediction', icon: Scale, desc: 'Predict win probability & risks' },
  { id: 'EXPENSE_ESTIMATOR', label: 'Legal Expense Estimator', icon: Calculator, desc: 'Estimate costs & duration' },
  { id: 'OCR_SUMMARIZER', label: 'Document Summarizer', icon: FileText, desc: 'Summarize legal documents' },
  { id: 'EVIDENCE_ANALYZER', label: 'Evidence Analyzer', icon: Search, desc: 'Evaluate evidence strength' },
  { id: 'NEGOTIATION_BOT', label: 'Negotiation Assistant', icon: Handshake, desc: 'Draft settlement responses' },
  { id: 'JUDGE_INSIGHTS', label: 'Judge Analytics', icon: Gavel, desc: 'Analyze judicial trends' },
  { id: 'FRAUD_DETECTION', label: 'Fraud Detection', icon: ShieldAlert, desc: 'Identify inconsistencies' },
  { id: 'HEARING_ASSISTANT', label: 'Hearing Assistant', icon: Ear, desc: 'Summarize transcripts' },
];

const MessageContent = ({ content }) => {
  try {
    // Try to parse JSON content for structured tools
    if (typeof content !== 'string') return <p>{content}</p>;

    // Check if it looks like JSON start (simple check)
    const trimmed = content.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    const data = JSON.parse(content);

    // 1. CASE PREDICTION RENDERER
    if (data.win_probability_percent !== undefined) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
            <span className="font-bold text-lg text-gray-800">Case Prediction Analysis</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${data.win_probability_percent > 70 ? 'bg-green-100 text-green-700' :
              data.win_probability_percent > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
              {data.win_probability_percent}% Win Chance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <strong className="text-green-800 text-sm block mb-2">Supporting Factors</strong>
              <ul className="list-disc ml-4 text-xs space-y-1 text-gray-700">
                {data.supporting_factors?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <strong className="text-red-800 text-sm block mb-2">Weaknesses / Risks</strong>
              <ul className="list-disc ml-4 text-xs space-y-1 text-gray-700">
                {data.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Analyst Note: </strong> {data.confidence_note}
          </div>
        </div>
      );
    }

    // 2. EXPENSE ESTIMATOR RENDERER
    if (data.estimated_min_cost_inr !== undefined) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-lg text-gray-800">Legal Cost Estimation</span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              ₹{data.estimated_min_cost_inr.toLocaleString()} - ₹{data.estimated_max_cost_inr.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Expected Duration</p>
              <p className="text-lg font-bold text-gray-800">{data.expected_duration}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
              <p className="text-xs text-blue-500 uppercase font-semibold">Complexity Level</p>
              <p className="text-lg font-bold text-blue-800">{data.case_complexity || 'Medium'}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="font-semibold text-sm mb-3 text-gray-700 border-b pb-2">Detailed Breakdown (Estimated)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lawyer / Professional Fees</span>
                <span className="font-medium">₹{data.cost_breakdown?.lawyer_fees?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Court & Filing Fees</span>
                <span className="font-medium">₹{data.cost_breakdown?.court_fees?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miscellaneous</span>
                <span className="font-medium">₹{data.cost_breakdown?.miscellaneous?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {data.assumptions && (
            <div className="text-xs text-gray-500 italic mt-2">
              *Assumptions: {data.assumptions.join(', ')}
            </div>
          )}
        </div>
      );
    }

    // 3. GENERIC JSON RENDERER (Fallback for other tools)
    return (
      <div className="space-y-2 font-mono text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-hidden">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 last:border-0 pb-2 mb-2 last:mb-0 last:pb-0">
            <span className="font-bold capitalize text-xs text-indigo-700 block mb-1">{key.replace(/_/g, ' ')}</span>
            <div className="pl-2 text-gray-800">
              {Array.isArray(value) ? (
                <ul className="list-disc ml-4 space-y-1">
                  {value.map((v, i) => <li key={i}>{typeof v === 'object' ? JSON.stringify(v) : v}</li>)}
                </ul>
              ) : (
                typeof value === 'object' ? <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre> : String(value)
              )}
            </div>
          </div>
        ))}
      </div>
    );

  } catch (e) {
    // Not valid JSON, render as plain text with markdown-like styling
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>;
  }
};

const AILegalAssistantImproved = () => {
  const location = useLocation();
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState('DEFAULT_CHAT');

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('ai_chat_sessions');
    const locationTask = location.state?.selectedTask; // Get task from navigation state

    let sessions = [];
    if (savedSessions) {
      try {
        sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }

    if (locationTask) {
      // If coming from Home page with a selected task, create a new session for it immediately
      console.log("Navigated with task:", locationTask);
      setSelectedTask(locationTask);

      const newSession = {
        id: Date.now().toString(),
        title: `New ${AI_TASKS.find(t => t.id === locationTask)?.label || 'Chat'}`,
        messages: [
          {
            role: 'assistant',
            content: `Hello! I'm ready to help you with ${AI_TASKS.find(t => t.id === locationTask)?.label}. Please provide the details.`,
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        task: locationTask
      };

      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setChatHistory(newSession.messages);

    } else {
      // Normal load (load last session or create new)
      if (sessions.length > 0) {
        loadSession(sessions[0].id);
      } else {
        createNewSession();
      }
    }

    // Clear history state to prevent loop on refresh
    window.history.replaceState({}, document.title);

  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('ai_chat_sessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Create a new chat session
  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: `Hello! I'm your AI Legal Assistant. Select a tool above or start chatting!`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      task: 'DEFAULT_CHAT'
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setChatHistory(newSession.messages);
    setSelectedTask('DEFAULT_CHAT');
    setError(null);
  };

  // Load a specific session
  const loadSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setChatHistory(session.messages);
      setSelectedTask(session.task || 'DEFAULT_CHAT');
      setError(null);
    }
  };

  // Delete a session
  const deleteSession = (sessionId) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);

    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        loadSession(updatedSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  // Update current session
  const updateCurrentSession = (newMessages) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // Generate title from first user message
        const firstUserMessage = newMessages.find(m => m.role === 'user');
        const title = firstUserMessage
          ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : 'New Chat';

        return {
          ...session,
          messages: newMessages,
          title: title,
          updatedAt: new Date().toISOString(),
          task: selectedTask // Save context
        };
      }
      return session;
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    updateCurrentSession(updatedHistory);
    setIsLoading(true);

    try {
      // Prepare history for API (only role and content)
      const historyForApi = chatHistory
        .filter(msg => !msg.isError) // Exclude error messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      console.log('Task:', selectedTask);

      // Call backend API with fetch
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: historyForApi,
          question: userMessage,
          task: selectedTask // PASS THE SELECTED TASK
        })
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        // Add assistant response to chat
        const assistantMessage = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString()
        };

        const finalHistory = [...updatedHistory, assistantMessage];
        setChatHistory(finalHistory);
        updateCurrentSession(finalHistory);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }

    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg = err.message || 'Failed to connect to AI service.';
      setError(errorMsg);

      const errorMessage = {
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      const finalHistory = [...updatedHistory, errorMessage];
      setChatHistory(finalHistory);
      updateCurrentSession(finalHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const activeTask = AI_TASKS.find(t => t.id === selectedTask) || AI_TASKS[0];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Sessions */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 p-3 mb-2 rounded-lg cursor-pointer transition-colors ${currentSessionId === session.id
                ? 'bg-indigo-50 border border-indigo-200'
                : 'hover:bg-gray-100'
                }`}
              onClick={() => loadSession(session.id)}
            >
              <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.title}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                  {session.task && session.task !== 'DEFAULT_CHAT' && (
                    <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">
                      {AI_TASKS.find(t => t.id === session.task)?.label.split(' ')[0]}...
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Feature Selector */}
        <div className="bg-white border-b border-gray-200 shadow-sm z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">AI Legal Associate</h1>
                <p className="text-xs text-indigo-600 font-medium">{activeTask.label}</p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {chatSessions.length} active sessions
            </div>
          </div>

          {/* Feature Selector Scrollable Area */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide flex gap-3 snap-x">
            {AI_TASKS.map((task) => {
              const Icon = task.icon;
              const isActive = selectedTask === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={`flex flex-col items-center justify-center p-2 min-w-[90px] w-[90px] h-[70px] rounded-xl border transition-all cursor-pointer snap-start flex-shrink-0 ${isActive
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-200'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  title={task.desc}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-[10px] text-center font-medium leading-tight line-clamp-2">
                    {task.label.replace('Legal ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <Bot className="w-16 h-16 mb-4" />
              <p>Start a conversation...</p>
            </div>
          )}

          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[100%] sm:max-w-[80%] rounded-2xl px-5 py-4 shadow-sm text-sm ${message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : message.isError
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                  }`}
              >
                {message.role === 'assistant' ? (
                  <MessageContent content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}

                <p className={`text-[10px] mt-2 text-right ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 mt-1 hidden sm:block">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm rounded-bl-none">
                <div className="flex gap-1.5 list-none">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${activeTask.label}... (Shift+Enter for new line)`}
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 px-3 max-h-32 text-gray-900 placeholder-gray-500 text-sm"
                rows="1"
                style={{ minHeight: '44px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="mb-1 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                title="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              This AI uses {activeTask.label} mode. Verify all results with a professional.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AILegalAssistantImproved;
