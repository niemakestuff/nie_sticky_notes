use crate::Note;
use rusqlite::{Connection, params};
use std::{path::PathBuf, sync::Mutex};

pub struct NotesDb {
    conn: Mutex<Connection>,
}

impl NotesDb {
    pub fn new(dir: PathBuf) -> rusqlite::Result<NotesDb> {
        let conn = Connection::open(dir.join("notes.db"))?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                color TEXT NOT NULL,
                is_color_dark INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                modified_at TEXT NOT NULL
            )",
            [],
        )?;

        Ok(NotesDb {
            conn: Mutex::new(conn),
        })
    }

    fn from_row(row: &rusqlite::Row) -> rusqlite::Result<Note> {
        Ok(Note {
            id: row.get(0)?,
            content: row.get(1)?,
            color: row.get(2)?,
            is_color_dark: row.get(3)?,
            created_at: row.get(4)?,
            modified_at: row.get(5)?,
        })
    }

    pub fn find(&self, note_id: &str) -> rusqlite::Result<Note> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.query_row(
            "SELECT id, content, color, is_color_dark, created_at, modified_at
             FROM notes WHERE id = ?1",
            [note_id],
            NotesDb::from_row,
        )
    }

    pub fn insert(&self, note: &Note) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute(
            "INSERT INTO notes (id, content, color, is_color_dark, created_at, modified_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                note.id,
                note.content,
                note.color,
                note.is_color_dark,
                note.created_at,
                note.modified_at,
            ],
        )
    }

    pub fn update(&self, note: &Note) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute(
            "UPDATE notes
             SET content = ?2, color = ?3, is_color_dark = ?4, modified_at = ?5
             WHERE id = ?1",
            params![
                note.id,
                note.content,
                note.color,
                note.is_color_dark,
                note.modified_at,
            ],
        )
    }

    pub fn delete(&self, note_id: &str) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute("DELETE FROM notes WHERE id = ?1", [note_id])
    }
}
