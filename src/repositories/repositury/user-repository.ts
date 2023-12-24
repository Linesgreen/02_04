import {UserDBType} from "../../types/users/output";
import {tokenCollection, userCollection} from "../../db/db";
import {ObjectId} from "mongodb";

// noinspection UnnecessaryLocalVariableJS
export class UserRepository {

    /**
     * Create user
     * @param newUser - user data
     * @returns ObjectId
     */
    static async addUser(newUser: UserDBType): Promise<string> {
        const result = await userCollection.insertOne(newUser);
        return result.insertedId.toString()
    }

    /**
     * Create user
     * @param logOrEmail - user login or email
     * @returns user
     * @returns null - if user not fount
     */
    static async getByLoginOrEmail(logOrEmail: string) {
        const user: UserDBType | null = await userCollection.findOne({$or: [{"accountData.email": logOrEmail}, {"accountData.userName": logOrEmail}]});
        return user
    }

    /**
     * Activate user account
     * @param code - activation code
     * @returns boolean
     */
    static async activatedUser(code: string): Promise<boolean> {
        const result = await userCollection.updateOne({"emailConfirmation.confirmationCode": code},{$set: {"emailConfirmation.isConfirmed": true}});
        return !!result.modifiedCount
    }
    /**
     * Refresh activation code
     * @param email
     * @param newConfCode
     * @param expirationDate
     * @return boolean
     */
    static async updateRegCode(email: string, newConfCode: string, expirationDate: Date): Promise<boolean> {
        const result = await userCollection
            .updateOne({"accountData.email": email}, {
                $set: {
                    "emailConfirmation.confirmationCode": newConfCode,
                    "emailConfirmation.expirationDate": expirationDate
                }
            });
        return !!result.modifiedCount
    }

    /**
     * Delete user by Id
     * @param id - user Id
     * @return boolean
     */
    static async deleteUserById(id: string): Promise<boolean> {
        const deleteResult = await userCollection.deleteOne({_id: new ObjectId(id)});
        return !!deleteResult.deletedCount
    }
    /**
     * Add refresh token in ban list
     * @param token token need to punish
     * @return boolean
     */
    static async addTokenInBlackList(token: string): Promise<boolean> {
        await tokenCollection.insertOne({token})
        return true
    }

}