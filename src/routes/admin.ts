import { Router } from "express"
import * as articleController from "../controller/admin/articleController"
import * as eventController from "../controller/admin/eventController"
import * as userController from "../controller/admin/userController"
import * as dashboardController from "../controller/admin/dashboardController"

const router = Router();

router
    .route('/dashboardDetails')
    .get(dashboardController.dashboardDetails)

router
    .route('/getUsers')
    .get(userController.getUsers)

router
    .route('/updateUserStatus')
    .patch(userController.updateUserStatus)

router
    .route('/getArticles')
    .get(articleController.getArticles);

router
    .route('/publishArticle')
    .post(articleController.publishArticle);

router
    .route('/updateArticleVisibility')
    .patch(articleController.updateVisibility)
    
router
    .route('/getEvents')
    .get(eventController.getEvents);  
    
router
    .route('/getAttendies')
    .get(eventController.getAttendies);
    
router
    .route('/hostEvent')
    .post(eventController.hostEvent);


export default router;   