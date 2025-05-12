import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to iNotes");
});

app.get("/notes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
  }
});

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
  }
});

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
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});