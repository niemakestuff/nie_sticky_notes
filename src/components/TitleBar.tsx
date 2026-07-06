import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultAsync } from "neverthrow";

export default function TitleBar() {
    return (
        <div
            data-tauri-drag-region
            className="bg-transparent text-light text-2xl flex justify-between px-3 py-2"
        >
            <button
                onClick={async () => {
                    const id = crypto.randomUUID();
                    const res = await ResultAsync.fromThrowable(invoke)(
                        "spawn_note_window",
                        { noteId: id },
                    );

                    if (res.isErr()) alert(res.error);
                }}
            >
                +
            </button>

            <button onClick={() => getCurrentWindow().close()}>✕</button>
        </div>
    );
}
