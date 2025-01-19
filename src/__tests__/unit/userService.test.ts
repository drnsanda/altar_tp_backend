import { ServiceError } from '../../interfaces/errors';
import {logoutUserService,verifyUserTokenService} from '../../services/userService';

describe('User Service',()=>{
    it('should return true on user logout',async ()=>{
        const result: {status:boolean} | null | ServiceError = await logoutUserService("ID_TEST","2022551215");
        if(result === null){
            fail("Failed to logout user");
        }
        else if('error' in result){
            fail("Failed to logout user");
        }else{
            expect(result?.status).toEqual(true);
        }
       
    });
    it('should return false on expired or not found token',async ()=>{
        const result: boolean | ServiceError = await verifyUserTokenService("2022551215");
        if(typeof result !== "boolean"){
            fail("Failed to verify token");
        }else{
            expect(result).toEqual(false);
        }
    });
});