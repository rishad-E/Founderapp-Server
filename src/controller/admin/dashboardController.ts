import userModel from "../../models/userModel";
import articleModel from "../../models/articleModel";
import eventModel from "../../models/eventModel";
import { RequestHandler } from "express";
import { InternalServerError } from "http-errors";

export const dashboardDetails: RequestHandler = async (req, res, next) => {
    try {
        const today = new Date()
        const totalUsers = await userModel.find({}).countDocuments()
        const publishedArticles = await articleModel.find({ isHide: false }).countDocuments()
        const upcomingEvents = await eventModel.find({ dateAndTime: { $gte: today } }).countDocuments()
        const chartData = await eventModel.find({ dateAndTime: { $gte: today } })
        res.status(200).json({ totalUsers, publishedArticles, upcomingEvents, chartData })
    } catch (error) {
        return next(InternalServerError)
    }
}