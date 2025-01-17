import WebSocket from 'ws';
import config from '../config';
import { generateGridService } from '../services/userService';
import { IncomingMessage } from 'http';

const grid = {
    _html: "",
    clients:0
}

const handleMessage = (task:string,client:WebSocket)=>{
   if(task==='connect'){   
    grid.clients+=1;    
   }
   else if(task==='disconnect'){
    grid.clients-=1;   
   }
}       
const broadcast = (socket:WebSocket.Server,data: string) => {
    socket.clients.forEach((client:WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
//TODO: Handle Debouncing and Time Response
const startLiveGrid = (socket:WebSocket.Server)=>{         
    setInterval(()=>{
        const result= generateGridService();
        if('error' in result){
            console.error("Failed to generate grid");
        }
        else if(typeof result?.html === 'string'){
            grid._html=result?.html;          
        } 
        broadcast(socket,JSON.stringify({status:"updating"}));
        broadcast(socket,JSON.stringify({status:"fetching",html:grid._html,clientsConnected:grid.clients}));   
    },1000*(config.gridRefreshTime));    
}

const initiateGridSocket = ()=>{
    const socket = new WebSocket.Server({port: config.gridSocketPort});
    console.log('\x1b[35m::: [SOCKETS_GRID_INITIALIZED] :::\x1b[0m');
    startLiveGrid(socket);
    socket.on('connection',(client)=>{ 
        client.on('message',(message:string)=>{
            handleMessage(message.toString(),client);   
        });

        client.on('error',(err:Error)=>{
            client.send(JSON.stringify({status:"error",message:'Failed to complete task ' + err.message}));    
        });

        client.on('close',()=>{
            client.send(JSON.stringify({status:"close",message:'Connection has been closed'}));  
        });
    });    

    socket.on('error',(err)=>{
        console.log("Failed to initiate Grid Socket ::: ",err.message);  
    });
}  

export default initiateGridSocket;