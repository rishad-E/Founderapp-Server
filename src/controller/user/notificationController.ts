import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import notificationModel from "../../models/notificationModel";

// CREATE NOTIFICATION
export const createNotification: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'));
        const { type, receiver, reqFrom, message } = req.body

        // create a document in notification for request/response
        const newNotification = new notificationModel({
            sender: userId,
            receiver: receiver || reqFrom,
            type,
            message
        })
        await newNotification.save()
        res.sendStatus(201)

    } catch (error) {
        return next(InternalServerError)
    }
}

// GET NOTIFICATIONS
export const getNotifications: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'));

        const notifications = await notificationModel.find({ receiver: userId }).populate('sender').sort({ "createdAt": -1 })
        res.status(200).json({ notifications })

    } catch (error) {
        return next(InternalServerError)
    }
}

// UPDATE NOTIFICATION AS READ
export const updateReadNotification: RequestHandler = async (req, res, next) => {
    try {
        const userId = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'));
        const id = req.query.id
        await notificationModel.findOneAndUpdate({ _id: id }, { $set: { isRead: true } })
        res.sendStatus(200)
    } catch (error) {
        return next(InternalServerError)
    }
}