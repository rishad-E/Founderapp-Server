import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import { connections } from "mongoose";
import connectionRequestModel from "../../models/connectionRequestModel";
import notificationModel from "../../models/notificationModel";
import userModel from "../../models/userModel";

// clear connections
export const clearConnections:RequestHandler = async  (req,res) => {
    await userModel.updateMany({},{$unset:{connections:""}})
    await connectionRequestModel.deleteMany({})
    await notificationModel.deleteMany({})

    res.sendStatus(200)
}


// GET CONNCTIONS
export const getConnections: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken
        if (!userId) return next(createHttpError(401, "unauthorized user"));

        const connectedUsers = await userModel.findById(userId).populate('connections').select({ connections: 1, _id: 0 })

        res.status(200).json(connectedUsers)

    } catch (error) {
        return next(InternalServerError)
    }
}

// get all the incoming and sented connection requests
export const getRequests: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'))

        const connectionRequests = await connectionRequestModel.find({ $or: [{ sender: userId }, { receiver: userId }] })
        res.status(200).send({ connectionRequests })
    } catch (error) {
        return next(InternalServerError)
    }
}

// new connection request
export const connectionRequest: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken
        if (!userId) return next(createHttpError(401, "Unauthorized user"));
        const { receiver } = req.body

        // create a document in connection request model with default status 'pending'
        const newRequest = new connectionRequestModel({
            sender: userId,
            receiver: receiver,
        })
        await newRequest.save()
        next() // create notification
    } catch (error) {
        return next(InternalServerError)
    }
}

// update the status of the request 
export const updateConnectionRequst: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken
        console.log(req.body);
        
        if (!userId) return next(createHttpError(401, 'Unauthorized user'))
        const { reqFrom, response } = req.body

        // Update the status of the connection request based on response
        const status = response ? 'accepted' : 'rejected';
        const connectionRequest = await connectionRequestModel.findOneAndUpdate({ receiver: userId, sender: reqFrom }, { $set: { status } });
        if (!connectionRequest) {
            return next(createHttpError(404, 'Request not found with the id'))
        }

        // If the request was accepted, add the sender and receiver to each other's connections array
        if (response) {
            await userModel.findByIdAndUpdate(connectionRequest.sender, { $addToSet: { connections: connectionRequest.receiver } })
            await userModel.findByIdAndUpdate(connectionRequest.receiver, { $addToSet: { connections: connectionRequest.sender } });
            next() // create notificationl as accepted
        } else {
            next(); // create notification as rejected
        }
    } catch (error) {
        return next(InternalServerError)
    }
}