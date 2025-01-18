import WebSocket from 'ws';
import config from '../config';
import { generateGridService } from '../services/userService';  

const grid:{
  clients:number;
  _html:string;
  bias:Array<string>
} = {
    _html: "",
    clients:0,
    bias:[] //CUE HOLDER FOR CLIENTS
}

const handleMessage = (payload:string,client:WebSocket)=>{
    let task:Partial<{code:string,data:any}> = {code:"",data:{}};
    try{
      task = JSON.parse(payload);   
    }catch(error){
      task={};
      console.error("INVALID_FORMAT_ATTEMPT");
    }
   if(task.code==='connect'){  
    grid.clients+=1;    
   }
   else if(task?.code==='disconnect'){
    grid.clients-=1;   
   }
   else if(task?.code==='bias'){
    grid.bias.push(task?.data);
   }   
}       
const broadcast = (socket:WebSocket.Server,data: string) => {
    socket.clients.forEach((client:WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

const startLiveGrid = (socket: WebSocket.Server) => {    
    setInterval(() => {   
      setTimeout(() => {
        broadcast(socket, JSON.stringify({ status: "updating" }));
      }, 1000 * (config.gridRefreshTime - 1)); 

      let result:any = {};

      if(grid?.bias?.length > 0){
        result = generateGridService(grid.bias.shift()?.toLowerCase());    
      }else{
        result = generateGridService();
      }     
      
      if ("error" in result) {
        console.error("Failed to generate grid");
      } else if (typeof result?.html === "string") {
        grid._html = result.html;
        broadcast(socket, JSON.stringify({ 
          status: "fetching", 
          html: grid._html, 
          raw: result?.raw,
          clientsConnected: grid.clients    
        }));
      }
    }, 1000 * config.gridRefreshTime);
  };

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
            grid.clients-=1;
            //TODO: Handle disconnect of client
        });
    });    

    socket.on('error',(err)=>{
        console.log("Failed to initiate Grid Socket ::: ",err.message);  
    });
}  

export default initiateGridSocket;