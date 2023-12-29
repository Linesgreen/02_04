
import {ObjectId, WithId} from "mongodb";
import {commentCollection} from "../../db/db";
import {CommentType, OutputCommentType, OutputItemsCommentType} from "../../types/comment/output";
import {CommentMapper} from "../../types/comment/commentMapper";
import {CommentsSortData} from "../../types/comment/input";

import {ConvertedCommentSortData} from "../../types/comment/query";
import {SortType} from "../../types/Mongo/params";
import {ConstructorFilter} from "../utils/blog-query/constructorFilter";



// noinspection UnnecessaryLocalVariableJS
export class CommentQueryRepository {

    /**
     * Get All Comments
     * @returns Comments - Mapped Blogs with pagination
     */
    static async getAllComments() {

        const comments: WithId<CommentType>[] = await commentCollection
            .find({})
            .toArray();

        return comments
    }

    /**
     * Get Comment By ID
     * @param id - Blog ID
     * @returns Comment - Mapped Comment
     * @return null - if dont exist
     */
    static async getCommentById(id: string): Promise<OutputItemsCommentType | null> {
        const comments: WithId<CommentType> | null = await commentCollection.findOne({_id: new ObjectId(id)});
        return comments ? CommentMapper(comments) : null
    }

    /**
     * Get Comments from Post
     * @param postId
     * @param sortData - params for sort
     * @returns Comments - Mapped Comments with pagination
     */
    static async getCommentsByPostId(postId: string, sortData: CommentsSortData): Promise<OutputCommentType | null> {
        const formattedSortData: ConvertedCommentSortData = {
            sortBy: sortData.sortBy || 'createdAt',
            sortDirection: sortData.sortDirection || 'desc',
            pageNumber: sortData.pageNumber || '1',
            pageSize: sortData.pageSize || '10'
        };

        const findFilter = {postId: postId};
        const sortFilter: SortType = ConstructorFilter.filter_Sort(formattedSortData.sortBy, formattedSortData.sortDirection);
        const skipFilter: number = ConstructorFilter.filter_Skip(formattedSortData.pageNumber, formattedSortData.pageSize);

        const comments: WithId<CommentType>[] | null = await commentCollection
            .find(findFilter)
            .sort(sortFilter)
            .skip(skipFilter)
            .limit(+formattedSortData.pageSize)
            .toArray();
        const totalCount: number = await commentCollection.countDocuments(findFilter);
        const pageCount: number = Math.ceil(totalCount / +formattedSortData.pageSize);
        if (totalCount >= 1) {
            return {
                pagesCount: pageCount,
                page: +formattedSortData.pageNumber,
                pageSize: +formattedSortData.pageSize,
                totalCount: +totalCount,
                items: comments.map(CommentMapper)
            }
        }
        return null
    }

    //Полное удаление для тестов
    static async deleteAll() {
        await commentCollection.deleteMany({})
    }

}