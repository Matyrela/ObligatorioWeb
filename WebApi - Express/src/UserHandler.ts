import { Express } from "express";
import { Player } from "./Classes/Player";
import { GameManager } from "./Classes/GameManager";
import { UserModel } from "./schemas/userSchema";
import main from './db';

main().catch(err => console.log(err));

let jwt = require('jsonwebtoken');

export class UserHandler {
    userToken: Map<string, string>;
    userPassword: Map<string, string>;

    public static instance: UserHandler;

    public static getInstance(): UserHandler {
        return UserHandler.instance;
    }

    getPlayer(token: string): Player | null {
        let player: Player | null = null;
        let name: string = '';

        Array.from(this.userToken.keys()).forEach(element => {
            if (this.userToken.get(element) == token)
                name = element;
        });
        if (name != '') {
            GameManager.getInstance().getPlayers().forEach(element => {
                if (element.name == name)
                    player = element;
            });
        }
        return player;
    }

    constructor(app: Express) {
        UserHandler.instance = this;

        this.userToken = new Map<string, string>();
        this.userPassword = new Map<string, string>();

        app.post('/api/user/login', (req, res) => {
            let userName = req.body.userName as string;
            let userPassword = req.body.userPassword as string;

            if (!(userName == null || userName == "" || userName == undefined || userName.toString().length <= 0) || !(userPassword == null || userPassword == "" || userPassword == undefined || userPassword.toString().length <= 0)) {
                if (this.userPassword.get(userName) == userPassword) {
                    let token = this.userToken.get(userName);
                    if (token == undefined) {
                        token = jwt.sign({ userName }, 'pelela', { expiresIn: '24h' });
                        if (token != undefined)
                            this.userToken.set(userName, token)
                    }
                    res.send({ 'token': token, 'login': true }).status(200);
                    return;
                }
            }
            res.send({ 'token': 'null', 'login': false }).status(409);
        });

        app.post('/api/user/pruebaget', async (req, res) => {
            console.log("asdasd");
            res.json(await UserModel.find());
        });

        app.post('/api/user/register', async (req, res) => {
            let userName = req.body.userName as string;
            let userPassword = req.body.userPassword as string;

            if (!(userName == null || userName == "" || userName == undefined || userName.toString().length <= 0) || !(userPassword == null || userPassword == "" || userPassword == undefined || userPassword.toString().length <= 0)) {
                if (this.userPassword.get(userName) != undefined) {
                    res.send({ 'userCreated': false }).status(409);
                    return;
                }
                this.userPassword.set(userName, userPassword);
                let creado = false;

                try {
                    const newUser = new UserModel({ userName, userPassword });
                    console.log(newUser);
                    await newUser.save();
                    console.log("terminetti");
                    creado = true;
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
                    return;
                }

                let player = new Player(userName);
                GameManager.getInstance().addPlayer(player);
                if (creado) {
                    res.send({ 'userCreated': true });
                } else {
                    res.send({ 'userCreated': false }).status(500);
                }
                return;
            }

            res.send({ 'userCreated': false }).status(201);
        });

        app.post('/api/user/validate', (req, res) => {
            let token = req.body.token as string;
            if (token != undefined) {
                try {
                    let decoded = jwt.verify(token, 'pelela');
                    let userName = decoded.userName;
                    if (this.userToken.get(userName) == token) {
                        res.send({ 'valid': true }).status(200);
                        return;
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            res.send({ 'valid': false }).status(200);
        });

        app.post('/api/user/game', (req, res) => {
            let player = req.body.player as unknown as Player;
            let code = GameManager.getInstance().checkPlayerInGame(player);
            res.send({ 'code': code });
        });
    }
}