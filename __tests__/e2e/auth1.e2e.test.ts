// noinspection LocalVariableNamingConventionJS,MagicNumberJS

import {app, RouterPaths} from "../../src/setting";
import request from 'supertest'
import {UserCreateModel} from "../../src/types/users/input";
import {jest} from '@jest/globals';
import {EmailsManager} from "../../src/managers/email-manager";
import {UserRepository} from "../../src/repositories/repositury/user-repository";
import {ObjectId} from "mongodb";
import {UserDBType} from "../../src/types/users/output";
import {add} from "date-fns";
import {UserQueryRepository} from "../../src/repositories/query repository/user-query-repository";

describe('/auth', () => {
    // Очищаем БД
    beforeAll(async () => {
        await request(app)
            .delete('/testing/all-data')
    });
    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    /*/СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ ДАЛЬНЕЙШИХ ТЕСТОВ/*/
    //данные для создания пользователя
    const userData: UserCreateModel = {
        "login": "qqTSsPPMfL",
        "password": "string",
        "email": "linesgreen@mail.ru"
    };

    const UserInDB : UserDBType = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        accountData: {
            "userName": 'qqTSsPPMfL',
            "email": "linesgreen@mail.ru",
            "passwordHash": 'hash',
            "createdAt": 'some Date'
        },
        emailConfirmation: {
            confirmationCode: '3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2',
            expirationDate: add(new Date(),{
                hours: 100
            }),
            isConfirmed: false
        }

    };
    const UserInDB1 : UserDBType = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        accountData: {
            "userName": 'qqTSsPPMfL',
            "email": "linesgreen@mail.ru",
            "passwordHash": 'hash',
            "createdAt": 'some Date'
        },
        emailConfirmation: {
            confirmationCode: '3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2',
            expirationDate: add(new Date(),{
                hours: 100
            }),
            isConfirmed: true
        }

    };
    const UserInDB2 : UserDBType = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        accountData: {
            "userName": 'qqTSsPPMfL',
            "email": "linesgreen@mail.ru",
            "passwordHash": 'hash',
            "createdAt": 'some Date'
        },
        emailConfirmation: {
            confirmationCode: '3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2',
            expirationDate: add(new Date(),{
                hours: -100
            }),
            isConfirmed: false
        }

    };

    //Регистрируем пользователя
    it("should create user with correct data ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .send({...userData})
            .expect(204)
    });
    //Регистрируем пользователя с неправильными данными
    it("shouldn't create user with incorrect data ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .send({email: 'z@', login: '', password: '0'})
            .expect(400, {
                errorsMessages: [
                    {message: 'Invalid value', field: 'login'},
                    {message: 'incorrect email', field: 'email'},
                    {message: 'incorrect password', field: 'password'}
                ]
            })
    });
    //Регистрируем пользователя с уже занятым логином и паролем
    it("shouldn't create user with incorrect data ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .send(userData)
            .expect(400, {
                errorsMessages: [
                    {message: 'User already exists', field: 'email'},
                    {message: 'User already exists', field: 'login'}
                ]
            })
    });
    //Посылаем запрос за повторной отправкой письма
    it("should send new conf code ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-email-resending`)
            .send({email: userData.email})
            .expect(204)
    });
    //Посылаем запрос за повторной отправкой письма c несущст email
    it("should send new conf code ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-email-resending`)
            .send({email: "lox@mail.ru"})
            .expect(400, {
                "errorsMessages": [
                    {
                        "message": "User with this email is does not exist",
                        "field": "email"
                    }
                ]
            })
    });
    /*


     */
    //Посылаем запрос за на подтверждение почты с неправильным кодом
    it("should send new conf code ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "6ecd8c99-4036-403d-bf84-cf8400f67843"})
            .expect(400, {
                errorsMessages: [ { message: 'Code not Valid (no user)', field: 'code' } ]
            })
    });

    //Посылаем запрос за на подтверждение почты
    it("should send new conf code ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserInDB));
        jest.spyOn(UserQueryRepository, 'getUserByRegCode').mockImplementation(() => Promise.resolve(UserInDB));
        jest.spyOn(UserRepository, 'activatedUser').mockImplementation(() => Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2"})
            .expect(204);
    });
    //Посылаем запрос за на подтверждение уже подвержденной почты
    it("should send new conf code ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserInDB1));
        jest.spyOn(UserQueryRepository, 'getUserByRegCode').mockImplementation(() => Promise.resolve(UserInDB1));
        jest.spyOn(UserRepository, 'activatedUser').mockImplementation(() => Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2"})
            .expect(400,{
                errorsMessages: [ { message: 'Code already Activated', field: 'code' } ]
            });
    });
    //Посылаем запрос за на подтверждение почты с протухшей датой
    it("should send new conf code ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserInDB2));
        jest.spyOn(UserQueryRepository, 'getUserByRegCode').mockImplementation(() => Promise.resolve(UserInDB2));
        jest.spyOn(UserRepository, 'activatedUser').mockImplementation(() => Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2"})
            .expect(400,{
                "errorsMessages": [
                    {
                        "message": "Code not Valid date problem",
                        "field": "code"
                    }
                ]
            });
    });
    //Посылаем запрос за переотправку письма подтверждения с уже подтв аккаунта
    it("should send new conf code ", async () => {
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserInDB1));
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-email-resending`)
            .send({email: "lox@mail.ru"})
            .expect(400, {
                "errorsMessages": [
                    {
                        "message": "User is already verified",
                        "field": "email"
                    }
                ]
            })
    });
});