import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import userModel from "../../models/userModel";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import env from "../../util/validateEnv";
import otpGenerator from 'otp-generator'
import fileUploader from "../../util/fileUploader";

// middleware for  user authentication 
export const authenticate: RequestHandler = async (req, res, next) => {
    try {
        const { email } = req.method == "GET" ? req.query : req.body;
        const user = await userModel.findOne({ email });
        if (!user) return next(createHttpError(404, 'user not found'))
        next()
    } catch (error) {
        return next(InternalServerError)
    }
}

// check user already exist or not for signup
//email
export const userExist: RequestHandler = async (req, res, next) => {
    try {
        const { email } = req.query;
        const user = await userModel.findOne({ email });
        if (user) return res.status(400).send({ message: "Email already exists" });
        next()
    } catch (error) {
        return next(InternalServerError)
    }
}


// USER SIGN UP
//email,passqord,username(req.body)
export const signup: RequestHandler = async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;

        const userExist = await userModel.findOne({ email });
        if (userExist) return next(createHttpError(422, 'Email already exist!'));

        await bcrypt.hash(password, 10).then((hashPassword) => {
            const newUser = new userModel({
                userName,
                email,
                password: hashPassword
            });
            newUser.save()
                .then(() => {
                    // create jwt token
                    const token = jwt.sign({
                        userId: newUser._id,
                        email: newUser.email,
                        userName: newUser.userName
                    }, env.JWT_SECRET, { expiresIn: "24h" });

                    return res.status(201).json({
                        message: "Signup Successful...",
                        token,
                    })
                })
                .catch((error) => { res.status(500).json(error) })
        })

    } catch (error) {
        return next(InternalServerError)
    }
}

// USER SIGN IN
export const signin: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email, status: "Active" })
        if (!user) return next(createHttpError(404, 'User not found!'));

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return next(createHttpError(401, 'Invalid password!'));

        // create jwt token
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            userName: user.userName
        }, env.JWT_SECRET, { expiresIn: "24h" });
        return res.status(200).json({
            message: "Signin Successful...",
            token
        })

    } catch (error) {
        return next(InternalServerError)
    }
}

// GET USER DETAILS 
//middleware for authentication
export const userDetails: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Invalid userId'));

        const user = await userModel.findById(userId);
        if (!user) return next(createHttpError(404, 'Could not find the user!'));

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = Object.assign({}, user.toJSON()); // details except password 
        res.status(200).json({ userDetails: rest });

    } catch (error) {
        return next(InternalServerError);
    }
}

// GET PROFILE PHOTO
export const getProfilePhoto:RequestHandler = async (req,res,next) => {
    try {
        const {userId} = res.locals.decodedToken;
        if(!userId) return next(createHttpError(401, 'Unauthorized user'))
        const user = await userModel.findById(userId)
        res.status(200).json({profilePhoto: user?.profilePhoto || null})
    } catch (error) {
        return next(InternalServerError)
    }
}

// ADD PROFILE PHOTO
export const profilePhoto: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'))
        const profilePhoto = req.body.file;

        fileUploader(profilePhoto)
            .then(async (profilePhoto) => {
                await userModel.updateOne({ _id: userId }, { $set: { profilePhoto } })
                res.sendStatus(201)
            }).catch(() => next(createHttpError(400, 'Invalid input')))
    } catch (error) {
        return next(InternalServerError)
    }
}

// UPDATE USER PROFILE
export const updateUserProfile: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'))
        const { intro, gender, age, country, state, city } = req.body
        await userModel.updateOne({ _id: userId }, { $set: { intro, gender, age, location: { country, state, city } } })
        res.status(201).send('updated successfully')

    } catch (error) {
        console.log(error);
        
        return next(InternalServerError)
    }
}

// UPDATE ABOUT USER
export const updateAbout: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized User'))
        const { isTechnical, haveIdea, accomplishments, education, employment, responsibilities, interests } = req.body

        await userModel.updateOne({ _id: userId }, { $set: { isTechnical, haveIdea, accomplishments, education, employment, responsibilities, interests } })
        res.status(201).send({ message: 'Updated successfully' })
    } catch (error) {
        return next(InternalServerError)
    }
}

// UPDATE COFOUNDER PREFERENCE
export const updateCofounderPreference: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'))
        const { activelySeeking, cofounderTechnical, cofounderHasIdea, locationPreference, cofounderResponsibilities } = req.body
        await userModel.updateOne({ _id: userId }, { $set: { activelySeeking, cofounderTechnical, cofounderHasIdea, locationPreference, cofounderResponsibilities } })
        res.status(201).send({ message: 'cofounder preference updated successfully' })
    } catch (error) {
        return next(InternalServerError)
    }
}

// GENERATE OTP
export const generateOtp: RequestHandler = async (req, res, next) => {
    try {
        req.app.locals.OTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        res.status(201).send( req.app.locals.OTP )
    } catch (error) {
        return next(InternalServerError)
    }
}

// VERIFY OTP
export const verifyOtp: RequestHandler = async (req, res, next) => {
    const { code } = req.body; // 🛑 changed from query to body 🛑

    if (!code) return next(createHttpError(501, 'invalid OTP'))
    if ((req.app.locals.OTP) === code) {
        req.app.locals.OTP = null; // reset the otp value
        req.app.locals.resetSession = true; //start session for reset password
        return res.status(200).send({ msg: 'Verified Successfully.' })
    }
    return next(createHttpError(401, 'invalid OTP'))
}

// CHANGE PASSWORD
export const changePassword: RequestHandler = async (req, res, next) => {
    try {
        const { newPassword, email } = req.body;
        const password = await bcrypt.hash(newPassword, 10)

        await userModel.findOneAndUpdate({ email }, { $set: { password: password } }).then((result) => {
            if (!result) return res.sendStatus(404)
            res.sendStatus(200)
        })

    } catch (error) {
        return next(InternalServerError)
    }
}