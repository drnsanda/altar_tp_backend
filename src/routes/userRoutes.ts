import express from 'express';
import * as handlers from '../handlers/userHandler';

const router = express.Router();  
//Handles Non Beforehand Authentication

router.post('/auth', handlers.authUserHandler);
router.post('/auth/logout/:id', handlers.logoutUserHandler); 


//Veriy Authentication      
router.use(handlers.verifyTokenUserMiddleware);   



export default router;
    