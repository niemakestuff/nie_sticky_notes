import { ReactNode } from "react";

export default function ToolbarButton({
    onMouseDown,
    isActive,
    children,
}: {
    onMouseDown: () => void;
    isActive: boolean;
    children: ReactNode;
}) {
    return (
        <button
            onMouseDown={(e) => {
                e.preventDefault();
                onMouseDown();
            }}
            className={`mr-1 w-6 h-6 flex items-center justify-center ${
                isActive ? "bg-white/15 hover:bg-white/20" : "hover:bg-white/10"
            }`}
        >
            {children}
        </button>
    );
}
