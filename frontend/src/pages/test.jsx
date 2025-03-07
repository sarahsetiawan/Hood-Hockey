import { useState, useEffect } from "react";
import api from "../api";

function Test() {
    const [tests, setTest] = useState([]);
    const [test1, setTest1] = useState("");
    const [test2, setTest2] = useState("");

    useEffect(() => {
        getTests();
    }, []);

    const getTests = () => {
        api
            .get("/hood_hockey_app/test/")
            .then((res) => res.data)
            .then((data) => {
                setTest(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

//    const deleteNote = (id) => {
//        api
//            .delete(`/api/notes/delete/${id}/`)
//            .then((res) => {
//                if (res.status === 204) alert("Note deleted!");
//                else alert("Failed to delete note.");
//                getNotes();
//            })
//            .catch((error) => alert(error));
//    };

    const createTest = (e) => {
        e.preventDefault();
        api
            .post("/hood_hockey_app/test/", { test1, test2 })
            .then((res) => {
                if (res.status === 201) alert("Note created!");
                else alert("Failed to make note.");
                getTests();
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <h2>Create a Test</h2>
            <form onSubmit={createTest}>
                <label htmlFor="test1">test1:</label>
                <br />
                <input
                    type="text"
                    id="test1"
                    name="test1"
                    required
                    onChange={(e) => setTest1(e.target.value)}
                    value={test1}
                />
                <label htmlFor="test2">test2:</label>
                <br />
                <textarea
                    type="number"
                    id="test2"
                    name="test2"
                    required
                    value={test2}
                    onChange={(e) => setTest2(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
}

export default Test;