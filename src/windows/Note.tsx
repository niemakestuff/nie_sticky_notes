import TitleBar from "../components/TitleBar";

export default function Note({ noteId }: { noteId: string }) {
    return (
        <div className="bg-mid-dark h-full">
            <TitleBar />
            <div>{noteId}</div>
        </div>
    );
}
