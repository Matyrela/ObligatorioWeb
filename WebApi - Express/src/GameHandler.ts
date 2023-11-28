import { Express } from 'express';
import { GameManager } from './Classes/GameManager';
import { Player } from './Classes/Player';
import { UserHandler } from './UserHandler';
import { Auth } from './Auth';


export class GameHandler {
    constructor(app: Express, ws: any) {

        app.post('/api/game/create', Auth.checkToken, async (req, res) => {
            let roomGame = req.body.roomName as string;
            let token: string = req.body.token as string;
            let user = await UserHandler.getInstance().getUserByToken(token);
            if (user != null) {
                let player: null | Player = new Player(user[0].userName as string);
                let gameCreated;
                if (roomGame != null && roomGame != "" && roomGame != undefined && roomGame.length > 0 && player != null) {
                    gameCreated = GameManager.getInstance().createGame(roomGame, player, ws);
                }

                if (gameCreated?.id != null) {
                    res.send({ 'gameCreated': true, 'code': gameCreated.id });
                    return;
                }
            }

            res.send({ 'gameCreated': false, 'code': 'INVALID' });
        });

        app.post('/api/game/join', Auth.checkToken, async (req, res) => {
            let code = req.body.code as string;
            let token = req.body.token as string;
            if (code != null && code != "" && code != undefined && code.toString().length > 0) {
                let gameManager = GameManager.getInstance();
                let game = gameManager.getGame(code);
                if (game != undefined && game != null) {
                    let user = await UserHandler.getInstance().getUserByToken(token);
                    let player: null | Player = new Player(user[0].userName as string);
                    if (player != null) {
                        if (!game.started || game.players.includes(player.name)) {
                            gameManager.joinGame(player, game);
                            res.send({ 'joined': true });
                            return;
                        }
                    }
                }
            }
            res.send({ 'joined': false });
        });

        app.post('/api/game/get', Auth.checkToken, async (req, res) => {
            let token = req.body.token as string;
            let user = await UserHandler.getInstance().getUserByToken(token);
            let player: null | Player = new Player(user[0].userName as string);
            if (player != null) {
                let gameManager = GameManager.getInstance();
                let code: string | undefined = gameManager.checkPlayerInGame(player);
                if (code != undefined && code != null) {
                    let game = gameManager.getGame(code);
                    res.send({
                        'code': code,
                        'roomName': game?.name,
                        'players': game?.players,
                        'status': game?.status,
                        'admin': game?.adminPlayer
                    });
                    return;
                }
            }
            res.send({ 'code': 'INVALID' });
        });

        app.post('/api/game/reconnect', Auth.checkToken, async (req, res) => {
            let token = req.body.token as string;
            let player = await UserHandler.getInstance().getPlayer(token);
            let gm = GameManager.getInstance();
            if (player != null && player != undefined) {
                let code = gm.checkPlayerInGame(player);
                if (code != 'INVALID') {
                    let game = gm.getGame(code as string);
                    if (game != undefined && game != null) {
                        res.send({ 'code': code, 'started': game.started });
                        return;
                    }
                }
            }
            res.send({ 'code': 'INVALID' });
        });

        app.post('/api/game/quit', Auth.checkToken, async (req, res) => {
            let token = req.body.token as string;
            let player = await UserHandler.getInstance().getPlayer(token);
            let gm = GameManager.getInstance();
            if (player != null && player != undefined) {
                let code = gm.checkPlayerInGame(player);
                if (code != 'INVALID') {
                    gm.removePlayer(player, code as string);
                    res.send({ "removed": true });
                    return;
                }
            }

            res.send({ "removed": false });
        });

    }
}