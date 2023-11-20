import { Activity } from "./activity";

export interface Proposal {
    _id: string;
    player_id: string;
    description: string;
    activityList: Activity[];
    enabled: boolean;
}