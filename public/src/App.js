function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [inGame, setInGame] = React.useState(false);
  const [socket, setSocket] = React.useState(null);

  React.useEffect(() => {
    if (socket) {
      // Listen for updates to the user's own data (resources, etc.)
      socket.on('user data', (data) => {
        setUser(prevUser => ({ ...prevUser, ...data }));
      });
    }
    // Cleanup the socket listeners when the socket changes or component unmounts
    return () => {
      if (socket) {
        socket.off('user data');
      }
    };
  }, [socket]);

  const handleLoginSuccess = (userData, newSocket) => {
    setSocket(newSocket);
    setUser(userData); // Set the initial user data from login
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (socket) {
      socket.emit('logout');
      socket.disconnect();
    }
    setSocket(null);
    setUser(null);
    setIsLoggedIn(false);
    setInGame(false);
  };

  const handleStartRpg = () => {
    setInGame(true);
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
    if (inGame) {
      return <RPG user={user} socket={socket} />;
    }
    return <Lobby user={user} socket={socket} onStartRpg={handleStartRpg} />;
  };

  return (
    <div>
      <header className="main-header">
        <div className="logo-container">
            <img src="/images/Chat/Logo.png" alt="Fragmented Realms" className="main-logo" />
        </div>
        {isLoggedIn && user && (
          <div className="user-info-container">
            <div className="user-info">Welcome, {user.username}</div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        )}
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
