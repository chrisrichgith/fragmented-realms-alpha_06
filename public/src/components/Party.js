function Party({ party, currentUser, onStartGame }) {
  const isLeader = party.length > 0 && party[0] === currentUser;

  return (
    <div className="party-container">
      <h3>Party</h3>
      <ul>
        {party.map(member => (
          <li key={member}>
            {member} {member === party[0] ? '(Leader)' : ''}
          </li>
        ))}
      </ul>
      {party.length > 1 && isLeader && (
        <button onClick={onStartGame}>Start RPG for Party</button>
      )}
      {party.length > 1 && !isLeader && (
        <p>Waiting for leader to start...</p>
      )}
    </div>
  );
}
