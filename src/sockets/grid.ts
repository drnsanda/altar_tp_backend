import WebSocket from 'ws';
import config from '../config';
import { IncomingMessage } from 'http';

const handleMessage = (task:string,client:WebSocket & IncomingMessage)=>{
    console.log("Receiving messages from server ::: ");
    client.send(`You have requested the folowing ::: ${task}`);    
}

const initiateGridSocket = ()=>{
    const socket = new WebSocket.Server({port: config.gridSocketPort});
    console.log('\x1b[35m::: [SOCKETS_GRID_INITIALIZED] :::\x1b[0m');

    socket.on('connection',(client)=>{

        client.on('message',(message:string,client :WebSocket & IncomingMessage)=>{
            handleMessage(message,client);
        });

        client.on('error',(err:Error)=>{
            client.send('Failed to complete task ' + err.message);    
        });

        client.on('close',()=>{
            client.send('Connection has been closed');   
        });

    });      

    socket.on('error',(err)=>{
        console.log("Failed to initiate Grid Socket ::: ",err.message);  
    });
}  

export default initiateGridSocket;