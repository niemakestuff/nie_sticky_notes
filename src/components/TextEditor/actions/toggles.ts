import {
    TextBoldRegular,
    TextItalicRegular,
    TextUnderlineRegular,
    TextStrikethroughRegular,
    TextBulletListLtrRegular,
} from "@fluentui/react-icons";
import { type Action } from ".";

export const TOGGLE_ACTIONS: Action[] = [
    {
        name: "bold",
        Icon: TextBoldRegular,
        action: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
        name: "italic",
        Icon: TextItalicRegular,
        action: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    {
        name: "underline",
        Icon: TextUnderlineRegular,
        action: (editor) => editor.chain().focus().toggleUnderline().run(),
    },
    {
        name: "strike",
        Icon: TextStrikethroughRegular,
        action: (editor) => editor.chain().focus().toggleStrike().run(),
    },
    {
        name: "bulletList",
        Icon: TextBulletListLtrRegular,
        action: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
];
