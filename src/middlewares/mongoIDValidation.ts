import {param} from "express-validator";
import {inputModelValidation} from "./inputModel/input-model-Validation";

export const mongoIDValidation = param('id').isString().isMongoId().withMessage('id NOT mongoID');

export const mongoIdAndErrorResult = () => [mongoIDValidation, inputModelValidation];