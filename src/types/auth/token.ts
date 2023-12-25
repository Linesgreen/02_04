import {ObjectId} from "mongodb";

export type expiredTokenDBType = {
    _id: ObjectId,
    token: String,
    dateAdded: Date,
    reason: String
}