import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = 5000;

// Εξασφαλίζουμε ότι συνδεόμαστε στη σωστή βάση δεδομένων (inotes)
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "inotes",  // Εδώ αλλάζουμε το όνομα της βάσης δεδομένων σε inotes
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(cors());
app.use(bodyParser.json());

// Route για την αρχική σελίδα
app.get("/", (req, res) => {
  res.send("Welcome to iNotes");
});

// Route για την προβολή όλων των σημειώσεων
app.get("/notes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Route για την προσθήκη νέας σημείωσης
app.post("/notes", async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// Route για τη διαγραφή σημείωσης
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM notes WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ deletedNote: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Route για την επεξεργασία σημείωσης (UPDATE)
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *",
      [title, content, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(result.rows[0]); // Επιστρέφουμε την ενημερωμένη σημείωση
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
