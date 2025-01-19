import { Request, Response } from 'express';
import { generateGridService } from '../services/gridService';
import { statusCodes } from '../utils';   


export const generateGridHandler = async (req: Request, res: Response): Promise<void> => {
  //@ts-ignore
  const result = generateGridService(req?.body?.bias);     
  
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
   