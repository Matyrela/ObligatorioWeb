export class Room {
    name: string;
    id: number;
    maxPlayers: number;
    players: Array<string>;
    constructor(id: number, name: string, players: Array<string>) {
        this.id = id;
        this.name = name;
        this.players = players;
        this.maxPlayers = 10;
    }


}
