export class Activity {
    _id: string;
    player_id: string;
    description: string;
    enabled: boolean;

    constructor(id: string, playerName: string, description: string) {
        this._id = id;
        this.player_id = playerName;
        this.description = description;
        this.enabled = true;
    }

    public disableActivity() {
        this.enabled = false;
    }
}