import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

function App() {
  const [name, setName] = useState("");
  const [connectedName, setConnectedName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // connect
    socketRef.current = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

    // receive messages
    socketRef.current.on("chatMessage", (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = () => {
    if (!name.trim()) return;
    setConnectedName(name);
    socketRef.current.emit("join", name);
  };

  const handleSend = () => {
    if (!message.trim() || !connectedName) return;
    const now = new Date();
    const time = now.toLocaleTimeString();
    const payload = {
      name: connectedName,
      message: message.trim(),
      time
    };
    socketRef.current.emit("chatMessage", payload);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="container">
      <h1>Real-Time Chat</h1>

      <div className="panel">
        <div className="join">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="nameInput"
            disabled={!!connectedName}
          />
          {!connectedName ? (
            <button onClick={handleJoin}>Join</button>
          ) : (
            <div className="joined">You: <b>{connectedName}</b></div>
          )}
        </div>

        <div className="chatArea">
          <div className="messages" id="messages">
            {messages.map((m, i) => (
              <div key={i} className="message">
                <b>{m.name}</b> <span className="time">[{m.time}]</span>: {m.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            <input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>

      <div className="help">
        Open multiple browser windows and join with different names to test realtime chat.
      </div>
    </div>
  );
}

export default App;
