import { type Editor } from "@tiptap/react";
import { ImageRegular } from "@fluentui/react-icons";
import { tryAsync } from "../../../utils";
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

                const res = await tryAsync(
                    () =>
                        new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                                resolve(reader.result as string);
                            reader.onerror = () => reject(reader.error);
                            reader.readAsDataURL(file);
                        }),
                );

                res.match(
                    // focus() restores the selection from before the file
                    // dialog stole it, so the image lands at the cursor
                    (src) => editor.chain().focus().setImage({ src }).run(),
                    (error) => alert(error ?? "Couldn't read the image file"),
                );
            };

            input.click();
        },
    },
];
