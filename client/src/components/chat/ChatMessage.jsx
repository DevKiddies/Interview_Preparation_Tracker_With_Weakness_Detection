import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full mb-6 gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <Bot size={16} />
        </div>
      )}
      
      <div 
        className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-[14px] leading-relaxed transition-colors duration-200
        ${isUser 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-code:text-blue-600 dark:prose-code:text-blue-400">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-slate-300 dark:border-slate-600">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
