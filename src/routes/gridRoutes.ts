import express from 'express';
import * as handlers from '../handlers/gridHandler';

const router = express.Router();  
//Handles Non Beforehand Authentication

router.post('/', handlers.generateGridHandler); 


export default router;
    