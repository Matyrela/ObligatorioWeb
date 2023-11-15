import { Express } from "express";
import { Player } from "./Classes/Player";
import { GameManager } from "./Classes/GameManager";
import { UserModel } from "./schemas/userSchema";

const crypto = require('crypto');
let sha256 = crypto.createHash('sha256');

let jwt = require('jsonwebtoken');

export class UserHandler {
    userToken: Map<string, string>;
    userPassword: Map<string, string>;

    public static instance: UserHandler;

    public static getInstance(): UserHandler {
        return UserHandler.instance;
    }

    private async getUserByToken(token: string) {
        return await UserModel.find({ userToken: token }).exec();
    }

    private async getUserByUserName(name: string) {
        return await UserModel.find({ userName: name }).exec();
    }

    private async getUserToken(name: string) {
        let res = await UserModel.find({ userName: name }).exec();
        return res[0].userToken;
    }

    private verificarTokenExpirado(token: string) {
        try {
            const decoded = jwt.verify(token, 'pelela');

            const expiracion = new Date(decoded.exp * 1000);
            const ahora = new Date();

            return expiracion > ahora;
        } catch (error) {
            return false;
        }
    }

    getPlayer(token: string): Player | null {
        let player: Player | null = null;
        let name: string = '';

        Array.from(this.userToken.keys()).forEach(element => {
            if (this.userToken.get(element) == token)
                name = element;
        });

        console.log("name=" + name);
        console.log("tokens=" + JSON.stringify(this.userToken.keys()));

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

        app.post('/api/user/login', async (req, res) => {
            let userName = req.body.userName as string;
            let userPassword = req.body.userPassword as string;
            sha256 = crypto.createHash('sha256');
            const hashedPass = sha256.update(userPassword).copy().digest('hex');

            if (!(userName == null || userName == "" || userName == undefined || userName.toString().length <= 0) || !(userPassword == null || userPassword == "" || userPassword == undefined || userPassword.toString().length <= 0)) {
                const dbUser = await UserModel.findOne({ userName: userName }).exec();
                console.log(dbUser);
                console.log(hashedPass);
                if (dbUser != null) {
                    if (hashedPass === dbUser.userPassword && dbUser.userName == userName) {
                        console.log("LOGIN OK");
                        let token = await this.getUserToken(userName);
                        if (token == undefined || !this.verificarTokenExpirado(token)) {
                            token = jwt.sign({ userName }, 'pelela', { expiresIn: '24h' });
                            if (token != undefined)
                                this.userToken.set(userName, token)
                        }
                        await UserModel.findOneAndUpdate(
                            { userName: userName },
                            { $set: { userToken: token } },
                            { new: true }
                        )
                        res.send({ 'token': token, 'login': true }).status(200);
                        return;
                    }
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
            sha256 = crypto.createHash('sha256');
            let userPassword = sha256.update(req.body.userPassword).copy().digest('hex');

            if (!(userName == null || userName == "" || userName == undefined || userName.toString().length <= 0) || !(userPassword == null || userPassword == "" || userPassword == undefined || userPassword.toString().length <= 0)) {
                if (this.userPassword.get(userName) != undefined) {
                    res.send({ 'userCreated': false, 'quedo': true }).status(409);
                    return;
                }
                this.userPassword.set(userName, userPassword);
                let creado = false;

                try {
                    const newUser = new UserModel({ userName, userPassword });
                    await newUser.save();
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

        app.post('/api/user/expired', (req, res) => {
            const token = req.body.token as string;
            if (token) {
                try {
                    const decoded = jwt.verify(token, 'pelela');
                    const expirationDate = new Date(decoded.exp * 1000);
                    const now = new Date();
                    const expired = now > expirationDate;
                    res.send({ expired }).status(200);
                    return;
                } catch (err) {
                    console.log(err);
                }
            }
            res.send({ expired: true }).status(200);
        });

        app.post('/api/user/validate', async (req, res) => {
            let token = req.body.token as string;
            if (token != undefined) {
                try {
                    let decoded = jwt.verify(token, 'pelela');
                    let userDB = await this.getUserByUserName(token);
                    if (userDB != null) {
                        const expirationDate = new Date(decoded.exp * 1000);
                        const now = new Date();
                        const expired = now > expirationDate;
                        if (expired) {
                            res.send({ 'valid': false }).status(200);
                            return;
                        }
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