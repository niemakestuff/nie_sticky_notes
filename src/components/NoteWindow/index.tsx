import { useState, useEffect } from "react";
import { Note, RawNote } from "../../types";
import TextEditor from "../../components/TextEditor";
import { invokeAsync, unrawNote } from "../../utils";
import TopBar from "./TopBar";

export default function NoteWindow({ noteId }: { noteId: string }) {
    const [note, setNote] = useState<Note | null>(null);

    useEffect(() => {
        invokeAsync<RawNote>("get_note", {
            noteId: noteId,
        }).then((res) => {
            res.match(
                (rawNote) => setNote(unrawNote(rawNote)),
                (error) => alert(error),
            );
        });
    }, []);

    return (
        <div className="bg-mid-dark h-full flex flex-col">
            <TopBar note={note} setNote={setNote} />

            {note !== null && <TextEditor note={note} />}
        </div>
    );
}
