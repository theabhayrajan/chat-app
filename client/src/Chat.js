import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { FiPlus, FiSun, FiMoon } from 'react-icons/fi';
import Picker from 'emoji-picker-react';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const socket = io.connect("http://localhost:5000");

function Chat({ username }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (message.trim() !== "" || fileInputRef.current.files.length > 0) {
      const data = { user: username, text: message, attachment: null };
      const file = fileInputRef.current.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          data.attachment = { name: file.name, type: file.type, data: reader.result };
          socket.emit('send_message', data);
          setMessage("");
          fileInputRef.current.value = "";
        };
        reader.readAsDataURL(file);
      } else {
        socket.emit('send_message', data);
        setMessage("");
      }
    }
  };

  useEffect(() => {
    socket.emit('new_user', username);

    socket.on('receive_message', (data) => {
      if (data.system) toast.info(data.text, { position: "top-center" });
      setChatHistory((prev) => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, [username]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // 🟢 FIXED: updated emoji-picker-react API usage
  const onEmojiClick = (emojiObj) => {
    setMessage((prev) => prev + emojiObj.emoji);
  };

  return (
    <div className={`chatContainer d-flex flex-column h-100 w-100 position-relative ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
        <h4 className="mb-0">Chatting as {username}</h4>
        <button
          className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      <div className="messages flex-grow-1 overflow-auto p-2" style={{ marginBottom: '60px' }}>
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.user === username ? "text-end" : "text-start"}`}>
            {msg.system ? (
              <em className="text-secondary">{msg.text}</em>
            ) : (
              <div>
                <strong>{msg.user}: </strong> {msg.text}
                {msg.attachment && (
                  <div className="mt-1">
                    {msg.attachment.type.startsWith("image/") ? (
                      <img src={msg.attachment.data} alt={msg.attachment.name} className="img-fluid rounded" style={{ maxWidth: '200px' }} />
                    ) : (
                      <a href={msg.attachment.data} download={msg.attachment.name} className="text-primary">
                        📎 {msg.attachment.name}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showEmoji && (
        <div className="position-absolute w-100" style={{ bottom: '60px' }}>
          <Picker onEmojiClick={onEmojiClick} width="100%" />
        </div>
      )}

      <div className="position-absolute bottom-0 start-0 end-0 border-top d-flex align-items-center bg-white p-2 w-100">
        <button className="btn border-0" onClick={() => fileInputRef.current.click()}>
          <FiPlus size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={() => sendMessage()}
        />
        <input
          type="text"
          className="form-control border-0 flex-grow-1"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn btn-link text-decoration-none" onClick={() => setShowEmoji(!showEmoji)}>
          😊
        </button>
        <button className="btn btn-success" onClick={sendMessage}>
          Send
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Chat;
