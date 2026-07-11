import { getCurrentWindow } from "@tauri-apps/api/window";
import {
    AddRegular,
    ArrowLeftRegular,
    SettingsRegular,
    DismissRegular,
} from "@fluentui/react-icons";
import { invoke } from "@tauri-apps/api/core";
import { tryAsync, tryAsyncOrAlert } from "../../utils";
import Hover from "../../components/Hover";

export default function TopBar({
    settingsOpen,
    onSettingsClick,
    onBack,
}: {
    settingsOpen: boolean;
    onSettingsClick: () => void;
    onBack: () => void;
}) {
    return (
        <div
            data-tauri-drag-region
            className="flex items-center justify-between h-10 shrink-0 text-[#717171]"
        >
            {settingsOpen ? (
                <div className="flex items-center">
                    <Hover whiten>
                        <button
                            className="w-10 h-10 flex items-center justify-center"
                            onClick={onBack}
                        >
                            <ArrowLeftRegular fontSize={20} />
                        </button>
                    </Hover>

                    <span
                        data-tauri-drag-region
                        className="pl-2 text-[16px] text-[#9d9d9d] font-['Segoe_UI',sans-serif]"
                    >
                        Settings
                    </span>
                </div>
            ) : (
                <Hover whiten>
                    <button
                        className="w-10 h-10 flex items-center justify-center"
                        onClick={() =>
                            tryAsyncOrAlert(() => invoke("create_note"))
                        }
                    >
                        <AddRegular fontSize={20} />
                    </button>
                </Hover>
            )}

            <div className="flex">
                {!settingsOpen && (
                    <Hover whiten>
                        <button
                            className="w-10 h-10 flex items-center justify-center"
                            onClick={onSettingsClick}
                        >
                            <SettingsRegular fontSize={20} />
                        </button>
                    </Hover>
                )}

                <Hover whiten>
                    <button
                        className="w-10 h-10 flex items-center justify-center"
                        onClick={async () => {
                            const res = await tryAsync(() =>
                                invoke("close_notes_list"),
                            );

                            // Keep the window if the flag couldn't be saved,
                            // or the list would respawn on the next launch
                            if (res.isErr()) {
                                alert(res.error);
                                return;
                            }

                            tryAsyncOrAlert(() => getCurrentWindow().close());
                        }}
                    >
                        <DismissRegular fontSize={20} />
                    </button>
                </Hover>
            </div>
        </div>
    );
}
