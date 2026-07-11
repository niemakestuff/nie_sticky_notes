import { Note, RawNote } from "./types";

export function unrawNote(raw: RawNote): Note {
    return {
        ...raw,
        createdAt: new Date(raw.createdAt),
        modifiedAt: new Date(raw.modifiedAt),
    };
}

export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "");
}

export function isNoteEmpty(note: Note) {
    return stripHtml(note.content).trim() === "";
}

export function toFriendlyDate(date: Date): string {
    const isToday = date.toDateString() === new Date().toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
