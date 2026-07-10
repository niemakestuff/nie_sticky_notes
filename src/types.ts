export type Note = {
    id: string;
    content: string;
    color: string;
    isColorDark: boolean;
    createdAt: Date;
    modifiedAt: Date;
    isOpen: boolean;
};

export type RawNote = Omit<Note, "createdAt" | "modifiedAt"> & {
    createdAt: string;
    modifiedAt: string;
};
