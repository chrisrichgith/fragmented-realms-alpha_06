function Chat({ socket }) {
    const [messages, setMessages] = React.useState([]);
    const [currentMessage, setCurrentMessage] = React.useState('');
    const chatMessagesRef = React.useRef(null);

    React.useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        };

        socket.on('chat message', handleChatMessage);

        return () => {
            socket.off('chat message', handleChatMessage);
        };
    }, [socket]);

    React.useEffect(() => {
        // Auto-scroll to the bottom
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (currentMessage.trim() && socket) {
            socket.emit('chat message', { text: currentMessage });
            // The message will be added to the list when the server broadcasts it back
            setCurrentMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages" ref={chatMessagesRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.user === 'System' ? 'system-message' : ''}`}>
                        <span className="sender">{msg.user}: </span>
                        <span className="text">{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Schreibe eine Nachricht..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                </div>
                <button onClick={handleSendMessage} className="send-button">Senden</button>
            </div>
        </div>
    );
}
