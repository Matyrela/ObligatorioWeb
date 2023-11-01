export class Activity {
    id: number;
    playerName: string;
    description: string;
    enabled: boolean;

    constructor(id: number, playerName: string, description: string) {
        this.id = id;
        this.playerName = playerName;
        this.description = description;
        this.enabled = true;
    }

    public disableActivity() {
        this.enabled = false;
    }
}