// noinspection UnnecessaryLocalVariableJS

import jwt from 'jsonwebtoken'
import {ObjectId} from "mongodb";

require('dotenv').config();

const secretWord: string = process.env.JWT_SECRET || 'BLABLABLA';
export const secretRefreshWord: string = process.env.JWT_REFRESH_SECRET || 'bbbbb';
export const jwtService = {
    /**
     * Create JWT auth token
     * @param userId
     * @returns token - token
     */
    async createJWT(userId: ObjectId): Promise<string> {
        const token: string = jwt.sign({userId: userId}, secretWord, {expiresIn: '1h'});
        return token;
    },
    /**
     * Create JWT refresh token
     * @param userId
     * @returns token - refresh token
     */
    async createRefreshJWT(userId: ObjectId):Promise<string> {
        const token: string = jwt.sign({userId: userId}, secretRefreshWord, {expiresIn: '2h'});
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
            return null
        }
    },
};