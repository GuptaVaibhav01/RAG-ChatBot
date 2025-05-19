import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const sendQuery = async () => {
    if (!input.trim()) return; // Prevent sending empty messages

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8000/chat", { question: input });
      const botMessage = { role: "bot", text: res.data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Oops! Something went wrong." }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-4 flex flex-col h-[90vh]">
        <h1 className="text-2xl font-bold text-center mb-4">RAG Chatbot</h1>
        
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 border rounded">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-2 rounded-lg ${m.role === "user" ? "bg-blue-100" : "bg-green-100"}`}>
                <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="flex">
          <input
            className="flex-1 border p-2 rounded-l"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendQuery()}
            placeholder="Type your question..."
          />
          <button
            onClick={sendQuery}
            className="bg-blue-500 text-white px-4 rounded-r"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
