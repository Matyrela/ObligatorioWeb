import { Express } from "express";
import { Player } from "./Classes/Player";
import {GameManager} from "./Classes/GameManager";
let jwt = require('jsonwebtoken');

export class UserHandler{
    userToken : Map<string, string>;
    userPassword : Map<string, string>;

    public static instance: UserHandler;

    public static getInstance(): UserHandler {
        return UserHandler.instance;
    }

    getPlayer(token: string): Player | null {
        let player: Player | null = null;
        let name : string = '';
        
        Array.from(this.userToken.keys()).forEach(element => {
            if (this.userToken.get(element) == token)
                name = element;
        });
        if (name != ''){
            GameManager.getInstance().getPlayers().forEach(element => {
                if (element.name == name)
                    player = element;
            });
        }
        return player;
    }

    constructor(app: Express){
        UserHandler.instance = this;

        this.userToken = new Map<string, string>();
        this.userPassword = new Map<string, string>();

        app.post('/api/user/login', (req, res) => {
            let userName = req.body.userName as string;
            let userPassword = req.body.userPassword as string;

            if(!(userName == null || userName == "" || userName == undefined || userName.toString().length <= 0) || !(userPassword == null || userPassword == "" || userPassword == undefined || userPassword.toString().length <= 0)) {
                if (this.userPassword.get(userName) == userPassword) {
                    let token = this.userToken.get(userName);
                    if(token == undefined){
                        token = jwt.sign({ userName }, 'pelela', { expiresIn: '24h' });
                        if(token != undefined)
                            this.userToken.set(userName, token)
                    }
                    res.send({'token' : token , 'login' : true }).status(200);
                    return;
                }
            }
            res.send({'token' : 'null', 'login' : false}).status(409);
        });

        app.post('/api/user/register', (req, res) => {
            let userName = req.body.userName as string;
            let userPassword = req.body.userPassword as string;

            if(!(userName == null || userName == "" || userName == undefined || userName.toString().length <= 0) || !(userPassword == null || userPassword == "" || userPassword == undefined || userPassword.toString().length <= 0)) {
                if(this.userPassword.get(userName) != undefined){
                    res.send({'userCreated' : false}).status(409);
                    return;
                }
                this.userPassword.set(userName ,  userPassword  );
                let player = new Player(userName);
                GameManager.getInstance().addPlayer(player);
                res.send({'userCreated' : true});
                return;   
            }
            
            res.send({'userCreated' : false}).status(201);
        });

        app.post('/api/user/validate', (req, res) => {
            let token = req.body.token as string;
            if(token != undefined){
                try {
                    let decoded = jwt.verify(token, 'pelela');
                    let userName = decoded.userName;
                    if(this.userToken.get(userName) == token){
                        res.send({'valid' : true}).status(200);
                        return;
                    }
                } catch(err) {
                    console.log(err);
                }
            }
            res.send({'valid' : false}).status(200);
        });

        app.post('/api/user/game', (req, res) => {
            let player = req.body.player as unknown as Player;
            let code = GameManager.getInstance().checkPlayerInGame(player);
            res.send({'code' : code });
        });
    }
}