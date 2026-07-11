import ExternalLink from "../ExternalLink";
import ScrollArea from "../ScrollArea";

export default function SettingsPage() {
    return (
        <ScrollArea
            className="flex-1 min-h-0 font-['Segoe_UI',sans-serif] text-[#cccccc]"
            contentClassName="flex flex-col gap-[18px] pt-2 pb-8"
        >
            <div className="flex flex-col gap-3 px-5">
                <h2 className="text-[18px]">About</h2>

                <div className="flex flex-col gap-[3px] text-[14px]">
                    <p className="text-[#9d9d9d] text-[13px]">
                        Nie Sticky Notes 0.1.0
                        <br />
                        Made by Nie (niemakestuff)
                    </p>

                    <ExternalLink
                        href="https://github.com/niemakestuff/nie_sticky_notes"
                        className="mt-1"
                    >
                        GitHub
                    </ExternalLink>
                </div>
            </div>
        </ScrollArea>
    );
}
