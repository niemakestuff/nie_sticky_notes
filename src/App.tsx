import "./App.css";
import NotesListWindow from "./windows/NotesList";
import NoteWindow from "./windows/Note";
import { Note } from "./types";

export default function App() {
    const noteId: string | null = new URLSearchParams(
        window.location.search,
    ).get("note_id");
    const note: Note | null =
        noteId === null
            ? null
            : {
                  id: noteId,
                  content: "lorem impsum",
                  color: "#c78eff",
                  isColorDark: false,
                  createdAt: new Date(),
                  modifiedAt: new Date(),
              };

    return (
        <main className="h-screen text-bright">
            {note === null ? <NotesListWindow /> : <NoteWindow note={note} />}
        </main>
    );
}
