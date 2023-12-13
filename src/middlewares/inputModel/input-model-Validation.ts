// noinspection AnonymousFunctionJS

import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";

export const inputModelValidation = (req: Request, res: Response, next: NextFunction) => {
    console.log("Запущен inputModelValidation");
    console.log("---------------------------------------");
    const errors = validationResult(req).formatWith(error => {
        switch (error.type) {
            case 'field' :
                return {
                    message: error.msg,
                    field: error.path,

                };
            default:
                return {
                    message: error.msg,
                    field: '-----'
                }
        }

    });

    if (!errors.isEmpty()) {
        const err = errors.array({onlyFirstError: true});

        return res.status(400).send({
            errorsMessages: err
        })
    }

    return next();
};

