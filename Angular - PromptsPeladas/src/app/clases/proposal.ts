import { Activity } from "./activity";

export interface Proposal {
    id: number;
    playerName: string;
    description: string;
    activityList: Activity[];
    enabled: boolean;
}