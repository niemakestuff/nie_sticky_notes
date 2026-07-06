export default function HoverDarken({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`relative group ${className ?? ""}`}>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 pointer-events-none" />
            {children}
        </div>
    );
}
