import { NextFunction, Request, Response } from 'express';
import { authUserService, generateGridService, logoutUserService } from '../services/userService';
import { getTokenFile, statusCodes } from '../utils';   

   
export const logoutUserHandler = async (req: Request, res: Response): Promise<void> => {
  //@ts-ignore
  const result = await logoutUserService(req.params.id, req?.headers?.token);     
  
  if (result === null) {
    //Not Found
    res.status(statusCodes.NOT_FOUND.code).json({
      statusCode: statusCodes.NOT_FOUND.code,
      message: statusCodes.NOT_FOUND.message
    })
  } else if ('error' in result) {
    //Service Error
    res.status(statusCodes.SERVICE_UNAVAILABLE.code).json({
      statusCode: statusCodes.SERVICE_UNAVAILABLE.code,
      message: statusCodes.SERVICE_UNAVAILABLE.message,
      error: result
    })
  } else {   
    //Document Was Updated
    res.status(statusCodes.OK.code).json({
      statusCode: statusCodes.OK.code,
      message: statusCodes.OK.message,
      data: {loggedOut:result?.status}
    })
  }   
};    


export const authUserHandler = async (req:Request,res:Response)=>{
  const result = await authUserService(req?.body?.email,req?.body?.securityAccess);

  if(result===-1){
    //Email not Verified
    res.status(statusCodes.FORBIDDEN.code).json({
      statusCode: statusCodes.FORBIDDEN.code,
      message: "Please verify your e-mail before proceeding",
      progCode: "EMAIL_NOT_VERIFIED"    
    })
  }
  else if (result === null) {
    //Invalid Credentials
    res.status(statusCodes.FORBIDDEN.code).json({
      statusCode: statusCodes.FORBIDDEN.code,
      message: statusCodes.FORBIDDEN.message
    })
  } else if ('error' in result) {
    //Service Error
    res.status(statusCodes.SERVICE_UNAVAILABLE.code).json({
      statusCode: statusCodes.SERVICE_UNAVAILABLE.code,
      message: statusCodes.SERVICE_UNAVAILABLE.message,
      error: result
    })
  } else {   
    //User Authenticated
    res.status(statusCodes.OK.code).json({
      statusCode: statusCodes.OK.code,
      message: statusCodes.OK.message,
      data: result?.document
    })
  }
};     
   

export const verifyTokenUserMiddleware = async (req: Request, res: Response, next: NextFunction)=>{      
  //Skip Authentication For New Users  
  try{
    const tokenId:any=req.headers.token;   
    const token = await getTokenFile(tokenId||'');
    const currentTime = new Date().getTime();

    if(token && token?.tokenId===tokenId && currentTime < token?.expiresAt){
        //@ts-ignore
        req.__token__ = token;  
        next();
        return;
    }
    else if(token && token?.tokenId===tokenId && currentTime > token?.expiresAt){
      res.status(statusCodes.UNAUTHORIZED.code).json({
        statusCode: statusCodes.UNAUTHORIZED.code,
        message: "User is not authenticated. Token has expired! Please login again to continue..."
      })
    }   
    else{
      res.status(statusCodes.UNAUTHORIZED.code).json({
        statusCode: statusCodes.UNAUTHORIZED.code,
        message: statusCodes.UNAUTHORIZED.message
      })
    }   
  }catch(error){
    res.status(statusCodes.SERVICE_UNAVAILABLE.code).json({
      statusCode: statusCodes.SERVICE_UNAVAILABLE.code,
      message: statusCodes.SERVICE_UNAVAILABLE.message
    })
  }

}   

export const generateGridHandler = async (req: Request, res: Response): Promise<void> => {
  //@ts-ignore
  const result = await generateGridService(req?.body?.bias);     
  
  if ('error' in result) {
    //Service Error
    res.status(statusCodes.SERVICE_UNAVAILABLE.code).json({
      statusCode: statusCodes.SERVICE_UNAVAILABLE.code,
      message: statusCodes.SERVICE_UNAVAILABLE.message,
      error: result
    })
  } else {   
    //Document
    res.status(statusCodes.OK.code).json({
      statusCode: statusCodes.OK.code,
      message: statusCodes.OK.message,
      data: result?.html
    })
  }   
};  
   