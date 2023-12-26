// noinspection DuplicatedCode,LocalVariableNamingConventionJS,MagicNumberJS

import {app, RouterPaths} from "../../src/setting";
import request from 'supertest'
import {usersTestManager} from "../utils/usersTestManager";
import {UserOutputType} from "../../src/types/users/output";
import {UserCreateData, UserDB} from "../mock/mockUsers";
import {jest} from "@jest/globals";
import {EmailsManager} from "../../src/managers/email-manager";
import {UserRepository} from "../../src/repositories/repositury/user-repository";
import {UserQueryRepository} from "../../src/repositories/query repository/user-query-repository";

/// тесты 1 часть
describe('/auth', () => {
    // Очищаем БД
    beforeAll(async () => {
        await request(app)
            .delete('/testing/all-data')
    });

    /*/СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ ДАЛЬНЕЙШИХ ТЕСТОВ/*/
    //данные для создания пользователя

    const basicAuth = {
        login: 'admin',
        password: 'qwerty'
    };


    //Данные созданного пользователя
    let user1: UserOutputType;


    //Cоздаем пользователя
    it("should create user with correct input data ", async () => {
        const createResponse = await usersTestManager.createUser(UserCreateData.correctData, basicAuth, 201);
        user1 = createResponse.body;
    });
    //Пытаемся залогинится с неправильным паролем
    it("should dont loggin with incorrect pass ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send({
                loginOrEmail: UserCreateData.correctData.login,
                password: 'xernya'
            })
            .expect(401)
    });
    //Пытаемся залогинится с неправильным логином
    it("should dont login with incorrect login ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send({
                loginOrEmail: 'UserCreateData.correctData.login',
                password: UserCreateData.correctData.login
            })
            .expect(401)
    });
    //Пытаемся залогинится с некоректными данными
    it("should dont login with incorrect login ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send({
                loginOrEmail: 1,
                password: 2
            })
            .expect(400, {
                "errorsMessages": [
                    {
                        "message": "Incorrect loginOrEmail",
                        "field": "loginOrEmail"
                    }
                ]
            })
    });
    //Логинимся по логину
    it("should  login with correct login ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send({
                loginOrEmail: UserCreateData.correctData.login,
                password: UserCreateData.correctData.password
            })
            .expect(200)
            .then(response => {
                expect(response.body.accessToken).toMatch(
                    /^([a-zA-Z0-9\-_=]+)\.([a-zA-Z0-9\-_=]+)\.([a-zA-Z0-9\-_=]+)$/
                )
            })
    });
    let token: string;
    //Логинимся по мылу
    it("should  login with correct email ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send({
                loginOrEmail: UserCreateData.correctData.email,
                password: UserCreateData.correctData.password
            })
            .expect(200)
            .then(response => {
                token = response.body.accessToken;
                expect(response.body.accessToken).toMatch(
                    /^([a-zA-Z0-9\-_=]+)\.([a-zA-Z0-9\-_=]+)\.([a-zA-Z0-9\-_=]+)$/
                )
                const cookie = response.headers['set-cookie'].join()
                expect(cookie).toContain('HttpOnly');
                expect(cookie).toContain('Secure');
                expect(cookie).toMatch(/^refreshToken=[\w|_].+[\w|_]+.\w+/)
            })
    });
    //Получаем информацию о пользователе
    it("should  login with correct email ", async () => {
        await request(app)
            .get(`${RouterPaths.auth}/me`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200, {
                "email": UserCreateData.correctData.email,
                "login": UserCreateData.correctData.login,
                "userId": user1.id
            })

    });
    //Пытаемся получить информацию с некоректным токеном
    it("should  login with correct email ", async () => {
        await request(app)
            .get(`${RouterPaths.auth}/me`)
            .set('Authorization', `Bearer tGzv3JOkF0XG5Qx2TlKWIA`)
            .expect(401)

    })
});
////////// new tests with mock/////////////////


/// тесты вторая часть
describe('/auth', () => {
    // Очищаем БД
    beforeAll(async () => {
        await request(app)
            .delete('/testing/all-data')
    });
    beforeEach(() => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
    })
    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    //Регистрируем пользователя
    it("should create user with correct data ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .send(UserCreateData.correctData)
            .expect(204)
    });
    //Регистрируем пользователя с неправильными данными
    it("shouldn't create user with incorrect data ", async () => {
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
        await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .send(UserCreateData.correctData)
            .expect(400, {
                errorsMessages: [
                    {message: 'User already exists', field: 'email'},
                    {message: 'User already exists', field: 'login'}
                ]
            })
    });
    //Посылаем запрос за повторной отправкой письма
    it("should send new conf code ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/registration-email-resending`)
            .send({email: UserCreateData.correctData.email})
            .expect(204)
    });
    //Посылаем запрос за повторной отправкой письма c несущст email
    it("should send new conf code ", async () => {
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

    //Посылаем запрос за на подтверждение почты с неправильным кодом
    it("should send new conf code ", async () => {
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "6ecd8c99-4036-403d-bf84-cf8400f67843"})
            .expect(400, {
                errorsMessages: [ { message: 'Code not Valid (no user)', field: 'code' } ]
            })
    });

    //Посылаем запрос за на подтверждение почты
    it("should send new conf code ", async () => {
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserDB.user1));
        jest.spyOn(UserQueryRepository, 'getUserByRegCode').mockImplementation(() => Promise.resolve(UserDB.user1));
        jest.spyOn(UserRepository, 'activatedUser').mockImplementation(() => Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2"})
            .expect(204);
    });
    //Посылаем запрос за на подтверждение уже подвержденной почты
    it("should send new conf code ", async () => {
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserDB.user2));
        jest.spyOn(UserQueryRepository, 'getUserByRegCode').mockImplementation(() => Promise.resolve(UserDB.user2));
        jest.spyOn(UserRepository, 'activatedUser').mockImplementation(() => Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send({code: "3f0d0c74-b00a-4a9e-9c69-7f3278cdb2a2"})
            .expect(400,{
                errorsMessages: [ { message: 'Code already Activated', field: 'code' } ]
            });
    });
    //Посылаем запрос за на подтверждение почты с протухшей датой
    it("should dont resend email ", async () => {
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserDB.user3));
        jest.spyOn(UserQueryRepository, 'getUserByRegCode').mockImplementation(() => Promise.resolve(UserDB.user3));
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
    //Посылаем запрос на переотправку письма подтверждения с уже подтв аккаунта
    it("should dont resend email ", async () => {
        jest.spyOn(UserRepository, 'getByLoginOrEmail').mockImplementation(() => Promise.resolve(UserDB.user2));
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
