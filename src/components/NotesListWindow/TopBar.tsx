import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultAsync } from "neverthrow";
import {
    AddRegular,
    SettingsRegular,
    DismissRegular,
} from "@fluentui/react-icons";
import Hover from "../../components/Hover";

export default function TopBar() {
    return (
        <div
            data-tauri-drag-region
            className="flex items-center justify-between h-10 shrink-0 text-[#717171]"
        >
            <Hover whiten>
                <button
                    className="w-10 h-10 flex items-center justify-center"
                    onClick={async () => {
                        const res =
                            await ResultAsync.fromThrowable(invoke)(
                                "create_note",
                            );

                        if (res.isErr()) alert(res.error);
                    }}
                >
                    <AddRegular fontSize={20} />
                </button>
            </Hover>

            <div className="flex">
                <Hover whiten>
                    <button className="w-10 h-10 flex items-center justify-center">
                        <SettingsRegular fontSize={20} />
                    </button>
                </Hover>

                <Hover whiten>
                    <button
                        className="w-10 h-10 flex items-center justify-center"
                        onClick={() => getCurrentWindow().close()}
                    >
                        <DismissRegular fontSize={20} />
                    </button>
                </Hover>
            </div>
        </div>
    );
}
