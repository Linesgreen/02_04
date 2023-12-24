// noinspection UnnecessaryLocalVariableJS,SpellCheckingInspection

import {UserCreateModel} from "../types/users/input";
import bcrypt from "bcrypt";
import {UserDBType} from "../types/users/output";
import {v4 as uuidv4} from "uuid"
import {add} from "date-fns";
import {ObjectId} from "mongodb";
import {UserRepository} from "../repositories/repositury/user-repository";

import {EmailsManager} from "../managers/email-manager";

export const authService = {
    async createUser(userData: UserCreateModel): Promise<boolean> {
        console.log('Сработала сучка:(');
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
        const result = await UserRepository.addTokenInBlackList(token)
        return result
    }
};