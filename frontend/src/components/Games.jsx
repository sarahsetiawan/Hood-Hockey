import "../styles/Games.css";

function Game({ game, onDelete, onEdit }) {
    return (
        <div className="game-card">
            <h3>{game.Opponent}</h3>
            <p>Home Score: {game.Score_HC}</p>
            <p>Opponent Score: {game.Score_Opp}</p>
            <button onClick={() => onDelete(game.id)}>Delete</button>
            <button onClick={onEdit}>Edit</button> {/* ✅ Edit button added */}
        </div>
    );
}

export default Game;

