use crate::Note;
use rusqlite::{Connection, params};
use std::{path::PathBuf, sync::Mutex};

/// Lowercased plain text for the content_text search column. Tags are
/// dropped the same way as the frontend's stripHtml (entities kept as-is).
fn searchable_text(html: &str) -> String {
    let mut text = String::with_capacity(html.len());
    let mut in_tag = false;

    for c in html.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            c if !in_tag => text.push(c),
            _ => {}
        }
    }

    text.to_lowercase()
}

pub struct NotesDb {
    conn: Mutex<Connection>,
}

impl NotesDb {
    pub fn new(dir: PathBuf) -> rusqlite::Result<NotesDb> {
        let conn = Connection::open(dir.join("notes.db"))?;

        // WAL keeps writes cheap and lets reads run alongside a write.
        conn.execute_batch("PRAGMA journal_mode=WAL;")?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                content_text TEXT NOT NULL,
                color TEXT NOT NULL,
                is_color_dark INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                modified_at TEXT NOT NULL,
                is_open INTEGER NOT NULL,
                is_pinned INTEGER NOT NULL
            )",
            [],
        )?;

        // Schema version for migrations. Future schema changes bump this and
        // run their ALTER TABLEs keyed off the version found on disk.
        // Version 1 = the 1.0 release schema.
        let version: i32 = conn.query_row("PRAGMA user_version", [], |row| row.get(0))?;
        if version < 1 {
            conn.execute_batch("PRAGMA user_version = 1;")?;
        }

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
            is_open: row.get(6)?,
            is_pinned: row.get(7)?,
        })
    }

    pub fn get_many(&self, limit: i64) -> rusqlite::Result<Vec<Note>> {
        let conn = self.conn.lock().expect("mutex poisoned");
        let mut stmt = conn.prepare(
            "SELECT id, content, color, is_color_dark, created_at, modified_at, is_open, is_pinned
             FROM notes ORDER BY modified_at DESC LIMIT ?1",
        )?;
        let notes = stmt
            .query_map([limit], NotesDb::from_row)?
            .collect::<rusqlite::Result<Vec<Note>>>()?;

        Ok(notes)
    }

    pub fn find(&self, note_id: &str) -> rusqlite::Result<Note> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.query_row(
            "SELECT id, content, color, is_color_dark, created_at, modified_at, is_open, is_pinned
             FROM notes WHERE id = ?1",
            [note_id],
            NotesDb::from_row,
        )
    }

    pub fn insert(&self, note: &Note) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute(
            "INSERT INTO notes (id, content, content_text, color, is_color_dark, created_at, modified_at, is_open, is_pinned)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                note.id,
                note.content,
                searchable_text(&note.content),
                note.color,
                note.is_color_dark,
                note.created_at,
                note.modified_at,
                note.is_open,
                note.is_pinned,
            ],
        )
    }

    pub fn update(&self, note: &Note) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute(
            "UPDATE notes
             SET content = ?2, content_text = ?3, color = ?4, is_color_dark = ?5, modified_at = ?6,
                 is_open = ?7, is_pinned = ?8
             WHERE id = ?1",
            params![
                note.id,
                note.content,
                searchable_text(&note.content),
                note.color,
                note.is_color_dark,
                note.modified_at,
                note.is_open,
                note.is_pinned,
            ],
        )
    }

    pub fn search(&self, query: &str, limit: i64) -> rusqlite::Result<Vec<Note>> {
        // Escape LIKE wildcards so they match literally
        let escaped = query
            .to_lowercase()
            .replace('\\', "\\\\")
            .replace('%', "\\%")
            .replace('_', "\\_");
        let pattern = format!("%{escaped}%");

        let conn = self.conn.lock().expect("mutex poisoned");
        let mut stmt = conn.prepare(
            "SELECT id, content, color, is_color_dark, created_at, modified_at, is_open, is_pinned
             FROM notes WHERE content_text LIKE ?1 ESCAPE '\\'
             ORDER BY modified_at DESC LIMIT ?2",
        )?;
        let notes = stmt
            .query_map(params![pattern, limit], NotesDb::from_row)?
            .collect::<rusqlite::Result<Vec<Note>>>()?;

        Ok(notes)
    }

    pub fn set_open(&self, note_id: &str, open: bool) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute(
            "UPDATE notes SET is_open = ?2 WHERE id = ?1",
            params![note_id, open],
        )
    }

    pub fn get_open_ids(&self) -> rusqlite::Result<Vec<String>> {
        let conn = self.conn.lock().expect("mutex poisoned");
        let mut stmt = conn.prepare("SELECT id FROM notes WHERE is_open = 1")?;
        stmt.query_map([], |row| row.get(0))?
            .collect::<rusqlite::Result<Vec<String>>>()
    }

    pub fn delete(&self, note_id: &str) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute("DELETE FROM notes WHERE id = ?1", [note_id])
    }
}
