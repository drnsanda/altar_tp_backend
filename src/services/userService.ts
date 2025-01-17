

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


export const generateGridService = (bias?: string): { html: string } | ServiceError => {
  try {
    const GRID_LAYOUT_SIZE = 10;
    const GRID_LAYOUT_TOTAL = GRID_LAYOUT_SIZE * GRID_LAYOUT_SIZE;

    // Generate a random letter, avoiding bias if provided
    const getRandomLetter = (): string => {
      let randomCode = Math.floor(Math.random() * 26) + 97; // 'a' to 'z'
      const biasCode = bias?.charCodeAt(0);

      while (bias && randomCode === biasCode) {
        randomCode = Math.floor(Math.random() * 26) + 97;
      }
      return String.fromCharCode(randomCode);
    };

    // Generate the initial grid of letters
    const letters = Array.from({ length: GRID_LAYOUT_TOTAL }, getRandomLetter);

    // Randomly replace letters with the bias letter (up to 20 times)
    if (bias) {
      const biasPositions = new Set<number>();
      const maxBiasCount = 20;

      while (biasPositions.size < maxBiasCount) {
        const position = Math.floor(Math.random() * GRID_LAYOUT_TOTAL);
        if (letters[position] !== bias) {
          biasPositions.add(position);
          letters[position] = bias;
        }
      }
    }

    // Generate the HTML grid
    const rows = [];
    for (let row = 0; row < GRID_LAYOUT_SIZE; row++) {
      const cells = [];
      for (let col = 0; col < GRID_LAYOUT_SIZE; col++) {
        const index = row * GRID_LAYOUT_SIZE + col;
        const isBias = letters[index] === bias;

        cells.push(`
          <span 
            style="
              padding: 15px 30px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
              height: 20px;
              width: 20px;
              border-left: 1px solid #000;
              ${col === GRID_LAYOUT_SIZE - 1 ? 'border-right: 1px solid #000;' : ''}
              ${isBias ? 'background-color: blue;' : ''}
            "
            ${isBias ? 'class="highlight"' : ''}
          >
            ${letters[index]}
          </span>
        `);
      }

      rows.push(`
        <div style="display: inline-flex; border-bottom: 1px solid #000; ${row === 0 ? 'border-top: 1px solid #000;' : ''}">
          ${cells.join('')}
        </div>
      `);
    }

    return {
      html: `<div class="live-grid-view">${rows.join('')}</div>`,
    };
  } catch (error: any) {
    return getServiceError(error);
  }
};
