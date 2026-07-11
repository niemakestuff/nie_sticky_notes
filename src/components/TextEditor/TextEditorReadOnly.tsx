import { useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import { initUseEditor } from "./index.tsx";

export default function TextEditorReadOnly({
    html,
    highlight,
}: {
    html: string;
    highlight?: string;
}) {
    const editor = initUseEditor(html, { editable: false });

    useEffect(() => {
        if (!editor || editor.getHTML() === html) return;
        editor.commands.setContent(html, { emitUpdate: false });
    }, [editor, html]);

    // Mark occurrences of `highlight` via the CSS Custom Highlight API
    // (styled by ::highlight(search-match) in App.css). Tiptap would strip
    // injected <mark> tags, but highlight ranges don't touch the DOM.
    useEffect(() => {
        const query = highlight?.trim().toLowerCase();
        if (!editor || !query) return;

        // One registry shared by all cards
        const registry = CSS.highlights.get("search-match") ?? new Highlight();
        CSS.highlights.set("search-match", registry);

        const ranges: Range[] = [];
        const walker = document.createTreeWalker(
            editor.view.dom,
            NodeFilter.SHOW_TEXT,
        );

        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent?.toLowerCase() ?? "";

            for (
                let index = text.indexOf(query);
                index !== -1;
                index = text.indexOf(query, index + query.length)
            ) {
                const range = new Range();
                range.setStart(node, index);
                range.setEnd(node, index + query.length);

                registry.add(range);
                ranges.push(range);
            }
        }

        return () => ranges.forEach((range) => registry.delete(range));
    }, [editor, html, highlight]);

    return <EditorContent editor={editor} />;
}
