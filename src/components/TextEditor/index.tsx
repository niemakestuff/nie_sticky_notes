import { useCallback, useState, type CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Underline from "@tiptap/extension-underline";
import { useEditor, EditorContent, UseEditorOptions } from "@tiptap/react";
import { ResultAsync } from "neverthrow";
import { Note } from "../../types";
import { HEX_TEXT_LIGHT } from "../../constants";
import useWindowFocus from "../../hooks/useWindowFocus";
import OverlayScrollbar from "../OverlayScrollbar";
import BottomButtons from "./BottomButtons";

export function initUseEditor(
    content: string,
    options?: UseEditorOptions,

    // Card previews (TextEditorReadOnly) rely on this exact default. Do NOT change.
    // I repeat, DO NOT change!!
    typography: string = "font-['Segoe_UI',sans-serif] text-[14px] leading-[19px]",
) {
    return useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Image.configure({ allowBase64: true }),
            Highlight,
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({
                placeholder: "Take a note…",
                showOnlyWhenEditable: false,
            }),
        ],
        content: content,
        editorProps: {
            // Fix for pasting issue
            transformPastedHTML: (html) => html.replace(/\r?\n/g, ""),

            attributes: {
                class: [
                    typography,
                    "outline-none caret-current min-h-full",
                    "[&_p]:m-0",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:m-0",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:m-0",
                    "[&_li+li]:mt-px",
                    "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0",
                    "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:gap-2",
                    "[&_ul[data-type=taskList]_li>label]:shrink-0",
                    "[&_ul[data-type=taskList]_li>div]:flex-1 [&_ul[data-type=taskList]_li>div]:min-w-0",
                    "[&_li[data-checked=true]>div]:line-through [&_li[data-checked=true]>div]:text-[#8a8a8a]",
                    "[&_a]:text-[#8ab4f8] [&_a]:underline",
                    "[&_mark]:bg-[#fff176] [&_mark]:text-[#202020]",
                    "[&_code]:font-mono [&_code]:text-[12.5px] [&_code]:bg-white/10 [&_code]:px-[3px]",
                    "[&_pre]:bg-white/10 [&_pre]:p-2 [&_pre]:my-px [&_pre]:overflow-x-auto",
                    "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
                    "[&_blockquote]:border-l-2 [&_blockquote]:border-white/25 [&_blockquote]:pl-2 [&_blockquote]:my-px",
                    "[&_hr]:border-white/20 [&_hr]:my-[6px]",
                    "[&_h1]:text-[24px] [&_h1]:leading-[30px] [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-0 [&_h1:first-child]:mt-0",
                    "[&_h2]:text-[21px] [&_h2]:leading-[27px] [&_h2]:font-bold [&_h2]:mt-[6px] [&_h2]:mb-0 [&_h2:first-child]:mt-0",
                    "[&_h3]:text-[18px] [&_h3]:leading-[24px] [&_h3]:font-bold [&_h3]:mt-1 [&_h3]:mb-0 [&_h3:first-child]:mt-0",
                    "[&_img]:max-w-full [&_img]:h-auto",
                    "[&_img.ProseMirror-selectednode]:outline-2",
                    "[&_img.ProseMirror-selectednode]:outline-solid",
                    "[&_img.ProseMirror-selectednode]:outline-[#ac94ec]",
                    "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
                    "[&_p.is-editor-empty:first-child::before]:text-[#b3b3b3]",
                    "[&_p.is-editor-empty:first-child::before]:float-left",
                    "[&_p.is-editor-empty:first-child::before]:h-0",
                    "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
                ].join(" "),
            },
        },
        ...options,
    });
}

export default function TextEditor({ note }: { note: Note }) {
    const isFocused = useWindowFocus();
    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

    // The scroll container is EditorContent's root div, grabbed via the
    // wrapper since EditorContent doesn't take a ref
    const wrapperRef = useCallback((el: HTMLDivElement | null) => {
        setScrollEl((el?.firstElementChild as HTMLElement) ?? null);
    }, []);

    const editor = initUseEditor(
        note.content,
        {
            autofocus: "end",
            onUpdate: async ({ editor }) => {
                note.content = editor.getHTML();
                note.modifiedAt = new Date();

                const res = await ResultAsync.fromThrowable(invoke)(
                    "update_note",
                    {
                        note: note,
                    },
                );

                if (res.isErr()) alert(res.error);
            },
        },
        "font-['Segoe_UI',sans-serif] text-[14px] leading-[18.4px]",
    );

    return (
        <div
            className="flex flex-col flex-1 min-h-0"
            style={{ color: HEX_TEXT_LIGHT }}
        >
            <div
                ref={wrapperRef}
                className="relative flex flex-col flex-1 min-h-0 pt-[2px] pb-[10px]"
            >
                <EditorContent
                    editor={editor}
                    style={{ "--selection-color": note.color } as CSSProperties}
                    className={[
                        "text-[#eeeeee] px-3",
                        "flex-1 min-h-0 overflow-y-auto no-native-scrollbar",
                        "selection:bg-[var(--selection-color)]",
                        "[&_*::selection]:bg-[var(--selection-color)]",
                        !isFocused &&
                            "[&_p.is-editor-empty:first-child::before]:!content-none",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                />

                <OverlayScrollbar scrollEl={scrollEl} />
            </div>

            {isFocused && editor && <BottomButtons editor={editor} />}
        </div>
    );
}
