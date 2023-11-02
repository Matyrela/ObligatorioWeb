import { Player } from "./Player";

export class Game {
    
    
    id: string;
    name: string;
    players: Player[];
    status : Status;
    adminPlayer!: Player;

    ws: any;
    url: string = "";

    constructor(name : string, id : string, ws: any) {
        this.id = id;
        this.name = name;
        this.players = new Array<Player>();
        this.status = Status.WAITING;
        this.ws = ws;

        this.url = "/games/ws/"+this.id;

        ws.of(this.url).on('connection', (socket: any) => {
            ws.of(this.url).emit('playerList', this.players);          
            socket.on('chatMessage', (data: { [key: string]: any }) => {              
                ws.of(this.url).emit('chatMessage', data);
            });

            socket.on('clientChangeStatus', (data: { [key: string]: any }) => {              
                ws.of(this.url).emit('clientChangeStatus', data);
            });
          });

    }

    public addPlayer(player: Player) {
        if(this.players.length == 0)
            this.adminPlayer = player;
        this.players.push(player);
    }

    public removePlayer(player: Player) {
        let adminWasChanged = false;
    
        this.players = this.players.filter((value) => {
            return value !== player;
        });
    
        if (player === this.adminPlayer) {
            if (this.players.length > 0) {
                adminWasChanged = true;
                this.adminPlayer = this.players[Math.floor(Math.random() * this.players.length)];
            }
        }

        setTimeout(() => {
            this.ws.of(this.url).emit('playerList', this.players);
            if(adminWasChanged)
                this.ws.of(this.url).emit('adminChange', this.adminPlayer)
        }, 1000);
    }
    

    public sendChatMessage(message: string){
        setTimeout(() => {
            this.ws.of(this.url).emit('chatMessage', {'server' : true, 'message' : message});
        }, 1000);
    }
}

export enum Status {
    WAITING,
    PLAYING,
    FINISHED
}   