import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function useWindowFocus() {
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const win = getCurrentWindow();
        let unlisten: () => void;

        win.onFocusChanged(({ payload: isFocused }) => {
            setFocused(isFocused);
        }).then((fn) => {
            unlisten = fn;
        });

        return () => unlisten?.();
    }, []);

    return focused;
}
