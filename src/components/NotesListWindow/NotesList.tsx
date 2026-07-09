import { Note } from "../../types";
import NoteCard from "./NoteCard";

export default function NotesList({ notes }: { notes: Map<string, Note> }) {
    return (
        <div
            className={[
                "flex-1 min-h-0 overflow-y-auto",
                "flex flex-col gap-[8px] px-3 pb-3",
                "[&::-webkit-scrollbar]:w-2.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-white/25",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:border-4",
                "[&::-webkit-scrollbar-thumb]:border-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
                "[&::-webkit-scrollbar-thumb:hover]:bg-white/50",
            ].join(" ")}
        >
            {[...notes.values()].map((note) => (
                <NoteCard key={note.id} note={note} />
            ))}
        </div>
    );
}
