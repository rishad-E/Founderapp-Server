import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import userModel from "../../models/userModel";

// GET ALL USERS
export const getUsers: RequestHandler = async (req, res, next) => {

    try {
        const allUsers = await userModel.find().sort({createdAt:-1})
        if (!allUsers) { return next(createHttpError(404, 'Could not find users')) }
        res.status(200).send(allUsers)
    } catch (error) {
        return next(InternalServerError)
    }
}

// BLOCK / UNBLOCK USER
export const updateUserStatus: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = req.query
        if (!userId) return next(createHttpError(400, 'user id not provided'))
        const user = await userModel.findById(userId)
        if (!user) return next(createHttpError(404, 'Could not find user'))
        const status = user.status === 'Active' ? 'Blocked' : 'Active';
        await userModel.findOneAndUpdate({ _id: userId }, { $set: { status } })
        res.sendStatus(200)
    } catch (error) {
        return next(InternalServerError)
    }
}


