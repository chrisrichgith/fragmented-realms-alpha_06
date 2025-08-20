function RPG({ user, socket }) {
  // This component will eventually manage the state between WorldMap and Battle
  // For now, it just renders the WorldMap.
  return (
    <div>
      <WorldMap user={user} socket={socket} />
    </div>
  );
}
