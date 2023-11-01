import { Player } from "./Player";

export class Game {
    
    
    id: string;
    name: string;
    players: Player[];
    status : Status;
    adminPlayer!: Player;

    constructor(name : string, id : string, ws: any) {
        this.id = id;
        this.name = name;
        this.players = new Array<Player>();
        this.status = Status.WAITING;

        let url = "/games/ws/"+this.id;

        ws.of(url).on('connection', (socket: any) => {
            socket.emit('playerList', this.players);
            ws.of(url).emit('playerList', this.players);
          
            socket.on('chatMessage', (data: { [key: string]: any }) => {              
                ws.of(url).emit('chatMessage', data);
            });
          });

    }
    public addPlayer(user: Player) {
        if(this.players.length == 0)
            this.adminPlayer = user;
        this.players.push(user);
    }
    public removePlayer(player: Player) {
        //CAMBIAR ADMIN SI EL ADMIN SE SALE Y NOTIFICARLO POR WS (WebSocket)
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