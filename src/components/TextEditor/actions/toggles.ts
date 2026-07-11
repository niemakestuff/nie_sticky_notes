import {
    TextBoldRegular,
    TextItalicRegular,
    TextUnderlineRegular,
    TextStrikethroughRegular,
    TextBulletListLtrRegular,
    TextNumberListLtrRegular,
    TaskListLtrRegular,
    HighlightRegular,
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
        name: "highlight",
        Icon: HighlightRegular,
        action: (editor) => editor.chain().focus().toggleHighlight().run(),
    },
    {
        name: "bulletList",
        Icon: TextBulletListLtrRegular,
        action: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        name: "orderedList",
        Icon: TextNumberListLtrRegular,
        action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
        name: "taskList",
        Icon: TaskListLtrRegular,
        action: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
];
