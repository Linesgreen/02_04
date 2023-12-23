import nodemailer from "nodemailer";

export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: "linesgreenTest@gmail.com",
                pass: "knlc evir ufry fcbr",
            },
        });

        const info = await transporter.sendMail({
            from: 'Vlad_Nyah <linesgreenTest@gmail.com>',
            to: email,
            subject: subject,
            html: message

        });
        console.log("**********************************************");
        console.log(info);
        console.log("**********************************************");
        return info
    },
};