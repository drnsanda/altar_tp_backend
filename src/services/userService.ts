

import { createTokenFile, deleteTokenFile, generateRandomTokenKey, getServiceError, getTokenFile, hashPassword } from '../utils';
import config from '../config';
import { ServiceError } from '../interfaces/errors';
import { validateUser } from '../data/users';

export const logoutUserService = async (id: string, token: string): Promise<{ status: boolean } | ServiceError | null> => {
  try {
    
    //Remove token from system
    await deleteTokenFile(token);

    //TODO: Close socket connection of user    

    return {
      status: true
    }

  } catch (error: any) {
    if (error.message === 'INVALID_ID') {
      return null;
    }
    return getServiceError(error);
  }
};

export const authUserService = async (email: string, securityAccess: string) => {
  try {

    const user: any = validateUser(email)?.user;   

    if (!user || (user.securityAccess != hashPassword(securityAccess))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (user.isEmailVerified != true) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const token = {
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + (1000 * config.tokenExpirationTime),
      tokenId: generateRandomTokenKey(32),
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user?.isAdmin || false,
      lastLogin: new Date().getTime()
    }

    if (user?.token?.expiresAt > new Date().getTime()) {
      token.createdAt = user?.token?.createdAt;
      token.tokenId = user?.token?.tokenId;
    }

    await createTokenFile(token);

    return {
      document: {
        ...user,
        securityAccess:null,
        token
      }
    }

  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return null;
    }
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      return -1;
    }
    return getServiceError(error);
  }

}

export const verifyUserTokenService = async (tokenId: string): Promise<boolean | ServiceError> => {
  try {
    const token = await getTokenFile(tokenId);
    if(!token){
      return false;
    }
    else if(token?.expiresAt < new Date().getTime()){
      return false; //USER_TOKEN_EXPIRED
    }else{
      return true; //USER_TOKEN_VALID
    }
  } catch (error) {
    return getServiceError(error);
  }
}