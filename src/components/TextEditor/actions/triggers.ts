import { type Editor } from "@tiptap/react";
import { ImageRegular } from "@fluentui/react-icons";
import { type Action } from ".";

export const TRIGGER_ACTIONS: Action[] = [
    {
        name: "insertImage",
        Icon: ImageRegular,
        action: (_editor: Editor) => {},
    },
];
