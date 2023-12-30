import {OutputItemsPostType, PostType} from "../types/posts/output";
import {PostCreateModel, PostUpdateModel} from "../types/posts/input";
import {OutputItemsBlogType} from "../types/blogs/output";
import {PostRepository} from "../repositories/repositury/post-repository";
import {BlogQueryRepository} from "../repositories/query repository/blog-query-repository";
import {CommentCreateModel} from "../types/comment/input";
import {CommentType, OutputItemsCommentType} from "../types/comment/output";
import {CommentRepository} from "../repositories/repositury/comment-repository";

import {PostQueryRepository} from "../repositories/query repository/post-query-repository";
import {CommentMapper} from "../types/comment/commentMapper";
import {ObjectId} from "mongodb";

export class PostService {
    // Возвращает ID созданного поста
    static async addPost(params: PostCreateModel): Promise<OutputItemsPostType> {
        const blog: OutputItemsBlogType | null = await BlogQueryRepository.getBlogById(params.blogId);
        const newPost: PostType = {
            /*id присваивает БД */
            title: params.title,
            shortDescription: params.shortDescription,
            content: params.content,
            blogId: params.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        };
        const newPostId: string = await PostRepository.addPost({...newPost})
        return {...newPost, id: newPostId}
    }

    //Возвращает ✅true (пост найден), ❌false (пост не найден)
    static async updatePost(params: PostUpdateModel, id: string): Promise<boolean> {
        const updateParams: PostUpdateModel = {
            title: params.title,
            shortDescription: params.shortDescription,
            content: params.content,
            blogId: params.blogId
        };
        return await PostRepository.updatePost(updateParams, id)
    }

    // Возарщает ✅true (пост найден и удален), ❌false (пост не найден)
    static async deletePostById(id: string): Promise<boolean> {
        return await PostRepository.deletePostById(id)
    }

    //Добавляем коментарий к посту
    static async addCommentToPost(userInfo: { userId: string, userLogin: string }, postId: string, content: CommentCreateModel): Promise<OutputItemsCommentType | null> {
        const post = await PostQueryRepository.getPostById(postId);
        if (!post) {
            return null
        }

        const newComment: CommentType = {
            postId: postId,
            content: content.content,
            commentatorInfo: {
                userId: userInfo.userId,
                userLogin: userInfo.userLogin
            },
            createdAt: new Date().toISOString()

        };
        const commentId = await CommentRepository.addComment({...newComment})
        return CommentMapper({...newComment, _id:new ObjectId(commentId)})
    }
}

