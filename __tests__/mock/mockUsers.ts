import {UserCreateModel} from "../../src/types/users/input";
import {UserDBType} from "../../src/types/users/output";
import {ObjectId} from "mongodb";
import {add} from "date-fns";



export const UserCreateData: Record<string, UserCreateModel> = {
    correctData : {
        "login": "qqTSsPPMfL",
        "password": "string",
        "email": "linesgreen@mail.ru"
    }
}
export const UserDB: Record<string, UserDBType> = {
    // User with correct data
    user1: {
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
    },
    // User with a confirmed account
    user2: {
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
    },
    // User expires date
    user3: {
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
    }
}

