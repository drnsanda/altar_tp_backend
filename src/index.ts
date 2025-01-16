import express from 'express';
import { configureRouter } from './routes';
import config from './config';
import bodyParser from 'body-parser';
import workers from './workers';  
import cors, { CorsOptions } from 'cors';
import sockets from './sockets';
const app = express();

const corsOptions: CorsOptions = {
    origin: ["http://localhost:3000"] //Whitelist Configuration   
}
    
//Initialize Server
app.listen(config.port,()=>{
    //Primary Middlewares
    app.use(bodyParser.json());   
    
    //CORS Configurations
    app.use(cors(corsOptions));

    //Router Configuration
    configureRouter(app);

    //Initiate Workers
    workers.init() ;     
    
    //Initiate Sockets
    sockets.init();   

    console.log("\x1b[32m::: [SERVER_CONNECTION_ESTABLISHED] ::: \x1b[0m",new Date().toLocaleDateString(),new Date().toLocaleTimeString()); 
    
});