import { ServiceError } from '../../interfaces/errors';
import {generateGridService} from '../../services/gridService';

type GridServiceResult = {
    html:string,
    raw: Array<string>
}
const getRandomLetter = (): string => {
    let randomCode = Math.floor(Math.random() * 26) + 97; // 'a' to 'z'
    return String.fromCharCode(randomCode);
  };
describe('Grid Service',()=>{
    it('should receive an array of 100 positions and a html value',()=>{
        const result: GridServiceResult | ServiceError = generateGridService();
        expect(result).toHaveProperty("raw");
        expect(result).toHaveProperty("html");

        if('error' in result){
            fail("Failed to generate grid");
        }else{
            expect(typeof result?.html).toBe("string");
            expect(result?.raw).toHaveLength(100);
        }
       
    })
    it('should have 20 positions of a random bias/weighting in grid',()=>{
        const bias = getRandomLetter();
        const result: GridServiceResult | ServiceError = generateGridService(bias);

        if('error' in result){
            fail("Failed to generate grid");
        }else{
            expect(result?.raw?.filter(letter=>letter===bias)).toHaveLength(20);
        }
       
    })
})