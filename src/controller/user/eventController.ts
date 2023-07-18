import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import eventModel from "../../models/eventModel";

// GET EVENTS / SINGLE EVENT DETAILS
export const getEvents: RequestHandler = async (req, res, next) => {
    try {
        const today = new Date();
        const query = req.query.eventId ? { _id: req.query.eventId, dateAndTime: { $gte: today } } : { dateAndTime: { $gte: today } };
        
        const events = await eventModel.find(query).sort({ dateAndTime: 1 });
        if (!events) return next(createHttpError(404, 'Events could not find'));
        res.status(200).json({ events })
    } catch (error) {
        return next(InternalServerError)
    }
}

// JOIN TO EVENT AND SEND INVITATION MAIL 
export const joinEvent: RequestHandler = async (req, res, next) => {
    try {
        const { userId, userName, email } = res.locals.decodedToken
        if (!userId) return next(createHttpError(401, 'Unauthorized User'))
        const { eventId, joinLink } = req.body;
        await eventModel.findOneAndUpdate({ _id: eventId }, { $addToSet: { attendees: userId } });
        const subject = 'Event invitation';
        const content = 'invitation';
        const updatedBody = { ...req.body, userName, email, subject, joinLink, content }
        req.body = updatedBody;
        next()
    } catch (error) {
        return next(InternalServerError)
    }
}