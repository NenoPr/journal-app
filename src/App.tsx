import { useState, useEffect } from "react";
import type { JournalEntry } from "./types/JournalEntry";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entryOpen, setEntryOpen] = useState<boolean>(false);
  const [entryText, setEntryText] = useState<string>("");
  const [entryTitle, setEntryTitle] = useState<string>("");
  const [entryDeleteId, setEntryDeleteId] = useState<string | null>(null);

  useEffect(() => {}, [entryText]);

  const saveEntry = () => {
    const entry = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    setEntries([...entries, entry]);

    setTitle("");
    setContent("");
  };

  const openJournalEntry = (id: string) => {
    entries.find((entry) => {
      if (entry.id === id) {
        setEntryText(entry.content);
        setEntryTitle(entry.title);
        setEntryOpen(true);
      }
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== id),
    );
    setEntryDeleteId(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Journal</h1>

      <input
        className="entry-input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />
      <br />

      <textarea
        className="entry-input"
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={15}
        cols={100}
      />

      <br />
      <br />

      <button onClick={saveEntry} className="entry-button">
        Save Entry
      </button>

      <hr />

      <ul>
        {entryOpen ? (
          <div className="entry-open">
            <h2>{entryTitle}</h2>
            <hr />
            <p>{entryText}</p>
            <hr />
            <button
              className="entry-button"
              onClick={() => setEntryOpen(false)}
            >
              Back
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="entry">
              <strong
                onClick={() => openJournalEntry(entry.id)}
                className="cursor-pointer journal-entry"
              >
                <div className="journal-entry-title">{entry.title}</div>
                <div className="journal-entry-date">
                  {new Date(entry.createdAt).toLocaleString()}
                </div>
              </strong>
              {entryDeleteId === entry.id ? (
                <div className="delete-entry-ask">
                  <div className="delete-entry-ask-question">
                    <span>Delete?</span>
                    <span
                      className="cursor-pointer delete-entry"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      Yes
                    </span>
                    <span
                      className="cursor-pointer delete-entry-no"
                      onClick={() => setEntryDeleteId(null)}
                    >
                      No
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="delete-entry cursor-pointer"
                  onClick={() => setEntryDeleteId(entry.id)}
                >
                  Delete
                </div>
              )}
            </div>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
