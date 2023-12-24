import {NextFunction, Request, Response} from "express";
import {jwtService, secretRefreshWord} from "../../application/jwt-service";
import {UserQueryRepository} from "../../repositories/query repository/user-query-repository";
import {ObjectId} from "mongodb";
import {UserOutputType} from "../../types/users/output";
import jwt from "jsonwebtoken";

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
        return res.sendStatus(404)
    }
};

export const authRefreshBearerMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
    const refreshToken: string = req.cookies.refresh_token;
    try {
        jwt.verify(refreshToken, secretRefreshWord);
        next()
    } catch (error) {
        console.log('===========================================')
        console.log(error)
        console.log('===========================================')
        res.sendStatus(401)
    }
};