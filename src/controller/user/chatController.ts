import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import chatModel from "../../models/chatModel";

// GET MESSAGES BETWEEN LOGGED USER AND A SLECTED USER
export const getMessage: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        const to = req.query.to;
        const messages = await chatModel.find({
            $or: [
                { $and: [{ sender: userId }, { receiver: to }] },
                { $and: [{ sender: to }, { receiver: userId }] }
            ]
        })

        // setting 'myself' as 'true' if the sender is the logged user
        const allMessages = messages.map((msg) => {
            return {
                id: msg._id,
                myself: msg.sender.toString() === userId,
                message: msg.message,
                time: msg.createdAt,
            }
        })
        res.status(200).json(allMessages)

    } catch (error) {
        return next(InternalServerError)
    }
}

// SAVE NEW MESSAGES
export const sendMessage: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, "unauthorized user!"))
        const { message, to } = req.body

        const newMessage = new chatModel({
            sender: userId,
            receiver: to,
            message
        })
        newMessage.save()
        res.status(201).json(newMessage)
    } catch (error) {
        return next(InternalServerError)
    }
}
