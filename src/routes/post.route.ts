// noinspection MagicNumberJS,AnonymousFunctionJS

import {Router, Response} from "express";
import {OutputItemsPostType, OutputPostType, PostType} from "../types/posts/output";
import {
    RequestWithBody,
    RequestWithBodyAndParams,
    RequestWithParams,
    RequestWithQuery,
    RequestWithQueryAndParams
} from "../types/common";
import {PostCreateModel, PostParams, PostSortData, PostUpdateModel,} from "../types/posts/input";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {
    addCommentToPost,
    postPostValidation,
    postPutValidation
} from "../middlewares/post/postsValidator";
import {PostService} from "../domain/post.service";
import {PostQueryRepository} from "../repositories/query repository/post-query-repository";
import {UserParams} from "../types/users/input";
import {CommentCreateModel, CommentsSortData} from "../types/comment/input";
import {CommentQueryRepository} from "../repositories/query repository/comment-query-repository";
import {mongoIdAndErrorResult} from "../middlewares/mongoIDValidation";
import {authBearerMiddleware} from "../middlewares/auth/auth-bearer-niddleware";
import {OutputCommentType, OutputItemsCommentType} from "../types/comment/output";
export const postRoute = Router({});


//Получаем все посты
postRoute.get('/', async (req: RequestWithQuery<PostSortData>, res: Response<OutputPostType>) => {
    const sortData: PostSortData = {
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize
    };
    const posts: OutputPostType = await PostQueryRepository.getAllPosts(sortData);
    res.send(posts)
});

//Получаем конкретный пост
postRoute.get('/:id', mongoIdAndErrorResult(), async (req: RequestWithParams<PostParams>, res: Response<PostType>) => {
    const id: string = req.params.id;
    const post: PostType | null = await PostQueryRepository.getPostById(id);
    post ? res.send(post) : res.sendStatus(404)
});

// Создаем пост
postRoute.post('/', authMiddleware, postPostValidation(), async (req: RequestWithBody<PostCreateModel>, res: Response<PostType | null>) => {
    let {title, shortDescription, content, blogId}: PostCreateModel = req.body;
    const newPost: OutputItemsPostType = await PostService.addPost({title, shortDescription, content, blogId});
    res.status(201).send(newPost);
});

// Обновляем пост
postRoute.put('/:id', authMiddleware, postPutValidation(), async (req: RequestWithBodyAndParams<PostParams, PostUpdateModel>, res: Response) => {
    const id: string = req.params.id;
    const {title, shortDescription, content, blogId}: PostUpdateModel = req.body;
    const updateResult: boolean = await PostService.updatePost({title, shortDescription, content, blogId}, id);
    updateResult ? res.sendStatus(204) : res.sendStatus(404)
});

// Удаляем пост
postRoute.delete('/:id', authMiddleware, mongoIdAndErrorResult(), async (req: RequestWithParams<UserParams>, res: Response) => {
    const id: string = req.params.id;
    const deleteResult: boolean = await PostService.deletePostById(id);
    deleteResult ? res.sendStatus(204) : res.sendStatus(404)
});

// Cоздаем коментарий к посту
postRoute.post('/:id/comments', authBearerMiddleware, addCommentToPost(), async (req: RequestWithBodyAndParams<PostParams, CommentCreateModel>, res: Response<OutputItemsCommentType | null>) => {
    const {id: userId, login: userLogin} = req.user!;
    const postId: string = req.params.id;
    const content: CommentCreateModel = req.body;
    const newComment: OutputItemsCommentType | null = await PostService.addCommentToPost({userId, userLogin}, postId, content);
    return newComment  ? res.status(201).send(newComment) : res.sendStatus(404);
});
// Получаем коментарии к посту
postRoute.get('/:id/comments', mongoIdAndErrorResult(), async (req: RequestWithQueryAndParams<PostParams, CommentsSortData>, res: Response) => {
    const sortData: CommentsSortData = {
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize
    };
    const postId: string = req.params.id;
    const comments: OutputCommentType | null = await CommentQueryRepository.getCommentsByPostId(postId, sortData);
    return comments ? res.status(200).send(comments) : res.sendStatus(404)
});





