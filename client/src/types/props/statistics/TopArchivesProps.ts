import { TopArchiveDTO } from "../../../models/storage/TopArchiveDTO";

export interface TopArchivesProps {
    data: TopArchiveDTO[];
    type: "events" | "alerts";
    onTypeChange: (type: "events" | "alerts") => void;
};