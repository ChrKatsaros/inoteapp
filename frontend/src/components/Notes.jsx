import React, { useState, useEffect } from "react";
import axios from "axios";

function Notes() {
  const [note, setNote] = useState({
    title: "",
    content: "",
  });

  const [newNotes, setNewNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/notes")
      .then((response) => {
        if (response.data.length === 0) {
          setNewNotes([]);
        } else {
          // Προσθέτουμε το πεδίο completed αν δεν υπάρχει
          const notesWithCompleted = response.data.map((note) => ({
            ...note,
            completed: false,
          }));
          setNewNotes(notesWithCompleted);
        }
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
      });
  }, []);

  function handleInput(event) {
    const { name, value } = event.target;
    setNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  }

  function handleClick() {
    if (!note.title.trim() || !note.content.trim()) {
      alert("Please fill out both the title and the content.");
      return;
    }

    if (isEditing) {
      const noteToEdit = newNotes[editIndex];
      axios
        .put(`http://localhost:5000/notes/${noteToEdit.id}`, note)
        .then((response) => {
          const updatedNotes = [...newNotes];
          updatedNotes[editIndex] = {
            ...response.data,
            completed: newNotes[editIndex].completed || false, // κρατάμε την completed τιμή
          };
          setNewNotes(updatedNotes);
          setIsEditing(false);
          setEditIndex(null);
          setNote({ title: "", content: "" });
        })
        .catch((error) => {
          console.error("Error updating note:", error);
        });
    } else {
      axios
        .post("http://localhost:5000/notes", note)
        .then((response) => {
          setNewNotes((prevNotes) => [
            { ...response.data, completed: false },
            ...prevNotes,
          ]);
          setNote({ title: "", content: "" });
        })
        .catch((error) => {
          console.error("Error adding note:", error);
        });
    }
  }

  function handleDelete(index) {
    const noteToDelete = newNotes[index];
    axios
      .delete(`http://localhost:5000/notes/${noteToDelete.id}`)
      .then(() => {
        setNewNotes((prevNotes) => prevNotes.filter((_, i) => i !== index));
      })
      .catch((error) => {
        console.error("Error deleting note:", error);
      });
  }

  function handleEdit(index) {
    const noteToEdit = newNotes[index];
    setNote({ title: noteToEdit.title, content: noteToEdit.content });
    setIsEditing(true);
    setEditIndex(index);
  }

  function toggleCompleted(index) {
    setNewNotes((prevNotes) =>
      prevNotes.map((note, i) =>
        i === index ? { ...note, completed: !note.completed } : note
      )
    );
  }

  const defaultNote = {
    title: "Welcome to iNotes",
    content: "This is your first note! 😊",
  };

  return (
    <div className="notes-container">
      <div className="notes">
      
        <h2 className="usersName">
          <span>i</span>Note
        </h2>
        <input
          name="title"
          value={note.title}
          placeholder="Title"
          onChange={handleInput}
        />
        <textarea
          name="content"
          value={note.content}
          placeholder="Take a note.."
          onChange={handleInput}
          rows={3}
        />
       
        <button className="submitButton" onClick={handleClick}>
          {isEditing ? "Confirm Edit" : "Add Note"}
        </button>

        <div className="notes-list">
          {newNotes.length === 0 ? (
            <div className="note">
              <h2>{defaultNote.title}</h2>
              <p>{defaultNote.content}</p>
              <button className="deleteButton">Delete</button>
              <button className="editButton">Edit</button>
            </div>
          ) : (
            newNotes.map((theNotes, index) => (
              <div className="note" key={theNotes.id}>
                <input
                  type="checkbox" 
                  checked={theNotes.completed || false}
                  onChange={() => toggleCompleted(index)}
                 style={{
          marginRight: "10px",
          transform: "scale(1.2)", // Μεγαλώνουμε το checkbox για να το κάνουμε πιο εμφανές
          accentColor: "yellow", // Ρυθμίζουμε το χρώμα του checkbox σε μωβ
        }}
                />
                <h2
                  style={{
      textDecoration: theNotes.completed ? "line-through" : "none",
      color: theNotes.completed ? "red" : "black", // Χρώμα κειμένου κόκκινο αν ολοκληρωθεί
    }}
                >
                  {theNotes.title}
                </h2>
                <p
                  style={{
                    textDecoration: theNotes.completed ? "line-through" : "none",
                  }}
                >
                  {theNotes.content}
                </p>
                <button
                  className="deleteButton"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
                <button
                  className="editButton"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
