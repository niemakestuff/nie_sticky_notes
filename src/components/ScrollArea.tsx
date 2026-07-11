import { useState } from "react";
import OverlayScrollbar from "./OverlayScrollbar";

// Scroll container with the app's overlay scrollbar: hides the native bar
// and floats OverlayScrollbar over the content. `className` sizes the
// wrapper within the parent layout; `contentClassName` lays out the
// scrolled content.
export default function ScrollArea({
    className,
    contentClassName,
    children,
}: {
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
}) {
    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

    return (
        <div className={`relative ${className ?? ""}`}>
            <div
                ref={setScrollEl}
                className={`h-full overflow-y-auto no-native-scrollbar ${contentClassName ?? ""}`}
            >
                {children}
            </div>

            <OverlayScrollbar scrollEl={scrollEl} />
        </div>
    );
}
