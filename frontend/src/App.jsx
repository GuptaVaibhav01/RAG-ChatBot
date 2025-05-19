import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const sendQuery = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8000/chat", { question: input });
      const botMessage = { role: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "Oops! Something went wrong." }]);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-box">
      <header className="chat-header">
        <h1 className="chat-title">RAG Chatbot</h1>
        <button className="close-button" onClick={resetChat} aria-label="Reset Chat">
          &times;
        </button>
      </header>

      <div className="chat-area">
        {messages.map((m, i) => (
          <div key={i} className={`message-row ${m.role === "user" ? "user" : "bot"}`}>
            <div className={`message-bubble ${m.role === "user" ? "user" : "bot"}`}>
              <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuery()}
          placeholder="Type your question..."
          aria-label="Chat input"
        />
        <button onClick={sendQuery} className="send-button" aria-label="Send message">
          Send
        </button>
      </div>
    </div>
  );
}
