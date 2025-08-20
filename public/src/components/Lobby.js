function Lobby({ user, socket, onStartRpg }) {
  const [users, setUsers] = React.useState([]);
  const [party, setParty] = React.useState([]);

  React.useEffect(() => {
    if (!socket) return;

    // Listen for the user list and party updates
    socket.on('user list', (userList) => {
        setUsers(userList || []);
    });

    socket.on('rpg:party-update', (data) => {
        setParty(data.party || []);
    });

    // The server emits the user list automatically when it changes
    // And user data is handled by the App component

    return () => {
      // Clean up listeners
      socket.off('user list');
      socket.off('rpg:party-update');
    };
  }, [socket]);

  const handleUnlockGame = (gameId) => {
    if (socket && confirm(`Möchtest du dieses Spiel freischalten?`)) {
        socket.emit('game:unlock', gameId);
    }
  };

  return (
    <div className="main-content">
      <div className="left-panels-wrapper">
        <UserList users={users} currentUser={user.username} />
        <CharacterSheet character={user.selectedCharacter} rpg={user.rpg} onStartRpg={onStartRpg} />
        <Party party={party} currentUser={user.username} onStartGame={onStartRpg} />
      </div>
      <Chat socket={socket} />
      <div className="right-panels-wrapper">
        <Resources resources={user.resources || {}} />
        <GameList unlockedGames={user.unlockedGames || []} onUnlockGame={handleUnlockGame} />
      </div>
    </div>
  );
}
