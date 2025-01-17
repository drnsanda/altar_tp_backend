

import { createTokenFile, deleteTokenFile, generateRandomTokenKey, getServiceError, hashPassword } from '../utils';
import config from '../config';
import { ServiceError } from '../interfaces/errors';    

export const logoutUserService = async (id: string,token:string): Promise<{status:boolean}|ServiceError|null> => {    
  try{
    const document:any ={
      token: null
    }

    //Remove token from system
    await deleteTokenFile(token);   

    //TODO: Close socket connection of user    
        
    return{
      status: true
    }
    
  }catch(error:any){ 
    if(error.message==='INVALID_ID'){
      return null;
    }
    return getServiceError(error);
  } 
};

export const authUserService = async (email:string,securityAccess:string)=>{
  try{

    const user:any ={}; //TODO: GET USER BY E-MAIL FROM MOCK DATA       
 
    if(!user || (user.securityAccess != hashPassword(securityAccess))){
      throw new Error('INVALID_CREDENTIALS');
    }

    if(user.isEmailVerified != true){
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const token = {
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + (1000 * config.tokenExpirationTime),
      tokenId: generateRandomTokenKey(32),
      userId:user._id,
      name:user.name,
      email:user.email,
      isAdmin:user?.isAdmin || false,   
      lastLogin:new Date().getTime()   
    }

    if(user?.token?.expiresAt > new Date().getTime()){  
      token.createdAt=user?.token?.createdAt;     
      token.tokenId=user?.token?.tokenId;
    }  

    await createTokenFile(token);  

    return {
      document: user //TODO: Remove sensible data
    }
    
  }catch(error:any){
    if(error.message==='INVALID_CREDENTIALS'){
      return null;
    }
    if(error.message==='EMAIL_NOT_VERIFIED'){
      return -1;
    }
    return getServiceError(error);
  } 
  
}


export const generateGridService = async (bias:string): Promise<{html:string}|ServiceError> => {    
  try{  
    const GRID_LAYOUT_SIZE=10;
    const GRID_LAYOUT_TOTAL=GRID_LAYOUT_SIZE*GRID_LAYOUT_SIZE;
    let _output = "";
    const letters = [];

    const getRandomLetter = (): string => {
      let randomCode = Math.floor(Math.random() * 26) + 97;
      if(bias?.length > 0 && randomCode===bias?.charCodeAt(0)){
        while (randomCode===bias?.charCodeAt(0)){
          randomCode = Math.floor(Math.random()*26) + 97;
        }
      }
      return String.fromCharCode(randomCode);
    };

    for(let index=0;index < GRID_LAYOUT_TOTAL; index++){
      letters.push(getRandomLetter());
    }

    if(bias?.length>0){
      for(let index=0;index < 20; index++){
        let position = Math.floor(Math.random() * GRID_LAYOUT_TOTAL);
        while(letters[position]===bias){
          position = Math.floor(Math.random() * GRID_LAYOUT_TOTAL);
        }
        letters[position]=bias;
      }     
    }
    let rowBreaker = 0;
    for(let index=0;index < GRID_LAYOUT_TOTAL; index++){
      _output+=`
      ${rowBreaker===0 ? `<div style="display:inline-flex;border-bottom:1px solid #000000;${index===0 ? 'border-top:1px solid #000000;' : ''}">`: ""}
      <span 
      style='
      padding:15px 30px;
      display:inline-flex;
      justify-content:center;
      align-items:center;
      height:20px;
      width:20px;
      border-left:1px solid #000;
      ${rowBreaker+1===10 ? 'border-right:1px solid #000000;': ''}
      ${letters[index]===bias ? 'background-color:blue;' : ''}
      '
      ${letters[index]===bias ? 'class="highlight"' : ''}
      >${letters[index]}</span>`  
      
      if(rowBreaker + 1 === 10){    
        rowBreaker=0;
        _output+="</div>"
      }else{
        rowBreaker++;     
      }   
    }     

    return{
      html: `<div class='live-grid-view'>${_output}</div>`
    }   
    
  }catch(error:any){    
    return getServiceError(error);
  } 
};    