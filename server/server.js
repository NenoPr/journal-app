import express from "express";
import pool, { initializeDatabase } from "./db.js";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  }),
);

app.use(express.json());

app.get("/api/journal/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, title, content, is_favourite, created_at, updated_at
       FROM journal_entries
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch journal entry",
    });
  }
});

app.get("/api/journal", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, is_favourite,
              created_at,
              updated_at
       FROM journal_entries
       ORDER BY created_at DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch journal entries",
    });
  }
});

app.post("/api/journal", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (typeof title !== "string" || typeof content !== "string") {
      return res
        .status(400)
        .json({ error: "Title and content must be strings" });
    }

    const result = await pool.query(
      `INSERT INTO journal_entries (title, content)
       VALUES ($1, $2)
       RETURNING id, title, content, is_favourite,
                 created_at,
                 updated_at`,
      [title, content],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create journal entry",
    });
  }
});

app.put("/api/journal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_favourite } = req.body;

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof is_favourite !== "boolean"
    ) {
      return res
        .status(400)
        .json({
          error: "Title and content must be strings and is_favourite a boolean",
        });
    }

    const result = await pool.query(
      `UPDATE journal_entries
       SET title = $1,
           content = $2,
           is_favourite = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, title, content,
                 created_at,
                 updated_at, is_favourite`,
      [title, content, is_favourite, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }
    console.log(result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to update journal entry",
    });
  }
});

app.delete("/api/journal/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM journal_entries
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    res.json({
      message: "Journal entry deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to delete journal entry",
    });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize the database:", error);
    process.exitCode = 1;
  }
}

startServer();
