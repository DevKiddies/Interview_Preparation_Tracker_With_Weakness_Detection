import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ input, setInput, onSendMessage, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a technical question..."
          disabled={disabled}
          className="flex-grow bg-transparent text-slate-800 dark:text-slate-100 p-2 max-h-[120px] focus:outline-none resize-none overflow-y-auto scrollbar-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans text-sm"
          rows={1}
        />
        <button
          onClick={onSendMessage}
          disabled={disabled || !input.trim()}
          className={`p-2 rounded-lg h-9 w-9 flex items-center justify-center transition-all duration-200 shrink-0 mb-0.5 mr-0.5
            ${input.trim() && !disabled 
              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95' 
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
        >
          <Send size={16} className={`${input.trim() && !disabled ? 'translate-x-0.5' : ''} transition-transform`} />
        </button>
      </div>
    </div>
  );
}