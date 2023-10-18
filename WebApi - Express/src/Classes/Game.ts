import { Player } from "./Player";

export class Game {
    id: number;
    name: string;
    players: Player[];
    status : Status;

    constructor(name : string, id : number) {
        this.id = id;
        this.name = name;
        this.players = new Array<Player>();
        this.status = Status.WAITING;
    }
}
export enum Status {
    WAITING,
    PLAYING,
    FINISHED
}   