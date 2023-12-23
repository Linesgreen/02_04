import {emailAdapter} from "../adapters/email-adapter";


// noinspection UnnecessaryLocalVariableJS
export class EmailsManager {
    static async sendEmailConfirmation(email: string, confCode: string) {
        const subject: string = "Email Confirmation";
        const message: string = `
        <h1>Thanks for your registration</h1>
        <p>
            To finish registration, please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${confCode}'>
                complete registration
            </a>
        </p>
        <p>Код поддверждения для тестов</p>
        <p>${confCode}</p>
    `;
        const result = await emailAdapter.sendEmail(email, subject, message);

        return true
    }

}