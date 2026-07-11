import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { listen } from "@tauri-apps/api/event";
import { Note, RawNote } from "../../types";
import { invokeAsync, unrawNote } from "../../utils";
import TopBar from "./TopBar";
import SearchNotes from "./SearchNotes";
import NotesList from "./NotesList";
import SettingsPage from "./SettingsPage";

export default function NotesListWindow() {
    const [notes, setNotes] = useState<Map<string, Note>>(new Map());
    const [search, setSearch] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(false);

    // null = not searching; results come from the backend so search covers
    // every note, not just the ones loaded in this window
    const [searchResults, setSearchResults] = useState<Map<
        string,
        Note
    > | null>(null);

    useEffect(() => {
        const query = search.trim();
        if (query === "") {
            setSearchResults(null);
            return;
        }

        // Drop out-of-order responses from older keystrokes
        let stale = false;

        // Debounce so the cards don't churn on every keystroke
        const timer = setTimeout(() => {
            invokeAsync<RawNote[]>("search_notes", {
                query,
            }).then((res) => {
                if (stale) return;
                res.match(
                    (rawNotes) => {
                        const results = rawNotes.map(unrawNote);
                        setSearchResults(
                            new Map(results.map((note) => [note.id, note])),
                        );
                    },
                    (error) => alert(error),
                );
            });
        }, 200);

        return () => {
            stale = true;
            clearTimeout(timer);
        };
    }, [search, notes]);

    useEffect(() => {
        invokeAsync<RawNote[]>("get_notes").then((res) => {
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
        });
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
            <TopBar
                settingsOpen={settingsOpen}
                onSettingsClick={() => setSettingsOpen(true)}
                onBack={() => setSettingsOpen(false)}
            />

            <div className="relative flex-1 min-h-0">
                <AnimatePresence initial={false}>
                    {settingsOpen ? (
                        <motion.div
                            key="settings"
                            className="absolute inset-0 flex flex-col"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.2, 0, 0, 1],
                            }}
                        >
                            <SettingsPage />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="notes"
                            className="absolute inset-0 flex flex-col"
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.2, 0, 0, 1],
                            }}
                        >
                            <h1 className="px-4 pb-2 text-[20px] font-bold text-[#ffffff] font-['Segoe_UI',sans-serif] shrink-0">
                                Sticky Notes
                            </h1>

                            <SearchNotes value={search} onChange={setSearch} />

                            <NotesList
                                notes={searchResults ?? notes}
                                highlight={
                                    searchResults !== null ? search : undefined
                                }
                                searching={searchResults !== null}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
