// noinspection UnnecessaryLocalVariableJS

import jwt from 'jsonwebtoken'
import {ObjectId} from "mongodb";

require('dotenv').config();

export const secretWord: string = process.env.JWT_SECRET || 'BLABLABLA';

export const jwtService = {
    /**
     * Create JWT auth token
     * @param userId
     * @returns token - token
     */
    async createJWT(userId: ObjectId): Promise<string> {
        const token: string = jwt.sign({userId: userId}, secretWord, {expiresIn: '10s'});
        return token;
    },
    /**
     * Create JWT refresh token
     * @param userId
     * @returns token - refresh token
     */
    async createRefreshJWT(userId: ObjectId):Promise<string> {
        const token: string = jwt.sign({userId: userId}, secretWord, {expiresIn: '20s'});
        return token;
    },
    /**
     * Get User ID From token
     * @param token
     * @returns userId - refresh token
     * @returns null - token not valid
     */
    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, secretWord);
            return result.userId
        } catch (error) {
            console.log(error)
            return null
        }
    },
};