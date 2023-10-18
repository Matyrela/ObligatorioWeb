import { Game } from "./Game";
export class GameManager {
    static instance: GameManager;
    game : Game | null;
    id : number;
    constructor() { 
        this.game = null;
        this.id = 0;
    }

    static getInstance() {
        if (GameManager.instance == null) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    getGame() : string {
        return JSON.stringify(this.game);
    }
    createGame(name : string) {
        this.game = new Game(name, this.id);
        this.id++;
    }
}
