import React, { useState } from 'react';
import api from '../lib/api.js';
import ChatBubble from '../components/ChatBubble.jsx';

const languages = ['English', 'Hindi', 'Spanish', 'French'];

const LegalAssistant = () => {
  const [language, setLanguage] = useState('English');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAssistant = async e => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    const newMessages = [...messages, { role: 'user', text: trimmed }];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/query', { question: trimmed, language });
      setMessages([...newMessages, { role: 'assistant', text: data.answer }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'The assistant is currently unavailable. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">AI Legal Assistant</h1>
        <p className="text-xs text-slate-500">
          Ask high-level legal questions in plain language. Responses are for information only and
          are not a substitute for legal advice.
        </p>
      </header>
      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Language:</span>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {languages.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-3">
          {messages.length === 0 && (
            <p className="text-xs text-slate-400">
              Start the conversation by asking something like What are the key clauses in a
              simple service agreement?
            </p>
          )}
          {messages.map((m, idx) => (
            <ChatBubble key={idx} role={m.role} text={m.text} />
          ))}
        </div>
        <form onSubmit={askAssistant} className="mt-2 flex items-end gap-2">
          <textarea
            rows={2}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Type your legal question here (do not paste highly sensitive personal data)."
            className="flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex h-10 items-center rounded-md bg-primary-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LegalAssistant;
