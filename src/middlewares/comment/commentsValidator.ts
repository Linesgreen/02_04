import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {UserQueryRepository} from "../../repositories/query repository/user-query-repository";
import {OutputItemsCommentType} from "../../types/comment/output";
import {CommentQueryRepository} from "../../repositories/query repository/comment-query-repository";


export const commentOwnerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const {id: userId,login: userLogin} = req.user!;
    const commentId: string = req.params.id;
    const comment: OutputItemsCommentType | null = await CommentQueryRepository.getCommentById(commentId);
    if (!comment) {
        res.sendStatus(404);
        return
    }
    if (comment.commentatorInfo.userId !== userId && comment.commentatorInfo.userLogin !== userLogin) {
        res.sendStatus(403);
        return
    }
    next()
};

export const authBearerMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
    const auth: string | undefined = req.headers['authorization'];
    if (!auth) {
        res.sendStatus(401);
        return
    }

    const [bearer, token] = auth.split(" ");
    if (bearer !== 'Bearer') {
        res.sendStatus(401);
        return
    }
    const userId = await jwtService.getUserIdByToken(token);
    if (!userId) {
        res.send(401);
        return
    }
    req.user = await UserQueryRepository.getUserById(userId);
    next()
};