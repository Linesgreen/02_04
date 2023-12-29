
import {userCollection} from "../../db/db";
import {ObjectId} from "mongodb";
import {UserDBType, UserOutputType, UserWithPaginationOutputType} from "../../types/users/output";
import {UserMapper} from "../../types/users/UserMapper";
import {UserSortData} from "../../types/users/input";
import {ConvertedUserSortData} from "../../types/users/query";
import {ConstructorFilter} from "../utils/blog-query/constructorFilter";
import {FilterType, SortType} from "../../types/Mongo/params";

// noinspection UnnecessaryLocalVariableJS
export class UserQueryRepository {
    /**
     * Get All Users
     * @param sortData - params for sort
     * @returns Users - Mapped + pagination
     */
    static async getAllUsers(sortData: UserSortData): Promise<UserWithPaginationOutputType> {
        const formattedSortData: ConvertedUserSortData = {
            searchEmailTerm: sortData.searchEmailTerm || null,
            searchLoginTerm: sortData.searchLoginTerm || null,
            sortBy: sortData.sortBy || 'createdAt',
            sortDirection: sortData.sortDirection || "desc",
            pageNumber: sortData.pageNumber || '1',
            pageSize: sortData.pageSize || '10'
        };

        const findFilter: FilterType = ConstructorFilter.filter_Find_EmailORLoginTerm(formattedSortData.searchEmailTerm, formattedSortData.searchLoginTerm);
        const sortFilter: SortType = ConstructorFilter.filter_Sort_for_Users(formattedSortData.sortBy, formattedSortData.sortDirection);
        const skipFilter: number = ConstructorFilter.filter_Skip(formattedSortData.pageNumber, formattedSortData.pageSize);

        const usersFromDB: UserDBType[] = await userCollection
            .find(findFilter)
            .sort(sortFilter)
            .skip(skipFilter)
            .limit(+formattedSortData.pageSize)
            .toArray();

        const totalCount: number = await userCollection.countDocuments(findFilter);
        const pageCount: number = Math.ceil(totalCount / +formattedSortData.pageSize);
        return {
            pagesCount: pageCount,
            page: +formattedSortData.pageNumber,
            pageSize: +formattedSortData.pageSize,
            totalCount: +totalCount,
            items: usersFromDB.map(UserMapper)
        }

    }

    /**
     * Get User by RegCode
     * @param code - code for confirm account
     * @returns Users - Mapped
     * @returns null - if user doesn't exist
     */
    static async getUserByRegCode(code: string): Promise<UserDBType | null> {
        const user: UserDBType | null = await userCollection.findOne({"emailConfirmation.confirmationCode": code});
        return user;
    }

    /**
     * Get User by ID
     * @param id - user ID
     * @returns Users - Mapped
     * @returns null - if user doesn't exist
     */
    static async getUserById(id: string): Promise<UserOutputType | null> {
        const user: UserDBType | null = await userCollection.findOne({_id: new ObjectId(id)});
        return user ? UserMapper(user) : null
    }

    static async deleteAll() {
        await userCollection.deleteMany({})
    }
}