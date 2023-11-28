import * as jwt from 'jsonwebtoken';

export class Auth {
    private static readonly secret: string = "pelela";

    public static checkToken(req: any, res:any, next: any): any{
        let token;
        try{
            token = req.headers.authorization.split(' ')[1];
        }catch(e){
            res.send({error: 'Token invalido'});
            return false;
        }

        try{
            jwt.verify(token, Auth.secret);
            next();
            return true;
        }catch(e){
            res.send({error: 'Token invalido'});
        }
    }

}