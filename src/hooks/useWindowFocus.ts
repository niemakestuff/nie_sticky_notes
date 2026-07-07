import { useEffect, useState } from "react";

export default function useWindowFocus() {
    // Seed synchronously from the webview's own focus state so the first render is already correct
    const [focused, setFocused] = useState(() => document.hasFocus());

    useEffect(() => {
        const onFocus = () => setFocused(true);
        const onBlur = () => setFocused(false);

        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);

        // Re-sync in case focus changed between initial render and mount.
        setFocused(document.hasFocus());

        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, []);

    return focused;
}
