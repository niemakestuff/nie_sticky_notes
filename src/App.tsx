import "./App.css";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { tryAsyncOrAlert } from "./utils";
import NotesListWindow from "./components/NotesListWindow";
import NoteWindow from "./components/NoteWindow";

export default function App() {
    const noteId: string | null = new URLSearchParams(
        window.location.search,
    ).get("note_id");

    useEffect(() => {
        // Windows are created hidden; if show() fails the window would
        // stay invisible with no feedback, so surface the error
        tryAsyncOrAlert(() => getCurrentWindow().show());
    }, []);

    return (
        <main className="h-screen text-[#ffffff]">
            {noteId === null ? (
                <NotesListWindow />
            ) : (
                <NoteWindow noteId={noteId} />
            )}
        </main>
    );
}
