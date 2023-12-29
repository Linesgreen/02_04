// noinspection UnnecessaryLocalVariableJS,SpellCheckingInspection,ES6ShorthandObjectProperty

import {UserCreateModel} from "../types/users/input";
import bcrypt from "bcrypt";
import {UserDBType, UserOutputType} from "../types/users/output";
import {v4 as uuidv4} from "uuid"
import {add} from "date-fns";
import {ObjectId, WithId} from "mongodb";
import {UserRepository} from "../repositories/repositury/user-repository";

import {EmailsManager} from "../managers/email-manager";
import {expiredTokenDBType} from "../types/auth/token";
import {ChekPass} from "../types/auth/input";
import {UserService} from "./user.service";
import {jwtService} from "../application/jwt-service";
import {UserQueryRepository} from "../repositories/query repository/user-query-repository";
import {AboutMe} from "../types/auth/output";

export const AuthService = {
    /**
     * Auth flow
     * @param loginData - {loginOremail, password}
     * @returns {token, refreshToken}
     * @return null - if user doesn't exist
     */
    async routLogin(loginData : ChekPass):Promise<{token: string, refreshToken: string} | null>{
        const user: WithId<UserDBType> | null = await UserService.checkCredentials(loginData.loginOrEmail, loginData.password);
        if (user) {
            return AuthService.generateTokenPair(user._id)
        }
        return null
        },
    /**
     * About me flow
     * @param userId - string type
     * @returns AboutMe - {email, login, userId}
     */
    async routAboutMe(userId : string): Promise<AboutMe> {
        const user: UserOutputType | null = await UserQueryRepository.getUserById(userId);
        const {email, login, id} = user!;
        return {
            email: email,
            login: login,
            userId: id
        }
    },
    /**
     * generate new pair tokens
     * add old token to ban list
     * @param userId - string type
     * @param refrToken - old refresh token
     * @returns {token, refreshToken}
     */
    async routeRefreshToken(userId : string, refrToken: string): Promise<{token: string, refreshToken: string} >{
        await AuthService.refreshTokenToBanList(refrToken);
        return AuthService.generateTokenPair(new ObjectId(userId))
    },
    async createUser(userData: UserCreateModel): Promise<boolean> {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const newUser: UserDBType = {
            _id: new ObjectId(),
            accountData: {
                userName: userData.login,
                email: userData.email,
                passwordHash: passwordHash,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    //minutes: 1
                }),
                isConfirmed: false
            }
        };
        await UserRepository.addUser(newUser);
        try {
            await EmailsManager.sendEmailConfirmation(userData.email, newUser.emailConfirmation.confirmationCode);
        } catch (e) {
            console.log(e);
            return false
        }
        return true
    },
    async activaionAccount(code: string) {
        const result = await UserRepository.activatedUser(code);
        return result
    },

    async resendActivatedCode(email: string): Promise<boolean> {
        const newConfCode: string = uuidv4();
        const expirationDate: Date = add(new Date(), {hours: 1,});
        const userUpdateResult: boolean = await UserRepository.updateRegCode(email, newConfCode, expirationDate);
        if (!userUpdateResult) {
            return false;
        }
        try {
            await EmailsManager.sendEmailConfirmation(email, newConfCode);
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    },
    async refreshTokenToBanList(token: string): Promise<boolean> {
        const expiredToken: expiredTokenDBType = {
            _id: new ObjectId(),
            token: token,
            dateAdded: new Date(),
            reason: 'Logout'
        }
        const result = await UserRepository.addTokenInBlackList(expiredToken)
        return result
    },
    /**
     * @param userId - ObjectId type
     * @returns AboutMe - {email, login, userId}
     */
    async  generateTokenPair(userId: ObjectId): Promise<{token: string, refreshToken: string}> {
        const token = await jwtService.createJWT(userId);
        const refreshToken = await jwtService.createRefreshJWT(userId);
        return {token, refreshToken}
    }
};