import { invoke } from "@tauri-apps/api/core";
import { ResultAsync } from "neverthrow";
import { Note, RawNote } from "./types";

/// invoke() wrapped so failures come back as a Result instead of throwing
export const invokeAsync = ResultAsync.fromThrowable(invoke);

/// For commands where the only error handling is telling the user
export async function invokeOrAlert(
    cmd: string,
    args?: Record<string, unknown>,
): Promise<void> {
    const res = await invokeAsync(cmd, args);
    if (res.isErr()) alert(res.error);
}

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
    // Images carry no text but still make a note worth keeping
    if (/<img\b/i.test(note.content)) return false;

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
