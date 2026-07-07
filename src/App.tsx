import "./App.css";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import NotesListWindow from "./windows/NotesList";
import NoteWindow from "./windows/Note";

export default function App() {
    const noteId: string | null = new URLSearchParams(
        window.location.search,
    ).get("note_id");

    useEffect(() => {
        getCurrentWindow().show();
    }, []);

    return (
        <main className="h-screen text-bright">
            {noteId === null ? (
                <NotesListWindow />
            ) : (
                <NoteWindow noteId={noteId} />
            )}
        </main>
    );
}
