import { ResultAsync } from "neverthrow";
import { Note, RawNote } from "./types";

export function tryAsync<T>(fn: () => Promise<T>): ResultAsync<T, unknown> {
    return ResultAsync.fromThrowable(fn)();
}

export async function tryAsyncOrAlert(
    fn: () => Promise<unknown>,
): Promise<void> {
    const res = await tryAsync(fn);
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
