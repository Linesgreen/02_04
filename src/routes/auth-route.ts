// noinspection MagicNumberJS,IdentifierGrammar,SpellCheckingInspection

import {Router, Response, Request} from "express";
import {RequestWithBody} from "../types/common";
import {ChekPass, ConfCode} from "../types/auth/input";
import {authLoginValidation} from "../middlewares/auth/auth-middleware";
import {UserOutputType} from "../types/users/output";
import {authBearerMiddleware, authRefreshBearerMiddleware} from "../middlewares/auth/auth-bearer-niddleware";
import {AboutMe} from "../types/auth/output";

import {UserCreateModel} from "../types/users/input";
import {AuthService} from "../domain/auth.service";
import {
    authConfirmationValidation,
    authRegistrationValidation,
    authResendConfCode
} from "../middlewares/auth/authValidator";



export const authRoute = Router({});


authRoute.post('/login', authLoginValidation(), async (req: RequestWithBody<ChekPass>, res: Response<{accessToken: string}>) => {
    const {loginOrEmail, password}: ChekPass = req.body;
    const tokensPair =await AuthService.routLogin({loginOrEmail, password})
    if (tokensPair) {
        res.cookie('refreshToken', tokensPair.refreshToken, {httpOnly: true, secure: true,})
        res.status(200).send({
            accessToken: tokensPair.token
        });
        return
    }
    res.sendStatus(401)
});

authRoute.get('/me', authBearerMiddleware, async (req: Request, res: Response<AboutMe>) => {
    const userId: string = req.user!.id;
    const result: AboutMe = await AuthService.routAboutMe(userId)
    res.status(200).send(result);
});

authRoute.post('/registration', authRegistrationValidation(), async (req: RequestWithBody<UserCreateModel>, res: Response<UserOutputType>) => {
    const userData: UserCreateModel = {
        login: req.body.login,
        password: req.body.password,
        email: req.body.email
    };
    const result = await AuthService.createUser(userData);
    result ? res.sendStatus(204) : res.sendStatus(422)
});

authRoute.post('/registration-confirmation', authConfirmationValidation(), async (req: RequestWithBody<ConfCode>, res: Response<UserOutputType>) => {
    const code: string = req.body.code;
    const result: boolean = await AuthService.activaionAccount(code);
    result ? res.sendStatus(204) : res.sendStatus(400)
});

authRoute.post('/registration-email-resending', authResendConfCode(), async (req: Request, res: Response) => {
    const email: string = req.body.email;
    const resendResult = await AuthService.resendActivatedCode(email);
    if (!resendResult) {
        res.sendStatus(400)
        return
    }
    res.sendStatus(204)
});

authRoute.post('/logout', authRefreshBearerMiddleware, async (req: Request, res: Response) => {
    const refrToken: string = req.cookies.refreshToken
    const result: boolean = await AuthService.refreshTokenToBanList(refrToken);
    if(result) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }

});
authRoute.post('/refresh-token', authRefreshBearerMiddleware, async (req: Request, res: Response) => {
    const userId = req.user!.id
    const refrToken: string = req.cookies.refreshToken
    const tokensPair: {token: string, refreshToken: string} = await AuthService.routeRefreshToken(userId, refrToken)
    res.cookie('refreshToken', tokensPair.refreshToken, {httpOnly: true, secure: true,})
    res.status(200).send({
        accessToken: tokensPair.token
    });
})







