
import {Express} from 'express';
import userRouter from './userRoutes';
import gridRouter from './gridRoutes';
const configureRouter =  (app:Express) =>{    

//Configure all modules of router inside here
app.use('/api/users',userRouter);     
app.use('/api/grids',gridRouter); 

}     
export {
    configureRouter
}         