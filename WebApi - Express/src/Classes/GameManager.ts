import { Game } from "./Game";
import { Player } from "./Player";
import { UserModel } from "../schemas/userSchema";
export class GameManager {
    
    static instance: GameManager;
    game: Map<string, Game>;
    players: Map<string, string> = new Map<string, string>();

    constructor() { 
        this.game = new Map<string, Game>();
    }

    static getInstance() {
        if (GameManager.instance == null) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    getGame(code : string) : Game | undefined {
        return this.game.get(code);
    }

    addPlayer(player: Player) : boolean {
        this.players.set(player.name, "INVALID");
        return true;
    }

    getPlayers(): Array<string> {
        let playersdb = UserModel.find().exec();
        return Array.from(this.players.keys());
    }

    public isPlayerInPlayers(name : string) : boolean{
        let check = false;
        Array.from(this.players.keys()).forEach(element => {
            if(element == name){
                check = true;
            }            
        });
        if(check){
            return true;
        }else{
            return false;
        }
    }

    joinGame(player: Player, game: Game) {
        if (!game.players.includes(player.name)) {
            game.addPlayer(player);
        }
        this.players.set(player.name, game.id);
    }
    
    createGame(roomName: string, player: Player, ws: any): Game {
        let id = Math.random().toString(32).substring(4, 8).toUpperCase();
    
        let newGame: Game = new Game(roomName, id, ws);
    
        this.game.set(id, newGame);
        this.joinGame(player, newGame);
        return newGame;
    }
    
    
    checkPlayerInGame(player: Player): string | undefined {
        let code: string | undefined = this.players.get(player.name);
        return code;
    }
    
    removePlayer(player: Player, code:string) {
        let game = this.game.get(code);
        if (game != undefined) {
            game.removePlayer(player);
            this.players.set(player.name, "INVALID")
            if (game.players.length == 0) {
                this.game.delete(game.id);
            }
        }    
    }
}
