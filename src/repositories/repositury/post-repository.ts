import {PostType} from "../../types/posts/output";
import {PostUpdateModel} from "../../types/posts/input";
import {postCollection} from "../../db/db";
import {ObjectId} from "mongodb";



export class PostRepository {

    // Возвращает ID созданного поста
    static async addPost(newPost: PostType): Promise<string> {
        const addResult = await postCollection.insertOne(newPost);
        return addResult.insertedId.toString()
    }

    //Возвращает ✅true (пост найден), ❌false (пост не найден)
    static async updatePost(updateParams: PostUpdateModel, id: string): Promise<boolean> {
        const updateResult = await postCollection.updateOne({_id: new ObjectId(id)}, {
            $set: updateParams
        });
        return !!updateResult.matchedCount
    }

    // Возарщает ✅true (пост найден и удален), ❌false (пост не найден)
    static async deletePostById(id: string): Promise<boolean> {
        const deleteResult = await postCollection.deleteOne({_id: new ObjectId(id)});
        return !!deleteResult.deletedCount
    }
}

