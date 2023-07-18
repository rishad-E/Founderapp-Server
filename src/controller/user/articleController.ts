import { RequestHandler } from "express"
import createHttpError, { InternalServerError } from "http-errors"
import articleModel from "../../models/articleModel"

// GET ALL ARTICLES / SINGLE EVENT
export const getArticles: RequestHandler = async (req, res, next) => {
    try {
        const query = req.query.articleId ? { _id: req.query.articleId, isHide: false } : { isHide: false };
        const articles = await articleModel.find(query).sort({ createdAt: -1 })
        if (!articles) return next(createHttpError(404, 'Articles could not found'))
        res.status(200).send({ articles })
    } catch (error) {
        return next(InternalServerError)
    }
}