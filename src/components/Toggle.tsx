import { useRef, useState } from "react";

export default function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    const TRAVEL = 26; // px the knob moves between off and on
    const DRAG_THRESHOLD = 3; // px of movement before a press becomes a drag

    // null = not dragging; otherwise the knob's current offset
    const [dragOffset, setDragOffset] = useState<number | null>(null);
    const drag = useRef({ startX: 0, didDrag: false, active: false });

    const offsetFromEvent = (e: React.PointerEvent) => {
        const base = checked ? TRAVEL : 0;
        const dx = e.clientX - drag.current.startX;
        return Math.min(Math.max(base + dx, 0), TRAVEL);
    };

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { startX: e.clientX, didDrag: false, active: true };
    };

    const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!drag.current.active) return;

        const moved = Math.abs(e.clientX - drag.current.startX);
        if (!drag.current.didDrag && moved <= DRAG_THRESHOLD) return;

        drag.current.didDrag = true;
        setDragOffset(offsetFromEvent(e));
    };

    const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!drag.current.active) return;
        drag.current.active = false;

        if (drag.current.didDrag) {
            const next = offsetFromEvent(e) > TRAVEL / 2;
            if (next !== checked) onChange(next);
            setDragOffset(null);
        }
    };

    const onPointerCancel = () => {
        drag.current.active = false;
        drag.current.didDrag = false;
        setDragOffset(null);
    };

    const onClick = () => {
        // A completed drag already committed; don't double-toggle
        if (drag.current.didDrag) {
            drag.current.didDrag = false;
            return;
        }

        onChange(!checked);
    };

    const dragging = dragOffset !== null;

    return (
        <button
            role="switch"
            aria-checked={checked}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onClick={onClick}
            className={[
                "group relative w-11 h-5 rounded-full transition-colors duration-100 touch-none",
                checked
                    ? "bg-[#35a0ca] hover:bg-[#0073b1] active:bg-[#a6a6a6]"
                    : "border-2 border-[#d1d1d1] hover:border-white active:border-[#a6a6a6] active:bg-[#a6a6a6]",
            ].join(" ")}
        >
            <span
                // Inline translate overrides the utility classes while
                // dragging so the knob tracks the pointer 1:1
                style={
                    dragging ? { translate: `${dragOffset}px -50%` } : undefined
                }
                className={[
                    "absolute left-1 top-1/2 -translate-y-1/2 size-2.5 rounded-full",
                    dragging
                        ? "transition-[background-color] duration-200"
                        : // Fluent's standard easing curve
                          "transition-[translate,background-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                    checked
                        ? "translate-x-[26px] bg-white"
                        : "bg-[#d1d1d1] group-hover:bg-white group-active:bg-white",
                ].join(" ")}
            />
        </button>
    );
}
