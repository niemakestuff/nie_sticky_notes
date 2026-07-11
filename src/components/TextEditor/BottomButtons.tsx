import { type Editor, useEditorState } from "@tiptap/react";
import ToolbarButton from "./ToolbarButton";
import { TOGGLE_ACTIONS } from "./actions/toggles.ts";
import { TRIGGER_ACTIONS } from "./actions/triggers.ts";

export default function BottomButtons({ editor }: { editor: Editor }) {
    const activeMap = useEditorState({
        editor,
        selector: (snapshot) =>
            Object.fromEntries(
                TOGGLE_ACTIONS.map(({ name }) => [
                    name,
                    snapshot.editor.isActive(name),
                ]),
            ) as Record<string, boolean>,
    });

    return (
        <div className="flex flex-wrap items-center p-1 shrink-0 border-t border-white/7">
            {TOGGLE_ACTIONS.map(({ name, Icon, action }) => {
                return (
                    <ToolbarButton
                        key={name}
                        isActive={activeMap[name] ?? false}
                        onMouseDown={() => editor && action(editor)}
                    >
                        <Icon fontSize={20} />
                    </ToolbarButton>
                );
            })}

            {TRIGGER_ACTIONS.map(({ name, Icon, action }) => {
                return (
                    <ToolbarButton
                        key={name}
                        isActive={false}
                        onMouseDown={() => editor && action(editor)}
                    >
                        <Icon fontSize={20} />
                    </ToolbarButton>
                );
            })}
        </div>
    );
}
