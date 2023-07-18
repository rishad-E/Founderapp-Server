import { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError from "http-errors";
import jwt from 'jsonwebtoken'
import env from '../util/validateEnv'


export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //   get the token from the authorization header
        if (!req.headers.authorization) return next(createHttpError(401, 'Invalid request!'))
        const token: string = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(JSON.parse(token), env.JWT_SECRET);
        res.locals.decodedToken = decodedToken;
        next()
    } catch (error) {
        return next(createHttpError(401, 'Invalid token'))
    }
}

export const localVariables: RequestHandler = (req, res, next) => {
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}

