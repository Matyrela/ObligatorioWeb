import * as jwt from 'jsonwebtoken';

export class Auth {
    private static instance: Auth;
    
    public static getInstance(): Auth{
        return this.instance;
    }

    private static validToken: string = '';
    private static readonly secret: string = "MyMegaSuperSecretKey";

    constructor(){
        Auth.instance = this;

        Auth.validToken = jwt.sign("myToken", Auth.secret)
        console.log(Auth.validToken);
    }

    public static checkToken(req: any, res:any, next: any): any{
        console.log(req.headers);
        let token: string = req.headers['authorization'].split(' ')[1];


        try{
            jwt.verify(token, Auth.secret);
            next();
            return true;
        }catch(e){
            res.send({error: 'Token invalido'});
        }
    }

}