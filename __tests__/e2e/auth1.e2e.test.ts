// noinspection DuplicatedCode,LocalVariableNamingConventionJS,MagicNumberJS

import {app, RouterPaths} from "../../src/setting";
import request from 'supertest'
import {UserCreateModel} from "../../src/types/users/input";
import {UserOutputType} from "../../src/types/users/output";
import {jest} from '@jest/globals';

import {EmailsManager} from "../../src/managers/email-manager";

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
    const basicAuth = {
        login: 'admin',
        password: 'qwerty'
    };


    //Данные созданного пользователя
    let user1: UserOutputType;


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
            .send({email: 'zhuk', login: '', password: '0'})
            .expect(400,{
                errorsMessages: [
                    { message: 'Invalid value', field: 'login' },
                    { message: 'incorrect email', field: 'email' },
                    { message: 'incorrect password', field: 'password' }
                ]
            })
    });
    //Регистрируем пользователя с уже занятым логином и паролем (Дима нюхоног)
    it("shouldn't create user with incorrect data ", async () => {
        jest.spyOn(EmailsManager, 'sendEmailConfirmation').mockReturnValue(Promise.resolve(true));
        await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .send(userData)
            .expect(400,{
                errorsMessages: [
                    {message: 'User already exists', field: 'email'},
                    {message: 'User already exists', field: 'login'}
                ]
            })
    });


});