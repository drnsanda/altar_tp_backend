import {Worker} from 'worker_threads';
import path from 'path';
import config from '../../config';

const init = ()=>{

    const worker = new Worker(path.resolve(__dirname,"tasks.ts"));

    console.log('\x1b[36m::: [TOKEN_MANAGEMENT_WORKER_INITIALIZED] :::\x1b[0m');           

    setInterval(() => {
        worker.postMessage('execute');    
    },config.defaultWorkerIntervalTime * 1000);           

    worker.on('error',(err)=>{
        console.error('\x1b[31m::: [TOKEN_MANAGEMENT_WORKER_ERROR] :::\x1b[0m',err);
    });
    worker.on('exit',()=>{
        console.error('\x1b[31m::: [TOKEN_MANAGEMENT_WORKER_STOPPED] :::\x1b[0m');
    });
    worker.on('message',(message)=>{
        console.log('\x1b[35m::: [TOKEN_MANAGEMENT_WORKER_MESSAGE] :::\x1b[0m',message);
    });

};   
     
export default {
    init
}            