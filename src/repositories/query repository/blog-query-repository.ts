import {BlogType, OutputItemsBlogType, OutputBlogType} from "../../types/blogs/output";
import {ObjectId, WithId} from "mongodb";
import {blogCollection} from "../../db/db";
import {BLogMapper} from "../../types/blogs/mapper";
import {BlogSortData} from "../../types/blogs/input";

import {ConvertedBlogSortData} from "../../types/blogs/query";
import {ConstructorFilter} from "../utils/blog-query/constructorFilter";
import {FilterType, SortType} from "../../types/Mongo/params";

export class BlogQueryRepository {
    /**
     * Get All Blogs
     * @param sortData - params for sort
     * @returns Blogs - Mapped Blogs with pagination
     */
    static async getAllBlogs(sortData: BlogSortData): Promise<OutputBlogType> {

        const formattedSortData: ConvertedBlogSortData = {
            searchNameTerm: sortData.searchNameTerm || null,
            sortBy: sortData.sortBy || 'createdAt',
            sortDirection: sortData.sortDirection || 'desc',
            pageNumber: sortData.pageNumber || '1',
            pageSize: sortData.pageSize || '10'
        };

        const findFilter: FilterType = ConstructorFilter.filter_Find_NameTerm(formattedSortData.searchNameTerm);
        const sortFilter: SortType = ConstructorFilter.filter_Sort(formattedSortData.sortBy, formattedSortData.sortDirection);
        const skipFilter: number = ConstructorFilter.filter_Skip(formattedSortData.pageNumber, formattedSortData.pageSize);

        const blogs: WithId<BlogType>[] = await blogCollection
            .find(findFilter)
            .sort(sortFilter)
            .skip(skipFilter)
            .limit(+formattedSortData.pageSize)
            .toArray();

        const totalCount: number = await blogCollection.countDocuments(findFilter);
        const pageCount: number = Math.ceil(totalCount / +formattedSortData.pageSize);

        return {
            pagesCount: pageCount,
            page: +formattedSortData.pageNumber,
            pageSize: +formattedSortData.pageSize,
            totalCount: +totalCount,
            items: blogs.map(BLogMapper)
        }

    }

    /**
     * Get Blog By ID
     * @param id - Blog ID
     * @returns Blog - Mapped Blog
     * @return null - if blog dont exist
     */
    static async getBlogById(id: string): Promise<OutputItemsBlogType | null> {
        const blog: WithId<BlogType> | null = await blogCollection.findOne({_id: new ObjectId(id)});
        return blog ? BLogMapper(blog) : null

    }

    // ⚠️Удаление всех блогов для тестов
    static async deleteAll() {
        await blogCollection.deleteMany({})
    }
}