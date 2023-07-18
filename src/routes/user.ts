import { Router } from "express"
import { auth, localVariables } from "../middleware/authmiddleware"
import { sendMail } from "../controller/user/mailController"
import * as usercontroller from "../controller/user/userController"
import * as chatController from "../controller/user/chatController"
import * as requestController from "../controller/user/connectionRequestController"
import * as articleController from "../controller/user/articleController"
import * as eventController from "../controller/user/eventController"
import * as matchingProfile from '../controller/user/matchingProfile'
import * as notificationController from "../controller/user/notificationController"

const router = Router()

// verify user existance before signup, if not exist => generate OTP
router
    .route('/verifyUser')
    .get(usercontroller.userExist, localVariables, usercontroller.generateOtp);

// verify user existance before sendign OTP for change password
router
    .route('/authenticate')
    .get(usercontroller.authenticate, localVariables, usercontroller.generateOtp);

// get all articles / single article => req.query.articleId
router
    .route('/getArticles')
    .get(articleController.getArticles) 

// get all events / single event  => req.query.eventId
router
    .route('/getEvents')
    .get(eventController.getEvents)

// OTP verification
router
    .route('/verifyOtp')
    .post(usercontroller.verifyOtp)

// Send mail 
router
    .route('/sendMail')
    .post(sendMail)

// sign up => save details to database
router
    .route("/signup")
    .post(usercontroller.signup)

// sign in of user
router
    .route("/signin")
    .post(usercontroller.signin)

// change password
router
    .route('/changePassword')
    .post(usercontroller.changePassword)

// get logged user's details
router
    .route('/getUser')
    .get(auth, usercontroller.userDetails)

// matching profiles    
router
    .route('/matchingProfiles')
    .get(auth, matchingProfile.findMatchingProfiles)

// get connections of logged user
router
    .route('/getConnections')
    .get(auth, requestController.getConnections)
    .patch(requestController.clearConnections) // Temperory route

// messages
router
    .route('/message')
    .get(auth, chatController.getMessage)
    .post(auth,chatController.sendMessage)

// get Notifications
router
    .route('/getNotifications')
    .get(auth, notificationController.getNotifications)

// Connection Requests
router
    .route('/connectionRequest')
    .get(auth, requestController.getRequests)
    .post(auth, requestController.connectionRequest, notificationController.createNotification)
    .patch(auth, requestController.updateConnectionRequst, notificationController.createNotification)

// join to a event
router
    .route('/joinEvent')
    .post(auth, eventController.joinEvent, sendMail)

// profile photo
router
    .route('/profilePhoto')
    .get(auth, usercontroller.getProfilePhoto)
    .post(auth, usercontroller.profilePhoto)

// update user profile
router
    .route('/updateUserProfile')
    .post(auth, usercontroller.updateUserProfile)

// update about user     
router
    .route('/updateAbout')
    .post(auth, usercontroller.updateAbout)

// update cofounder preference    
router
    .route('/updateCofounderPreference')
    .post(auth, usercontroller.updateCofounderPreference)

export default router;    