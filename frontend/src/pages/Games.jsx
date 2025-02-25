import { useState, useEffect } from "react";
import api from "../api";
import Game from "../components/Games"
import "../styles/Games.css"

function Games() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        getGames();
    }, []);

    const getGames = () => {
        api
            .get("/hood_hockey_app/games/")
            .then((res) => res.data)
            .then((data) => {
                setNotes(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const deleteGame = (id) => {
        api
            .delete(`/hood_hockey_app/games/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Game deleted!");
                else alert("Failed to delete Game.");
                getNotes();
            })
            .catch((error) => alert(error));
    };

    const createGame = (e) => {
        e.preventDefault();
        api
            .post("/hood_hockey_app/games/", { content, title })
            .then((res) => {
                if (res.status === 201) alert("Game added!");
                else alert("Failed to add game.");
                getNotes();
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <div>
                <h2>Games</h2>
                {notes.map((note) => (
                    <Note note={note} onDelete={deleteGame} key={note.id} />
                ))}
            </div>
            <h2>Add a Game</h2>
            <form onSubmit={createGame}>
                <label htmlFor="title">Title:</label>
                <br />
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
                <label htmlFor="content">Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
}

export default Games;