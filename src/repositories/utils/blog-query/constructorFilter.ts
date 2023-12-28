// noinspection UnnecessaryLocalVariableJS,FunctionNamingConventionJS

import {FilterType, SortType} from "../../../types/Mongo/params";

export class ConstructorFilter {
    //создаем фильтр
    static filter_Find_NameTerm(searchEl: string | null): FilterType | {} {
        return searchEl ? {
            name: {
                $regex: searchEl,
                $options: 'i'
            }
        } : {}
    }

    static filter_Find_EmailORLoginTerm(email: string | null, login: string | null): FilterType {

        // findOne({$or: [{email: logOrEmail}, {login: logOrEmail}]}
        let filter: FilterType = {$or: []};
        if (email) {
            filter['$or']?.push({'accountData.email': {$regex: email, $options: 'i'}});
        }
        if (login) {
            filter['$or']?.push({'accountData.login': {$regex: login, $options: 'i'}});
        }
        if (filter['$or']?.length === 0) {
            filter['$or']?.push({});
        }
        return filter;
    }


    static filter_Sort(sortBy: string, sortDirection: string | undefined): SortType {
        if (sortDirection === 'asc') {
            return {
                [`accountData.${sortBy}`]: 1
            }
        }
        return {
            [`accountData.${sortBy}`]: -1
        }
    }
    static filter_Sort_forBlogs(sortBy: string, sortDirection: string | undefined): SortType {
        if (sortDirection === 'asc') {
            return {
                [sortBy]: 1
            }
        }
        return {
            [sortBy]: -1
        }
    }

    static filter_Skip(pageNumber: string, pageSize: string): number {
        const skip: number = (+pageNumber - 1) * +pageSize;
        return skip
    }
}

