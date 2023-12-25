import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {UserQueryRepository} from "../../repositories/query repository/user-query-repository";
import {ObjectId} from "mongodb";
import {UserOutputType} from "../../types/users/output";
import {UserRepository} from "../../repositories/repositury/user-repository";

export const authBearerMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
    const auth: string | undefined = req.headers['authorization'];
    if (!auth) {
        return res.sendStatus(401);

    }
    const [bearer, token] = auth.split(" ");
    if (bearer !== 'Bearer') {
        console.log('Bearer не Bearer');
        return res.sendStatus(401);
    }
    const userId = await jwtService.getUserIdByToken(token);
    if (!ObjectId.isValid(userId)) {
        return res.sendStatus(401);
    }
    const user: UserOutputType | null = await UserQueryRepository.getUserById(userId);
    if(user) {
        req.user = user;
        return next()
    } else {
        return res.sendStatus(401)
    }
};

export const authRefreshBearerMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
    console.log('-----------------------------------------------')
    console.log('Refresh token')
    console.log(req.cookies.refreshToken)
    console.log('-----------------------------------------------')
    if (!req.cookies.refreshToken){

        res.sendStatus(401)
        return;
    }
    const refreshToken: string = req.cookies.refreshToken;
    const chekInDb = await UserRepository.shearchTokenInBlackList(refreshToken)
    if (chekInDb) {
        res.sendStatus(401)
        return;
    }
    const userId = await jwtService.getUserIdByToken(refreshToken);
    if (!userId) {
        console.log('bebra')
        res.sendStatus(401);
        return;
    }
    const user: UserOutputType | null = await UserQueryRepository.getUserById(userId);
    if(user) {
        req.user = user;
        return next()
    } else {
        return res.sendStatus(401)
    }
};