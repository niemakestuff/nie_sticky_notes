import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Note } from "../../types";
import OverlayScrollbar from "../OverlayScrollbar";
import NoteCard from "./NoteCard";

function EmptyState({ searching }: { searching: boolean }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pb-16">
            {searching ? (
                <svg
                    className="w-[120px] h-[120px] mb-4"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="38"
                        y="28"
                        width="50"
                        height="50"
                        rx="2"
                        transform="rotate(15 63 53)"
                        fill="#3f3f3f"
                    />
                    <circle
                        cx="58"
                        cy="64"
                        r="15"
                        stroke="#3aa7a0"
                        strokeWidth="6"
                    />
                    <line
                        x1="46"
                        y1="76"
                        x2="34"
                        y2="88"
                        stroke="#3aa7a0"
                        strokeWidth="7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M97 24 l3 5 5 3 -5 3 -3 5 -3 -5 -5 -3 5 -3 z"
                        fill="#8a8a8a"
                    />
                    <path
                        d="M24 48 l2 3.5 3.5 2 -3.5 2 -2 3.5 -2 -3.5 -3.5 -2 3.5 -2 z"
                        fill="#8a8a8a"
                    />
                    <path
                        d="M88 66 l1.5 2.5 2.5 1.5 -2.5 1.5 -1.5 2.5 -1.5 -2.5 -2.5 -1.5 2.5 -1.5 z"
                        fill="#8a8a8a"
                    />
                </svg>
            ) : (
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
            )}

            <p className="text-center text-[14px] text-[#5e5e5e] leading-snug">
                {searching ? (
                    "No notes found"
                ) : (
                    <>
                        Tap the new note button above
                        <br />
                        to create a note
                    </>
                )}
            </p>
        </div>
    );
}

export default function NotesList({
    notes,
    highlight,
    searching = false,
}: {
    notes: Map<string, Note>;
    highlight?: string;
    searching?: boolean;
}) {
    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

    return (
        <div className="relative flex-1 min-h-0">
            {notes.size === 0 && <EmptyState searching={searching} />}

            <div
                ref={setScrollEl}
                className={[
                    "h-full overflow-y-auto no-native-scrollbar",
                    "flex flex-col gap-[8px] px-3 pb-3",
                ].join(" ")}
            >
                <AnimatePresence initial={false}>
                    {[...notes.values()].map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            highlight={highlight}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <OverlayScrollbar scrollEl={scrollEl} />
        </div>
    );
}
