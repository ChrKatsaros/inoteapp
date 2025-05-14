import React, { useState, useEffect } from "react";
import axios from "axios";

function Notes() {
  const [note, setNote] = useState({
    title: "",
    content: "",
  });

  const [newNotes, setNewNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Προσθέτουμε έναν state για να ξέρουμε αν επεξεργαζόμαστε
  const [editIndex, setEditIndex] = useState(null); // Αποθηκεύουμε το index της σημείωσης που επεξεργαζόμαστε

  useEffect(() => {
    axios
      .get("http://localhost:5000/notes")
      .then((response) => {
        // Αν η λίστα είναι άδεια, προσθέτουμε την προεπιλεγμένη σημείωση
        if (response.data.length === 0) {
          setNewNotes([]); // Αν δεν υπάρχουν σημειώσεις, αφήνουμε τη λίστα άδεια
        } else {
          setNewNotes(response.data); // Αν υπάρχουν σημειώσεις, τις φορτώνουμε
        }
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
      });
  }, []);

  // Χειριστής για τις αλλαγές στα πεδία
  function handleInput(event) {
    const { name, value } = event.target;
    setNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  }

  // Χειριστής για την προσθήκη ή επεξεργασία σημείωσης
  function handleClick() {
    // Αποτροπή κενών εισαγωγών
    if (!note.title.trim() || !note.content.trim()) {
      alert("Please fill out both the title and the content.");
      return;
    }

    if (isEditing) {
      // Επεξεργασία σημείωσης
      const noteToEdit = newNotes[editIndex];
      axios
        .put(`http://localhost:5000/notes/${noteToEdit.id}`, note)
        .then((response) => {
          const updatedNotes = [...newNotes];
          updatedNotes[editIndex] = response.data;
          setNewNotes(updatedNotes); // Ενημερώνουμε τις σημειώσεις
          setIsEditing(false); // Επιστρέφουμε την κατάσταση στην προσθήκη
          setEditIndex(null); // Αδειάζουμε το index της επεξεργασίας
          setNote({ title: "", content: "" }); // Αδειάζουμε τα πεδία
        })
        .catch((error) => {
          console.error("Error updating note:", error);
        });
    } else {
      // Προσθήκη νέας σημείωσης
      axios
        .post("http://localhost:5000/notes", note)
        .then((response) => {
          setNewNotes((prevNotes) => [response.data, ...prevNotes]);
          setNote({ title: "", content: "" });
        })
        .catch((error) => {
          console.error("Error adding note:", error);
        });
    }
  }

  // Χειριστής για τη διαγραφή σημείωσης
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

  // Χειριστής για την επεξεργασία σημείωσης
  function handleEdit(index) {
    const noteToEdit = newNotes[index];
    setNote(noteToEdit); // Φόρτωση της σημείωσης για επεξεργασία
    setIsEditing(true); // Ενεργοποιούμε την κατάσταση επεξεργασίας
    setEditIndex(index); // Αποθηκεύουμε το index της σημείωσης που επεξεργαζόμαστε
  }

  // Αν δεν υπάρχουν σημειώσεις, εμφανίζουμε την προεπιλεγμένη σημείωση
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
          {isEditing ? "Confirm Edit" : "Add Note"} {/* Εμφανίζουμε το κατάλληλο κείμενο στο κουμπί */}
        </button>

        <div className="notes-list">
          {newNotes.length === 0 ? (
            // Εμφάνιση της προεπιλεγμένης σημείωσης με κουμπιά
            <div className="note">
              <h2>{defaultNote.title}</h2>
              <p>{defaultNote.content}</p>
              <button className="deleteButton">Delete</button>
              <button className="editButton">Edit</button>
            </div>
          ) : (
            // Αν υπάρχουν σημειώσεις, τις εμφανίζουμε κανονικά
            newNotes.map((theNotes, index) => (
              <div className="note" key={theNotes.id}>
                <h2>{theNotes.title}</h2>
                <p>{theNotes.content}</p>
                <button
                  className="deleteButton"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
                <button className="editButton" onClick={() => handleEdit(index)}>
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
