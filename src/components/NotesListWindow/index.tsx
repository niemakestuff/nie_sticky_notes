import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ResultAsync } from "neverthrow";
import { Note, RawNote } from "../../types";
import { unrawNote } from "../../utils";
import TopBar from "./TopBar";
import SearchNotes from "./SearchNotes";
import NotesList from "./NotesList";

export default function NotesListWindow() {
    const [notes, setNotes] = useState<Map<string, Note>>(new Map());

    useEffect(() => {
        ResultAsync.fromThrowable(invoke)<RawNote[]>("get_notes").then(
            (res) => {
                res.match(
                    (rawNotes) => {
                        const notesArr = rawNotes.map((rawNote) =>
                            unrawNote(rawNote),
                        );
                        const notesMap = new Map(
                            notesArr.map((note) => [note.id, note]),
                        );

                        setNotes(notesMap);
                    },
                    (error) => alert(error),
                );
            },
        );
    }, []);

    useEffect(() => {
        const unlistens = [
            listen<RawNote>("new_note", (event) => {
                setNotes((prev) => {
                    const newNote = unrawNote(event.payload);
                    return new Map([[newNote.id, newNote], ...prev]);
                });
            }),

            listen<RawNote>("updated_note", (event) => {
                setNotes((prev) => {
                    const updatedNote = unrawNote(event.payload);
                    const existing = prev.get(updatedNote.id);
                    const next = new Map(prev);

                    // modifiedAt unchanged (e.g. color change) -> keep position
                    if (
                        existing &&
                        existing.modifiedAt.getTime() ===
                            updatedNote.modifiedAt.getTime()
                    ) {
                        next.set(updatedNote.id, updatedNote);
                        return next;
                    }

                    // modifiedAt changed (content edit) -> move to top
                    next.delete(updatedNote.id);
                    return new Map([[updatedNote.id, updatedNote], ...next]);
                });
            }),

            listen<string>("deleted_note", (event) => {
                setNotes((prev) => {
                    const next = new Map(prev);
                    next.delete(event.payload);
                    return next;
                });
            }),
        ];

        return () => {
            unlistens.forEach((u) => u.then((fn) => fn()));
        };
    }, []);

    return (
        <div className="bg-[#202020] h-full flex flex-col">
            <TopBar />

            <h1 className="px-4 pb-2 text-[20px] font-bold text-bright font-['Segoe_UI',sans-serif] shrink-0">
                Sticky Notes
            </h1>

            <SearchNotes />
            <NotesList notes={notes} />
        </div>
    );
}
