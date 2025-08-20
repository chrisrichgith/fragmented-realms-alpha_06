function UserList({ users, currentUser }) {
  return (
    <div className="users-panel">
      <h3>Players Online</h3>
      <ul>
        {users.map(user => (
          <li key={user.username} style={{ fontWeight: user.username === currentUser ? 'bold' : 'normal' }}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
