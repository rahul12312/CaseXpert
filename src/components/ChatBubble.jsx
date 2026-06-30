import React from 'react';

const ChatBubble = ({ role, text }) => {
  const isUser = role === 'user';

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      } text-sm text-slate-800 dark:text-slate-200`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-line leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
