const GAMES_CONFIG = {
    'space-shooter': {
        displayName: 'Space Shooter',
        icon: '/images/Chat/space-shooter.png',
        costs: { gold: 100, kristall: 25 }
    }
    // Other games like 'garden' and 'puzzle' would be added here
};

function GameList({ unlockedGames, onUnlockGame }) {
    return (
        <div className="game-buttons-container">
            <h3>Spiele</h3>
            <div id="gameList">
                {Object.keys(GAMES_CONFIG).map(gameId => {
                    const game = GAMES_CONFIG[gameId];
                    const isUnlocked = unlockedGames.includes(gameId);

                    if (isUnlocked) {
                        return (
                            <div key={gameId} className="game-item">
                                <a href={`/games/${gameId}/index.html`} target="_blank" className="play-button">
                                    <img src={game.icon} alt={game.displayName} className="game-icon" />
                                    <span>{game.displayName} spielen</span>
                                </a>
                            </div>
                        );
                    } else {
                        const costString = Object.entries(game.costs)
                            .map(([resource, cost]) => `${cost} ${resource}`)
                            .join(', ');

                        return (
                            <div key={gameId} className="game-item">
                                <button className="unlock-button" onClick={() => onUnlockGame(gameId)}>
                                    <img src={game.icon} alt={game.displayName} className="game-icon" />
                                    <span>{game.displayName} freischalten</span>
                                    <div className="cost-container">({costString})</div>
                                </button>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}
