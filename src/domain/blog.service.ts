import {BlogUpdateModel, PostBlogReqBody} from "../types/blogs/input";
import {BlogType, OutputItemsBlogType} from "../types/blogs/output";
import {BlogRepository} from "../repositories/repositury/blog-repository";
import {BlogQueryRepository} from "../repositories/query repository/blog-query-repository";
import {PostToBlogCreateModel} from "../types/posts/input";
import {OutputItemsPostType, PostType} from "../types/posts/output";
import {PostRepository} from "../repositories/repositury/post-repository";


// noinspection JSValidateJSDoc
export class BlogService {
    /**
     * @param params - new blog data
     * @returns {...newPost, id}
     */
    static async addBlog(params: PostBlogReqBody): Promise<OutputItemsBlogType> {
        const newBlog: BlogType = {
            createdAt: new Date().toISOString(),
            name: params.name,
            description: params.description,
            websiteUrl: params.websiteUrl,
            isMembership: false
        };
        console.log('---------------------')
        console.log(newBlog)
        console.log('---------------------')

        const newBlogId =  await BlogRepository.addBlog(newBlog);
        console.log('---------------------')
        console.log(newBlog)
        console.log('---------------------')
        const asnwer =  {...newBlog, id: newBlogId}
       return asnwer

    }
    /**
     * @param id - blog id (string)
     * @param postData
     * @returns {...newPost, id}
     * @return null - if blog do not exist
     */
    static async addPostToBlog(id: string, postData: PostToBlogCreateModel):  Promise<OutputItemsPostType | null> {
        const blog: OutputItemsBlogType | null = await BlogQueryRepository.getBlogById(id);
        if (!blog) {
            return null
        }
        const newPost: PostType = {
            /*id присваивает БД */
            title: postData.title,
            shortDescription: postData.shortDescription,
            content: postData.content,
            blogId: blog.id,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        };
        console.log('---------------------')
        console.log(newPost)
        console.log('---------------------')
        const newPostId = await PostRepository.addPost(newPost);
        console.log('---------------------')
        console.log(newPost)
        console.log('---------------------')
            return {...newPost, id: newPostId}
    }

    // Обновляем блог =  успех ✅true, не успех ❌false
    static async updateBlog(params: BlogUpdateModel, id: string): Promise<boolean> {
        return await BlogRepository.updateBlog(params, id)
    }

    //Удаляем блог =  успех ✅true, не успех ❌false
    static async deleteBlogById(id: string): Promise<boolean> {
        return await BlogRepository.deleteBlogById(id)
    }
}
