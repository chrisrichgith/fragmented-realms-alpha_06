function CharacterSheet({ character, rpg, onStartRpg }) {

    if (!character) {
        return (
            <div className="character-sheet-container">
                <h3>Charakter</h3>
                <p>No character created.</p>
                <button onClick={onStartRpg} className="char-button">Create Character</button>
            </div>
        );
    }

    return (
        <div className="character-sheet-container">
            <h3>Charakter</h3>
            <h4 id="char-name">{character.name}</h4>
            <img src={character.image} alt="Charakter Portrait" className="char-portrait" />
            <ul id="charStats">
                <li className="char-stat"><span>Level:</span> <span>{rpg.level || 1}</span></li>
                <li className="char-stat"><span>XP:</span> <span>{rpg.xp || 0}</span></li>
                <li className="char-stat"><span>Stärke:</span> <span>{character.stats.strength}</span></li>
                <li className="char-stat"><span>Geschick:</span> <span>{character.stats.dexterity}</span></li>
                <li className="char-stat"><span>Intelligenz:</span> <span>{character.stats.intelligence}</span></li>
            </ul>
            <button onClick={onStartRpg} className="char-button">Start RPG</button>
        </div>
    );
}
