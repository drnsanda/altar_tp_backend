import express from 'express';
import { configureRouter } from './routes';
import config from './config';
import bodyParser from 'body-parser';
import workers from './workers';  
import cors, { CorsOptions } from 'cors';
import sockets from './sockets';
import http from 'http';
const app = express();

const corsOptions: CorsOptions = {
    origin: [config.baseFrontendUrl] //Whitelist Configuration       
}
    
export const server = http.createServer(app);
//Initialize Server
server.listen(config.port,()=>{
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

export default app;       