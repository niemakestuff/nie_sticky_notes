import { Dispatch, SetStateAction } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultAsync } from "neverthrow";
import {
    DeleteRegular,
    ListRegular,
    CheckmarkFilled,
} from "@fluentui/react-icons";
import { HEX_TEXT_LIGHT, HEX_TEXT_DARK } from "../../constants";
import { Note } from "../../types";
import Hover from "../../components/Hover";
import DeleteNoteConfirmation from "../DeleteNoteConfirmation";

const COLORS = [
    {
        hex: "#e6b904",
        isDark: false,
    },
    {
        hex: "#65ba5a",
        isDark: false,
    },
    {
        hex: "#ea86c2",
        isDark: false,
    },
    {
        hex: "#ac94ec",
        isDark: false,
    },
    {
        hex: "#59c0e7",
        isDark: false,
    },
    {
        hex: "#989898",
        isDark: false,
    },
    {
        hex: "#444444",
        isDark: true,
    },
];

export default function DropdownPanel({
    note,
    setNote,
}: {
    note: Note | null;
    setNote: Dispatch<SetStateAction<Note | null>>;
}) {
    return (
        <div
            className="w-full select-none bg-[#3b3b3b] shadow-lg shadow-black/10 font-['Segoe_UI',sans-serif]"
            style={{ color: HEX_TEXT_LIGHT }}
        >
            <div className="flex">
                {COLORS.map((color) => (
                    <Hover key={color.hex} className="flex flex-1">
                        <button
                            className="flex h-13 flex-1 items-center justify-center"
                            style={{ backgroundColor: color.hex }}
                            onClick={async () => {
                                if (note === null) return;

                                note.color = color.hex;
                                note.isColorDark = color.isDark;
                                note.modifiedAt = new Date();

                                setNote({ ...note });

                                const res = await ResultAsync.fromThrowable(
                                    invoke,
                                )("update_note", {
                                    note: note,
                                });

                                if (res.isErr()) alert(res.error);
                            }}
                        >
                            {note?.color === color.hex && (
                                <CheckmarkFilled
                                    fontSize={15}
                                    style={{
                                        color: color.isDark
                                            ? HEX_TEXT_LIGHT
                                            : HEX_TEXT_DARK,
                                    }}
                                />
                            )}
                        </button>
                    </Hover>
                ))}
            </div>

            <Hover whiten>
                <button
                    className="text-[#eeeeee] flex w-full items-center gap-4 p-3.5 text-left text-[15px]"
                    onClick={async () => {
                        let res =
                            await ResultAsync.fromThrowable(invoke)(
                                "open_notes_list",
                            );

                        if (res.isErr()) alert(res.error);
                    }}
                >
                    <ListRegular fontSize={20} />
                    Notes list
                </button>
            </Hover>

            {note !== null && (
                <Hover whiten>
                    <DeleteNoteConfirmation
                        note={note}
                        confirmCallback={() => {
                            getCurrentWindow().close();
                        }}
                    >
                        <div className="text-[#eeeeee] flex w-full items-center gap-4 p-3.5 text-left text-[15px]">
                            <DeleteRegular fontSize={20} />
                            Delete note
                        </div>
                    </DeleteNoteConfirmation>
                </Hover>
            )}
        </div>
    );
}
