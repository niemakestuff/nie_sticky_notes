import { type Editor } from "@tiptap/react";
import { type FluentIcon } from "@fluentui/react-icons";

export type Action = {
    name: string;
    Icon: FluentIcon;
    action: (editor: Editor) => void;
};
