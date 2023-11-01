import { GameHandler } from "../GameHandler";
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

        GameHandler.gamesNamespace.on('connection', (socket: any) => {
            socket.emit('playerList', this.players);
            socket.join(this.id);
            socket.to(this.id).emit('playerList', this.players);

            socket.on('chatMessage', (data: { [key: string]: any }) => {
                socket.emit('chatMessage', data);
                socket.to(this.id).emit('chatMessage', data);
            });
        });

    }
    public addPlayer(user: Player) {
        this.players.push(user);
    }
}

export enum Status {
    WAITING,
    PLAYING,
    FINISHED
}   