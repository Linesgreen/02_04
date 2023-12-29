// noinspection AnonymousFunctionJS,MagicNumberJS

import {Router, Response} from "express";
import {
    RequestWithBody,
    RequestWithBodyAndParams,
    RequestWithParams,
    RequestWithQuery,
    RequestWithQueryAndParams
} from "../types/common";
import {
    BlogCreateModel,
    BlogParams,
    BlogUpdateModel,
    BlogSortData,
    PostBlogReqBody,
} from "../types/blogs/input";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {
    blogIdInParamsMiddleware,
    blogPostValidation,
    blogPutValidation,
} from "../middlewares/blog/blogsValidator";
import {OutputItemsBlogType, OutputBlogType} from "../types/blogs/output";
import {BlogService} from "../domain/blog.service";
import {BlogQueryRepository} from "../repositories/query repository/blog-query-repository";
import {PostSortData, PostToBlogCreateModel} from "../types/posts/input";
import {PostQueryRepository} from "../repositories/query repository/post-query-repository";
import {OutputItemsPostType, OutputPostType} from "../types/posts/output";
import {postInBlogValidation} from "../middlewares/post/postsValidator";
import {mongoIdAndErrorResult} from "../middlewares/mongoIDValidation";

export const blogRoute = Router({});

blogRoute.get('/', async (req: RequestWithQuery<BlogSortData>, res: Response<OutputBlogType>) => {
    const sortData: BlogSortData = {
        searchNameTerm: req.query.searchNameTerm,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize
    };
    const blogs: OutputBlogType = await BlogQueryRepository.getAllBlogs(sortData);
    res.send(blogs)
});


blogRoute.get('/:id/posts', blogIdInParamsMiddleware, mongoIdAndErrorResult(), async (req: RequestWithQueryAndParams<BlogParams, PostSortData>, res: Response<OutputPostType>) => {
    const blogId: string = req.params.id;
    const sortData: PostSortData = {
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize
    };
    const posts: OutputPostType | null = await PostQueryRepository.getAllPostsInBlog(blogId, sortData);
    return posts? res.status(200).send(posts) :  res.sendStatus(404);
});



blogRoute.get('/:id', mongoIdAndErrorResult(), blogIdInParamsMiddleware, async (req: RequestWithParams<BlogParams>, res: Response<OutputItemsBlogType>) => {
    const id: string = req.params.id;
    const blog: OutputItemsBlogType | null = await BlogQueryRepository.getBlogById(id);
    blog ? res.send(blog) : res.sendStatus(404)
});

blogRoute.post('/', authMiddleware, blogPostValidation(), async (req: RequestWithBody<BlogCreateModel>, res: Response<OutputItemsBlogType>) => {
    let {name, description, websiteUrl}: PostBlogReqBody = req.body;
    const newBlog: OutputItemsBlogType = await BlogService.addBlog({name, description, websiteUrl});
    res.status(201).send(newBlog);
});


blogRoute.post('/:id/posts', authMiddleware, postInBlogValidation(), async (req: RequestWithBodyAndParams<BlogParams, PostToBlogCreateModel>, res: Response<OutputItemsPostType | null>) => {
    const id: string = req.params.id;
    let {title, shortDescription, content}: PostToBlogCreateModel = req.body;
    const newPost: OutputItemsPostType | null = await BlogService.addPostToBlog(id, {title, shortDescription, content});
    return newPost ?  res.status(201).send(newPost) : res.sendStatus(404)
});


blogRoute.put('/:id', authMiddleware, blogPutValidation(), async (req: RequestWithBodyAndParams<BlogParams, BlogUpdateModel>, res: Response) => {
    const id: string = req.params.id;
    const {name, description, websiteUrl}: BlogUpdateModel = req.body;
    const updateResult: boolean = await BlogService.updateBlog({name, description, websiteUrl}, id);
    updateResult ? res.sendStatus(204) : res.sendStatus(404)
});

blogRoute.delete('/:id', authMiddleware, mongoIdAndErrorResult(), async (req: RequestWithParams<BlogParams>, res: Response) => {
    const id: string = req.params.id;
    const deleteResult: boolean = await BlogService.deleteBlogById(id);
    deleteResult ? res.sendStatus(204) : res.sendStatus(404)
});
