import { RequestHandler } from "express";
import eventModel from "../../models/eventModel";
import createHttpError, { InternalServerError } from "http-errors";
import fileUploader from "../../util/fileUploader";


// Get all events
export const getEvents: RequestHandler = async (req, res, next) => {
    try {
        const events = await eventModel.find().sort({dateAndTime:-1})
        if (!events) return next(createHttpError(501, 'Could not retrieve data.'))
        res.status(200).send(events)
    } catch (error) {
        return next(InternalServerError)
    }
}

// GET ATTENDIES OF EVENT
export const getAttendies: RequestHandler = async (req, res, next) => {
    try {
        const { eventId } = req.query
        const event = await eventModel.findById(eventId,{attendees:1}).populate('attendees')
        const attendees = event?.attendees
        res.status(200).json({attendees})
        
    } catch (error) {
        return next(InternalServerError)
    }
}

// Host a new Event
export const hostEvent: RequestHandler = async (req, res, next) => {

    try {
        const mentorImage = await fileUploader(req.body.mentorImage)
        const newEvent = new eventModel({
            mentorName: req.body.mentorName,
            title: req.body.title,
            description: req.body.description,
            dateAndTime: req.body.dateAndTime,
            venue: req.body.venue,
            joinLink: req.body.joinLink,
            enrollmentFee:req.body.enrollmentFee,
            mentorImage
        })

        await newEvent.save()
            .then(() => {
                res.sendStatus(201)
            })
            .catch(() => {
                return next(createHttpError(400, 'Error occured!'))
            })

    } catch (error) {
        return next(InternalServerError)
    }

}