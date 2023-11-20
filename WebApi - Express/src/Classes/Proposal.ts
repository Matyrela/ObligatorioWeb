import { Activity } from "./Activity";

export class Proposal {
    id: number;
    playerName: string;
    description: string;
    activityList: Activity[];
    enabled: boolean;

    constructor(id: number, playerName: string, description: string, activiyList: Activity[]) {
        this.id = id;
        this.playerName = playerName;
        this.description = description;
        this.activityList = activiyList;
        this.enabled = true;
    }

    disableProposal() {
        this.enabled = false;
    }
}