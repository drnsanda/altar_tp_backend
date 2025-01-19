import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config';
import { ServiceError } from '../interfaces/errors';

const isJsonData = (data:string):boolean=>{
    try{
        const parsed = JSON.parse(data);
        return true;
    }catch(error){
        return false;
    }
}

const openFile = (filePath:string,mode:string): Promise<number | NodeJS.ErrnoException>=>{
    return new Promise(($resolve,$reject)=>{
        fs.open(filePath,mode,(err,fd)=>{
            if(!err && fd){
                $resolve(fd);
            }else{
                $reject(err);
            }
        })
    });
}
async function checkFileExists(filePath:string):Promise<boolean> {
    try {
        const fd = await openFile(filePath,'r+');
        if(typeof fd=='number'){
            await closeFile(fd);
            return true;
        }
        return false;
    } catch (err) {        
        return false;
    }
}
const closeFile = (fd:number): Promise<string | NodeJS.ErrnoException>=>{
    return new Promise(($resolve,$reject)=>{
        fs.close(fd,(err)=>{
            if(!err){
                $resolve('');
            }else{
                $reject(err);
            }
        })
    });
}

const createFile = async (filePath:any,data:any):Promise<any>=>{
    let fd:any;
    try{
        fd = await openFile(filePath,"w+");

        const tempData= JSON.stringify(data);
        
       const result = await new Promise(($resolve,$reject)=>{
            fs.writeFile(fd,tempData,(err)=>{
                if(!err){
                    $resolve({status:"created"});
                }else{
                    $reject(err);
                }
            })
        });
        
        await closeFile(fd);

        return result;

    }catch(error){
        if(fd!==null){
            await closeFile(fd);
        }    
        console.error(error);
        throw new Error('FAILURE_CREATE_FILE');   
    }   
}
const createTokenFile = async (token:any):Promise<void>=>{
    let fd:any;
    const filePath = path.join(__dirname,"../tokens/",token.tokenId);
    try{
        fd = await openFile(filePath,"w+");

        const tempData= JSON.stringify(token);
        
        await new Promise(($resolve,$reject)=>{
            fs.writeFile(fd,tempData,(err)=>{
                if(!err){
                    $resolve('Token Created');
                }else{
                    $reject(err);
                }
            })
        });
        
        await closeFile(fd);

    }catch(error){
        if(fd!==null){
            await closeFile(fd);
        }    
        console.error(error);
        throw new Error('FAILURE_CREATE_TOKEN_FILE');   
    }   
}

const deleteFile = async (filePath:string): Promise<void>=>{
    try{
        const isFileAvailable= await checkFileExists(filePath);
        if(!isFileAvailable){
            return;
        }      
        await new Promise(($resolve,$reject)=>{
            fs.unlink(filePath,(err)=>{
                if(!err){
                    $resolve('deleted');
                }else{
                    $reject(err);
                }
            })
        })
    }catch(error){
        console.error(error);   
        console.log("FAILURE_DELETE_TOKEN_FILE");
    }
}   
const deleteTokenFile = async (token:string): Promise<void>=>{
    try{
        const filename = path.resolve(__dirname,"../tokens/",token);
        const isFileAvailable= await checkFileExists(filename);
        if(!isFileAvailable){
            return;
        }      
        await new Promise(($resolve,$reject)=>{
            fs.unlink(filename,(err)=>{
                if(!err){
                    $resolve('deleted');
                }else{
                    $reject(err);
                }
            })
        })
    }catch(error){
        console.error(error);   
        console.log("FAILURE_DELETE_TOKEN_FILE");
    }
}   

const getFile = async (filePath:string)=>{
    try{        
        const data:string = await new Promise(($resolve,$reject)=>{
            fs.readFile(filePath,'utf-8',(err: NodeJS.ErrnoException | null,data:string)=>{
                if(!err){
                    $resolve(data);
                }else{
                    $reject(null);
                }
            })
        });
        if(isJsonData(data)){
            return JSON.parse(data);
        }else{
            return null;
        }
    }catch(error){
        return null;
    }   
}
const getTokenFile = async (token:string)=>{
    const filePath = path.join(__dirname,"../tokens/",token);
    try{        
        const data:string = await new Promise(($resolve,$reject)=>{
            fs.readFile(filePath,'utf-8',(err: NodeJS.ErrnoException | null,data:string)=>{
                if(!err){
                    $resolve(data);
                }else{
                    $reject(null);
                }
            })
        });
        if(isJsonData(data)){
            return JSON.parse(data);
        }else{
            return null;
        }
    }catch(error){
        return null;
    }   
}

const generateRandomTokenKey = (length:number)=>{
return crypto.randomBytes(length).toString('hex');
}

const hashPassword = (rawPassword:string)=>{   
    const hmac =  crypto.createHmac('sha256',config.hashSecretKey);
    hmac.update(rawPassword);
    const hashedPassword = hmac.digest('hex');   

    return hashedPassword;
}  

const getServiceError = (error:any,type:string='Failed to perform service action'):ServiceError=>{
    console.error("Service Error ::: ",error);    
    return {
        type: type === '' ? 'Failed to perform service action': type,
        error
    }
}   

const sanitizeHtml = (input: any): string => {
    if (!input) return "";
    return String(input)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/&/g, "&amp;");
  };

const statusCodes = {
    OK: { code: 200, message: "OK" },
    CREATED: { code: 201, message: "Created" },
    NO_CONTENT: { code: 204, message: "No Content" },
    BAD_REQUEST: { code: 400, message: "Bad Request" },
    UNAUTHORIZED: { code: 401, message: "Unauthorized" },
    FORBIDDEN: { code: 403, message: "Forbidden" },
    NOT_FOUND: { code: 404, message: "Document or Resource was Not Found" },
    METHOD_NOT_ALLOWED: { code: 405, message: "Method Not Allowed" },
    INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
    SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
    GATEWAY_TIMEOUT: { code: 504, message: "Gateway Timeout" },
    CONFLICT: { code: 409, message: "Duplicate Entry Attempt" }   
};

export {       
    isJsonData,
    createFile,
    createTokenFile,
    deleteFile,
    deleteTokenFile,
    getFile,
    getTokenFile,
    sanitizeHtml,
    hashPassword,
    statusCodes,   
    getServiceError,
    generateRandomTokenKey        
}        