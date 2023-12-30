// noinspection RegExpRedundantEscape

import {body} from "express-validator";
import {UserRepository} from "../../repositories/repositury/user-repository";
import {UserDBType} from "../../types/users/output";
import {inputModelValidation} from "../inputModel/input-model-Validation";
import {UserQueryRepository} from "../../repositories/query repository/user-query-repository";

export const uniqueEmailValidator = body('email').custom(async (body) => {
    const userByEmail: UserDBType | null = await UserRepository.getByLoginOrEmail(body);
    if (userByEmail) {
        throw new Error('User already exists');
    }
    return true;
});
export const uniqueLoginValidator = body('login').custom(async (body) => {
    const userByLogin: UserDBType | null = await UserRepository.getByLoginOrEmail(body);
    if (userByLogin) {
        throw new Error('User already exists');
    }
    return true;
});

export const loginValidation = body('login')
    .isString()
    .trim()
    .isLength({min: 3, max: 10})
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('incorrect login');

export const emailValidation = body('email')
    .isString()
    .trim()
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('incorrect email');
export const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 6, max:20})
    .withMessage('incorrect password');

export const confirmCodeValidation = body('code')
    .isUUID(4).withMessage('Incorrect code')
    .custom(async code => {
        const userWithCode = await UserQueryRepository.getUserByRegCode(code);
        if (!userWithCode) {
            throw new Error('Code not Valid (no user)');
        }
        if (!(userWithCode.emailConfirmation.expirationDate > new Date())) {
            throw new Error('Code not Valid date problem');
        }
        if (userWithCode.emailConfirmation.isConfirmed) {
            throw new Error('Code already Activated');
        }
        return true
    });
export const emailResendConfirm = body('email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('Email is not Valid')
    .custom(async email => {
        const userWithEmail: UserDBType | null = await UserRepository.getByLoginOrEmail(email);
        if (!userWithEmail) {
            throw new Error('User with this email is does not exist');
        }
        if (userWithEmail.emailConfirmation.isConfirmed) {
            throw new Error('User is already verified');
        }
    });


export const authRegistrationValidation = () => [uniqueEmailValidator, uniqueLoginValidator, loginValidation, emailValidation, passwordValidation, inputModelValidation];
export const authConfirmationValidation = () => [confirmCodeValidation, inputModelValidation];
export const authResendConfCode = () => [emailResendConfirm, inputModelValidation];

