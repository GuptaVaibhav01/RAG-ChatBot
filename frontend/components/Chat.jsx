import React from 'react';

const Chat = ({ messages }) => {
  return (
    <div className="bg-white p-4 rounded shadow h-96 overflow-y-scroll">
      {messages.map((msg, i) => (
        <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
          <div className={`inline-block p-2 rounded-lg ${msg.role === "user" ? "bg-blue-100" : "bg-green-100"}`}>
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chat;
