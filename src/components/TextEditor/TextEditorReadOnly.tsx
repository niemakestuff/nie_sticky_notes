import { EditorContent } from "@tiptap/react";
import { initUseEditor } from ".";

export default function TextEditorReadOnly({ html }: { html: string }) {
    const editor = initUseEditor(html, { editable: false });
    return <EditorContent editor={editor} />;
}
