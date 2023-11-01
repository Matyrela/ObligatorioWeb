import { Game } from "./Game";
import { Player } from "./Player";
export class GameManager {
    
    static instance: GameManager;
    game: Map<string, Game>;
    players: Map<Player, string> = new Map<Player, string>();

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
        this.players.set(player, "INVALID");
        return true;
    }
    getPlayers(): Array<Player> {
        return Array.from(this.players.keys());
    }

    createGame(roomName: string, player: Player): Game {
        let id = Math.random().toString(32).substring(4, 8).toUpperCase();

        let newGame: Game = new Game(roomName, id);

        this.game.set(id, newGame);
        this.joinGame(player, newGame);
        return newGame;
    }
    joinGame(player : Player, game : Game){
        if (!game.players.includes(player)) {
            game.addPlayer(player);
        }
        this.players.set(player, game.id);
    }

    checkPlayerInGame(player: Player) : string {
        let code : string = this.players.get(player) as string;
        return code;
    }
    removePlayer(player: Player) {
        let code = this.players.get(player);
        console.log(code);
        if (code != undefined) {
            let game = this.game.get(code);
            if (game != undefined) {
                console.log('Player removed from game');
                game.removePlayer(player);
                this.players.delete(player);
                if (game.players.length == 0) {
                    this.game.delete(game.id);
                }
            }
        }
        
    }
}
