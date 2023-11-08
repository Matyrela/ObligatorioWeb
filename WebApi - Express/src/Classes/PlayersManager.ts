import { Player } from "./Player";

export class PlayerManager {

    static instance: PlayerManager;
    players: Array<Player>;

    constructor() { 
        this.players = new Array<Player>();
    }

    static getInstance() {
        if (PlayerManager.instance == null) {
            PlayerManager.instance = new PlayerManager();
        }
        return PlayerManager.instance;
    }

    getPlayers(): Array<Player> {
        return this.players;
    }

    addPlayer(player: Player) : boolean {
        this.players.push(player);
        return true;
    }

}