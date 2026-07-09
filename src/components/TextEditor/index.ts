import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEditor, UseEditorOptions } from "@tiptap/react";

export function initUseEditor(content: string, options?: UseEditorOptions) {
    return useEditor({
        extensions: [StarterKit, Underline],
        content: content,
        editorProps: {
            attributes: {
                class: [
                    "min-h-full",
                    "pl-3 pr-1 pt-0 pb-2",
                    "font-['Segoe_UI',sans-serif] text-[14px] leading-[17.5px]",
                    "outline-none caret-current",
                    "[&_p]:m-0",
                    "[&_p+p]:mt-0.5",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:m-0",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:m-0",
                    "[&_li+li]:mt-px",
                ].join(" "),
            },
        },
        ...options,
    });
}
