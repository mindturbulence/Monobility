
import React, { useState, useRef, useEffect } from 'react';
import { getWheelExpertAdvice } from '../services/geminiService';
import { TelemetryData, WheelConfig } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  telemetry: TelemetryData;
  wheel: WheelConfig;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ telemetry, wheel }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Expert analysis active for ${wheel.model}. Ask about your wheel's performance or maintenance.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const advice = await getWheelExpertAdvice(userMsg, telemetry);
      setMessages(prev => [...prev, { role: 'assistant', content: advice || "Support link disrupted." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to monobility Expert." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] w-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
              msg.role === 'user' 
                ? 'bg-strava-orange text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-strava-orange rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-strava-orange rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-strava-orange rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask expert..."
          className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 pr-14 focus:outline-none focus:ring-2 focus:ring-strava-orange/20 text-sm font-medium"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-2 w-10 h-10 bg-strava-orange rounded-lg flex items-center justify-center text-white hover:bg-[#E34402] transition-colors"
        >
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
