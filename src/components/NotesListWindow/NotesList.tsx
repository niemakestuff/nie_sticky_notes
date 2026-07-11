import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Note } from "../../types";
import OverlayScrollbar from "../OverlayScrollbar";
import NoteCard from "./NoteCard";

export default function NotesList({ notes }: { notes: Map<string, Note> }) {
    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

    if (notes.size === 0) {
        return (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 pb-16">
                <svg
                    className="w-[120px] h-[120px] mb-4"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="34"
                        y="34"
                        width="52"
                        height="52"
                        rx="2"
                        transform="rotate(-8 60 60)"
                        fill="#4a4a4a"
                    />
                    <g transform="translate(25 -5) rotate(-40 60 60)">
                        <rect
                            x="46"
                            y="55"
                            width="42"
                            height="10"
                            fill="#3aa7a0"
                        />
                        <rect
                            x="86"
                            y="55"
                            width="6"
                            height="10"
                            fill="#2d8a84"
                        />
                        <path d="M46 55 L46 65 L34 60 Z" fill="#e8dfc8" />
                        <path d="M38 57.5 L38 62.5 L31 60 Z" fill="#333333" />
                    </g>
                    <path
                        d="M60 22 l3 5 5 3 -5 3 -3 5 -3 -5 -5 -3 5 -3 z"
                        fill="#8a8a8a"
                    />
                    <path
                        d="M40 88 l2 3.5 3.5 2 -3.5 2 -2 3.5 -2 -3.5 -3.5 -2 3.5 -2 z"
                        fill="#8a8a8a"
                    />
                </svg>
                <p className="text-center text-[13px] text-white/60 leading-snug">
                    Tap the new note button above
                    <br />
                    to create a note
                </p>
            </div>
        );
    }

    return (
        <div className="relative flex-1 min-h-0">
            <div
                ref={setScrollEl}
                className={[
                    "h-full overflow-y-auto no-native-scrollbar",
                    "flex flex-col gap-[8px] px-3 pb-3",
                ].join(" ")}
            >
                <AnimatePresence initial={false}>
                    {[...notes.values()].map((note) => (
                        <NoteCard key={note.id} note={note} />
                    ))}
                </AnimatePresence>
            </div>

            <OverlayScrollbar scrollEl={scrollEl} />
        </div>
    );
}
