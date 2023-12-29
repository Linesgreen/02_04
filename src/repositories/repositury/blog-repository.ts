import {BlogUpdateModel} from "../../types/blogs/input";
import {BlogType} from "../../types/blogs/output";
import {blogCollection} from "../../db/db";
import {ObjectId} from "mongodb";


export class BlogRepository {
    /**
     * Возвращает id созданного блога
     * @param newBlog - новый блог
     * @returns id созданного блога
     */
    static async addBlog(newBlog: BlogType): Promise<string> {
        const result = await blogCollection.insertOne(newBlog);
        return result.insertedId.toString()
    }

    /**
     * Обновляет блог
     * @param params - параметры для обновления блога
     * @param id - id блога
     * @returns ✅true, если обновление прошло успешно, иначе ❌false
     */
    static async updateBlog(params: BlogUpdateModel, id: string): Promise<boolean> {
        const updateResult = await blogCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {
                name: params.name,
                description: params.description,
                websiteUrl: params.websiteUrl,
            }
        });
        return !!updateResult.matchedCount
    }

    /**
     * Удаляет блог по id
     * @param id - id блога
     * @returns ✅true, если удаление прошло успешно, иначе ❌false
     */
    static async deleteBlogById(id: string): Promise<boolean> {

        const deleteResult = await blogCollection.deleteOne({_id: new ObjectId(id)});
        return !!deleteResult.deletedCount

    }
}


