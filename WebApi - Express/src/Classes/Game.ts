import { GameHandler } from "../GameHandler";
import { Player } from "./Player";

export class Game {
    
    
    id: string;
    name: string;
    players: Player[];
    status : Status;

    public ws: any;

    constructor(name : string, id : string) {
        this.id = id;
        this.name = name;
        this.players = new Array<Player>();
        this.status = Status.WAITING;

        this.ws = GameHandler.ws;

        this.ws.of(`/api/game/ws/${this.id}`).on('connection', (socket: any) => {
            console.log('a user connected to ' + this.id);

            socket.on('disconnect', () => {
                console.log('user disconnected' + this.id);
            });
        });
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