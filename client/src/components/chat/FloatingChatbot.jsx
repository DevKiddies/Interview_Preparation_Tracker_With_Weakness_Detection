import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { ChatAPI } from '../../utils/chatApi';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize the greeting directly in the state to avoid a useEffect double-render
  const [messages, setMessages] = useState([{
    id: 'initial-greeting',
    sender: 'ai',
    text: "Hello! 👋\n\nI am your AI Chatbot. Ask me anything about:\n* **Data Structures & Algorithms**\n* **Java & Spring Boot**\n* **System Design**\n* **HR Questions**\n\nHow can I help you today?",
    timestamp: new Date().toISOString()
  }]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const data = await ChatAPI.sendMessage(userText);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.response, timestamp: new Date().toISOString() }]);
    } catch (error) {
      // Log the error here to fix the linter warning and help with future debugging
      console.error("Chat API Error:", error); 
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "Sorry, I couldn't connect to the server. Please try again later.", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] mb-4 bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Chatbot</h3>
                <p className="text-[10px] text-green-500 font-medium">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 scroll-smooth onboarding-scroll">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          <div className="shrink-0">
            <ChatInput 
              input={input} 
              setInput={setInput} 
              onSendMessage={handleSendMessage} 
              disabled={loading} 
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}