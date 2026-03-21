import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';

// Direct API URL - bypassing axios instance
const API_URL = 'http://localhost:5001/api/ai-legal-assistant/chat';

const AILegalAssistantNew = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Initialize with welcome message
  useEffect(() => {
    setChatHistory([
      {
        role: 'assistant',
        content: `Hello! I'm your AI Legal Assistant for CaseXpert. I can help you with:

• Explaining legal concepts in simple language
• Understanding Indian laws and legal procedures
• Drafting basic legal documents
• Answering general legal questions

How can I assist you today?`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

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

    setChatHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare history for API (only role and content)
      const historyForApi = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Calling backend:', API_URL);
      console.log('Request body:', { history: historyForApi, question: userMessage });

      // Call backend API with fetch
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: historyForApi,
          question: userMessage
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        // Add assistant response to chat
        const assistantMessage = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString()
        };

        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }

    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get response from AI. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setChatHistory(prev => [...prev, errorMessage]);
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

  const clearChat = () => {
    setChatHistory([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you with legal information today?',
        timestamp: new Date().toISOString()
      }
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Legal Assistant</h1>
                <p className="text-sm text-gray-600">Powered by GPT-4o-mini</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white shadow-lg" style={{ height: '500px', overflowY: 'auto' }}>
          <div className="p-6 space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.isError
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a legal question... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">
                <strong>Disclaimer:</strong> AI Legal Assistant provides general legal information only, not legal advice. 
                For specific legal matters, please consult a qualified lawyer or advocate.
              </p>
            </div>
          </form>
        </div>

        {/* Quick Questions */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "What is the difference between civil and criminal cases?",
              "How do I file an FIR?",
              "What are my rights during police questioning?",
              "Explain bail and anticipatory bail"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILegalAssistantNew;
