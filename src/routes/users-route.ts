// noinspection MagicNumberJS,AnonymousFunctionJS

import {Router, Response} from "express";
import {UserService} from "../domain/user.service";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../types/common";
import {UserCreateModel, UserSortData} from "../types/users/input";
import {UserQueryRepository} from "../repositories/query repository/user-query-repository";
import {UserOutputType, UserWithPaginationOutputType} from "../types/users/output";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {PostParams} from "../types/posts/input";
import {userPostValidation} from "../middlewares/user/userValidatior";
import {mongoIdAndErrorResult} from "../middlewares/mongoIDValidation";

export const usersRoute = Router({});


usersRoute.get('/', authMiddleware, async (req: RequestWithQuery<UserSortData>, res: Response<UserWithPaginationOutputType>) => {
    const sortData: UserSortData = {
        searchEmailTerm: req.query.searchEmailTerm,
        searchLoginTerm: req.query.searchLoginTerm,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize
    };
    const users: UserWithPaginationOutputType = await UserQueryRepository.getAllUsers(sortData);
    res.status(200).send(users)
});


usersRoute.post('/', authMiddleware, userPostValidation(), async (req: RequestWithBody<UserCreateModel>, res: Response<UserOutputType>) => {
    const userData: UserCreateModel = {
        login: req.body.login,
        password: req.body.password,
        email: req.body.email
    };
    const newUserId: string = await UserService.addUser(userData);
    const newUser: UserOutputType | null = await UserQueryRepository.getUserById(newUserId);
    return newUser ? res.status(201).send(newUser) : res.sendStatus(204)
});

usersRoute.delete('/:id', authMiddleware, mongoIdAndErrorResult(), async (req: RequestWithParams<PostParams>, res: Response) => {
    const id: string = req.params.id;
    const deleteResult: boolean = await UserService.deleteUserByID(id);
    deleteResult ? res.sendStatus(204) : res.sendStatus(404)
});
