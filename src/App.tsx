import "./App.css";
import NotesList from "./windows/NotesList";
import Note from "./windows/Note";

export default function App() {
    const noteId: string | null = new URLSearchParams(
        window.location.search,
    ).get("note_id");

    return (
        <main className="h-screen text-bright">
            {noteId === null ? <NotesList /> : <Note noteId={noteId} />}
        </main>
    );
}
