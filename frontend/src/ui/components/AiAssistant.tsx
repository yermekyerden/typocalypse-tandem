import { useState, useRef, useEffect } from 'react';

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {!isOpen && (
        <button
          className="fixed bottom-10 right-10 bg-yellow-400 text-gray-950 px-5 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-900 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.8)] cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          AI Assistant
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-3 right-5 w-80 h-96 bg-mist-950 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_20px_rgba(250,204,21,0.4)]">
          <div className="flex justify-between items-center bg-mist-950 text-gray-300 text-sm px-4 py-1">
            <span>AI Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-100 font-bold hover:text-yellow-400"
            >
              ×
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-mist-900 rounded-2xl ml-2 mr-2 scrollbar-thin">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm">How can I help you?</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className="
                  bg-[#2C2C2C] text-gray-100 px-3 py-1 rounded-2xl break-words whitespace-normal opacity-0 transform translate-y-2 animate-fade-in"
              >
                {msg}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-2xl px-3 py-1 focus:outline-none bg-mist-900 placeholder-gray-400"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="ml-2 h-10 bg-yellow-400 text-gray-900 px-3 py-0 rounded-full hover:bg-gray-900 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.8)] cursor-pointer transition-all duration-300 ease-in-out"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
