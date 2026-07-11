import { openUrl } from "@tauri-apps/plugin-opener";
import { tryAsyncOrAlert } from "../utils";

// WinUI-style text link that opens in the system browser
export default function ExternalLink({
    href,
    children,
    className,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            onClick={() => tryAsyncOrAlert(() => openUrl(href))}
            className={[
                "text-[#35a0ca] hover:text-[#a6a6a6] underline w-fit cursor-pointer",
                className ?? "",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
