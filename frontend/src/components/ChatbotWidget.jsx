import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';

const quickPrompts = [];

const initialAssistantText = "Hi! I'm your Oil Store Assistant. Ask me about product availability, budget-friendly suggestions, or your orders."

function ChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: initialAssistantText
    }
  ]);

  const viewportHint = useMemo(() => {
    return isAuthenticated && user?.name ? `Hi ${user.name.split(' ')[0]}` : 'Need help?';
  }, [isAuthenticated, user]);

  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    const response = await chatService.ask(trimmed);

    const assistantText = response?.success
      ? response.answer
      : 'Something went wrong while answering. Please try again.';

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: 'assistant',
        text: assistantText
      }
    ]);
    setIsSending(false);
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-[9999]">
      {isOpen && (
        <div className="mb-4 w-[92vw] max-w-[340px] sm:max-w-[360px] h-[520px] rounded-2xl border border-orange-200 bg-white shadow-[0_24px_48px_rgba(15,23,42,0.24)] overflow-hidden animate-[fadeIn_.2s_ease-out]">
          <div className="h-14 px-4 bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Oil Store AI</p>
                <p className="text-[11px] text-orange-100 leading-tight">Smart assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-transparent hover:bg-white/20 border-0"
              aria-label="Close chatbot"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={listRef} className="h-[402px] overflow-y-auto bg-[#f8f8fb] px-3 py-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-6 ${
                    message.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-md'
                      : 'bg-orange-50 text-slate-700 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="mb-1 flex items-center gap-1 text-orange-600">
                      <Bot size={14} />
                      <span className="text-[10px] uppercase tracking-wide">Assistant</span>
                    </div>
                  )}
                  {message.text}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-[#ece9ee] rounded-2xl rounded-bl-md px-3 py-2 text-sm text-slate-500">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t border-orange-100 bg-white">

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                {isAuthenticated ? <UserRound size={14} /> : <Bot size={14} />}
              </div>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="flex-1 h-10 rounded-full border border-orange-200 px-4 text-sm outline-none focus:border-orange-400"
                placeholder="Ask me anything..."
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="w-9 h-9 rounded-full bg-orange-500 text-white border-0 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-orange-600 flex items-center justify-center"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 px-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-[0_18px_36px_rgba(249,115,22,0.45)] border-0 hover:scale-[1.02] transition-transform flex items-center gap-2"
        aria-label="Open chatbot"
      >
        {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="text-sm font-semibold">{isOpen ? 'Close' : viewportHint}</span>
      </button>
    </div>
  );
}

export default ChatbotWidget;