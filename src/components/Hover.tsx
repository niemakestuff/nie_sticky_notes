export default function Hover({
    children,
    className,
    whiten = false,
}: {
    children: React.ReactNode;
    className?: string;
    whiten?: boolean;
}) {
    const overlay = whiten
        ? "bg-white/0 group-hover:bg-white/5 group-active:bg-white/10"
        : "bg-black/0 group-hover:bg-black/5 group-active:bg-black/10";

    return (
        <div className={`relative group ${className ?? ""}`}>
            <div
                className={`absolute inset-0 pointer-events-none ${overlay}`}
            />
            {children}
        </div>
    );
}
