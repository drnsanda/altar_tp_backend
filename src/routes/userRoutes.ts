import express from 'express';
import * as handlers from '../handlers/userHandler';

const router = express.Router();  
//Handles Non Beforehand Authentication

router.post('/auth', handlers.authUserHandler);
router.post('/auth/logout/:id', handlers.logoutUserHandler); 
router.post('/grid', handlers.generateGridHandler); 


//Veriy Authentication      
router.use(handlers.verifyTokenUserMiddleware);   



export default router;
    