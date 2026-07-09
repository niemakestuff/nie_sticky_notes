use rusqlite::{Connection, params};
use std::{path::PathBuf, sync::Mutex};

/// Persists physical window positions keyed by window label
/// (e.g. "notes_list" or "note-<id>")
pub struct WinPosDb {
    conn: Mutex<Connection>,
}

impl WinPosDb {
    pub fn new(dir: PathBuf) -> rusqlite::Result<WinPosDb> {
        let conn = Connection::open(dir.join("win_pos.db"))?;

        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS window_positions (
                label TEXT PRIMARY KEY,
                x INTEGER NOT NULL,
                y INTEGER NOT NULL
            )",
            [],
        )?;

        Ok(WinPosDb {
            conn: Mutex::new(conn),
        })
    }

    pub fn save(&self, label: &str, x: i32, y: i32) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute(
            "INSERT INTO window_positions (label, x, y) VALUES (?1, ?2, ?3)
             ON CONFLICT(label) DO UPDATE SET x = excluded.x, y = excluded.y",
            params![label, x, y],
        )
    }

    pub fn get(&self, label: &str) -> rusqlite::Result<Option<(i32, i32)>> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.query_row(
            "SELECT x, y FROM window_positions WHERE label = ?1",
            [label],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map(Some)
        .or_else(|error| match error {
            rusqlite::Error::QueryReturnedNoRows => Ok(None),
            other => Err(other),
        })
    }

    pub fn delete(&self, label: &str) -> rusqlite::Result<usize> {
        let conn = self.conn.lock().expect("mutex poisoned");
        conn.execute("DELETE FROM window_positions WHERE label = ?1", [label])
    }
}
