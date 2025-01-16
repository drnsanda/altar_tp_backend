
import {Express} from 'express';
import userRouter from './userRoutes';
const configureRouter =  (app:Express) =>{    
//Configure all modules of router inside here
app.use('/api/users',userRouter);     
}     
export {
    configureRouter
}      