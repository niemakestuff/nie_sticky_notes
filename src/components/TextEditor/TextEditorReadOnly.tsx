import { useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import { initUseEditor } from "./index.tsx";

export default function TextEditorReadOnly({ html }: { html: string }) {
    const editor = initUseEditor(html, { editable: false });

    useEffect(() => {
        if (!editor || editor.getHTML() === html) return;
        editor.commands.setContent(html, { emitUpdate: false });
    }, [editor, html]);

    return <EditorContent editor={editor} />;
}
