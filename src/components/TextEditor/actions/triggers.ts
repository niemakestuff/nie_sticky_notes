import { type Editor } from "@tiptap/react";
import { ImageRegular } from "@fluentui/react-icons";
import { type Action } from ".";

export const TRIGGER_ACTIONS: Action[] = [
    {
        name: "insertImage",
        Icon: ImageRegular,
        action: (editor: Editor) => {
            const input = document.createElement("input");

            input.type = "file";
            input.accept = "image/*";

            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

                const src = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(file);
                });

                // focus() restores the selection from before the file dialog stole
                // it, so the image lands at the cursor
                editor.chain().focus().setImage({ src }).run();
            };

            input.click();
        },
    },
];
