import { Player } from "./Player";

export class Game {
    
    
    id: string;
    name: string;
    players: Player[];
    status : Status;

    constructor(name : string, id : string) {
        this.id = id;
        this.name = name;
        this.players = new Array<Player>();
        this.status = Status.WAITING;
    }
    public addPlayer(user: Player) {
        this.players.push(user);
    }
    public removePlayer(player: Player) {
        this.players = this.players.filter((value) => {
            return value != player;
        });
    }
}
export enum Status {
    WAITING,
    PLAYING,
    FINISHED
}   