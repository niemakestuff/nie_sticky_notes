import { useState } from "react";
import ExternalLink from "../ExternalLink";
import ScrollArea from "../ScrollArea";
import Toggle from "../Toggle";

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 px-5">
            <h2 className="text-[18px]">{title}</h2>
            {children}
        </div>
    );
}

function ToggleSetting({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[14px]">{label}</span>

            <div className="flex items-center gap-3">
                <Toggle checked={checked} onChange={onChange} />
                <span className="text-[14px]">{checked ? "On" : "Off"}</span>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [spellcheck, setSpellcheck] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(true);

    return (
        <ScrollArea
            className="flex-1 min-h-0 font-['Segoe_UI',sans-serif] text-[#cccccc]"
            contentClassName="flex flex-col gap-[18px] pt-2 pb-8"
        >
            <Section title="General">
                <div className="flex flex-col gap-5">
                    <ToggleSetting
                        label="Spellcheck"
                        checked={spellcheck}
                        onChange={setSpellcheck}
                    />
                    <ToggleSetting
                        label="Confirm before deleting"
                        checked={confirmDelete}
                        onChange={setConfirmDelete}
                    />
                </div>
            </Section>

            <div className="border-t border-[#898989] mx-5" />

            <Section title="About">
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
            </Section>
        </ScrollArea>
    );
}
