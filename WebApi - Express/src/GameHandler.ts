import { Express } from 'express';
import { GameManager } from './Classes/GameManager';
import { Player } from './Classes/Player';
import { UserHandler } from './UserHandler';

export class GameHandler {
    constructor(app: Express) {
        app.post('/api/game/create', (req, res) => { 
            let roomGame = req.body.name as string;
            let player: Player = req.body.player as unknown as Player;

            let gameCreated;
            if(roomGame != null && roomGame != "" && roomGame != undefined && roomGame.length > 0) {
                gameCreated = GameManager.getInstance().createGame(roomGame, player);
            }
        
            if(gameCreated?.id != null) {
                res.send({'gameCreated' : true , 'code' : gameCreated.id});
                return;
            }    
        
            res.send({'gameCreated' : false, 'code' : 'INVALID'});    
        });
        
        app.post('/api/game/join', (req, res) => {
            let code = req.body.code as string;
            let token = req.body.token as string;

            if(code != null && code != "" && code != undefined && code.toString().length > 0) {
                let game = GameManager.getInstance().getGame(code);
                if(game != undefined && game != null) {
                    game.addPlayer(UserHandler.getInstance().getPlayer(token));
                    res.send({'joined' : 'true'});
                }
            }
        });
    }
}