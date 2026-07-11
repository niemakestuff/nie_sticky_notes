import { useEffect, useRef, useState } from "react";

// Custom scrollbar that floats over the content instead of occupying layout
// space (Chromium removed overflow:overlay, so the native bar can't do this).
// Render as the last child of a `relative` wrapper that also contains the
// scroll element; hide the native bar on the scroll element with
// `no-native-scrollbar` (App.css).
//
// Replicates the original Sticky Notes (WinUI) scrollbar, measured at 125%
// scaling: a 1.6px indicator line at rest; pointer in the gutter expands it
// to a 16px thumb on a solid track. No arrow buttons (deliberate deviation).
// Thumb state colors sampled from the original.

const SIZE = 16; // gutter and expanded-thumb width
const MIN_THUMB_HEIGHT = 32;

export default function OverlayScrollbar({
    scrollEl,
}: {
    scrollEl: HTMLElement | null;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [thumb, setThumb] = useState({ top: 0, height: 0, visible: false });
    const [expanded, setExpanded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const draggingRef = useRef(false);
    const dragStart = useRef({ y: 0, scrollTop: 0 });

    useEffect(() => {
        if (!scrollEl) return;

        const track = trackRef.current;
        const wrapper = track?.parentElement;

        const update = () => {
            const trackHeight = track?.clientHeight ?? 0;
            const { scrollTop, scrollHeight, clientHeight } = scrollEl;

            if (scrollHeight <= clientHeight || trackHeight <= 0) {
                setThumb((t) => (t.visible ? { ...t, visible: false } : t));
                return;
            }

            // Floor for grabbability, but never taller than the track
            const height = Math.min(
                Math.max(
                    (clientHeight / scrollHeight) * trackHeight,
                    MIN_THUMB_HEIGHT,
                ),
                trackHeight,
            );
            const top =
                (scrollTop / (scrollHeight - clientHeight)) *
                (trackHeight - height);

            setThumb({ top, height, visible: true });
        };

        // The expand zone is watched on the wrapper (not the track) so that
        // hovering the thumb itself can't collapse the bar.
        const onMouseMove = (e: MouseEvent) => {
            if (draggingRef.current || !wrapper) return;
            const rect = wrapper.getBoundingClientRect();
            setExpanded(rect.right - e.clientX <= SIZE);
        };
        const onMouseLeave = () => {
            if (!draggingRef.current) setExpanded(false);
        };

        update();
        scrollEl.addEventListener("scroll", update);
        wrapper?.addEventListener("mousemove", onMouseMove);
        wrapper?.addEventListener("mouseleave", onMouseLeave);

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(scrollEl);
        if (scrollEl.firstElementChild) {
            resizeObserver.observe(scrollEl.firstElementChild);
        }

        return () => {
            scrollEl.removeEventListener("scroll", update);
            wrapper?.removeEventListener("mousemove", onMouseMove);
            wrapper?.removeEventListener("mouseleave", onMouseLeave);
            resizeObserver.disconnect();
        };
    }, [scrollEl]);

    const onThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!scrollEl) return;

        // Don't blur the editor or start a text selection
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        dragStart.current = { y: e.clientY, scrollTop: scrollEl.scrollTop };
        draggingRef.current = true;
        setDragging(true);
    };

    const onThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current || !scrollEl) return;

        // Button released but pointerup was missed (e.g. lost capture):
        // don't keep dragging on hover
        if (e.buttons === 0) {
            draggingRef.current = false;
            setDragging(false);
            return;
        }

        const trackHeight = trackRef.current?.clientHeight ?? 0;
        const range = trackHeight - thumb.height;
        if (range <= 0) return;

        const scrollable = scrollEl.scrollHeight - scrollEl.clientHeight;
        scrollEl.scrollTop =
            dragStart.current.scrollTop +
            ((e.clientY - dragStart.current.y) / range) * scrollable;
    };

    const onThumbPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        draggingRef.current = false;
        setDragging(false);

        const wrapper = trackRef.current?.parentElement;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const inZone =
            rect.right - e.clientX <= SIZE &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
        if (!inZone) setExpanded(false);
    };

    // Clicking the track above/below the thumb scrolls by a page
    const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!scrollEl || !trackRef.current) return;
        e.preventDefault();

        const thumbTop =
            trackRef.current.getBoundingClientRect().top + thumb.top;
        const direction = e.clientY < thumbTop ? -1 : 1;
        scrollEl.scrollBy({ top: direction * scrollEl.clientHeight });
    };

    const interactive = expanded && thumb.visible;

    return (
        <div
            ref={trackRef}
            onWheel={(e) => scrollEl?.scrollBy({ top: e.deltaY })}
            className={[
                "absolute inset-y-0 right-0 w-4 select-none",
                interactive ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
        >
            {/* Track fill */}
            <div
                onPointerDown={onTrackPointerDown}
                className={[
                    "absolute inset-0 bg-[#1e1e1e]",
                    "transition-opacity duration-100",
                    interactive ? "opacity-100" : "opacity-0",
                ].join(" ")}
            />

            {thumb.visible && (
                <div
                    onPointerDown={onThumbPointerDown}
                    onPointerMove={onThumbPointerMove}
                    onPointerUp={onThumbPointerUp}
                    style={{ top: thumb.top, height: thumb.height }}
                    className={[
                        "absolute pointer-events-auto",
                        "transition-[width,right,background-color] duration-100 ease-out",
                        expanded || dragging
                            ? "w-4 right-0"
                            : "w-[1.6px] right-[3.2px]",
                        dragging
                            ? "bg-[#a6a6a6]"
                            : expanded
                              ? "bg-[#4d4d4d] hover:bg-[#797979]"
                              : "bg-[#858585]",
                    ].join(" ")}
                />
            )}
        </div>
    );
}
