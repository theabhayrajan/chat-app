import React, { useState } from 'react';
import Chat from './Chat';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleJoin = () => {
    if (username.trim() !== "") setShowChat(true);
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinContainer">
          <h2>Join the Chat</h2>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleJoin}>Join</button>

        </div>
      ) : (
        <Chat username={username} />
      )}
    </div>
  );
}

export default App;
