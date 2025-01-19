

interface EnvironmentProfile{
    environment: "staging" | "production"
    port:number;
    hashSecretKey:string;
    tokenExpirationTime:number;
    gridRefreshTime:number;
    paymentsRefreshTime:number;
    defaultWorkerIntervalTime:number;
    baseFrontendUrl:string;
    gridSocketPort:number;

}
const handleToNumberConversion = (_input:any,_default:number) => {
    const _number = parseInt(_input);
    return isNaN(_number) ? _default : _number;
}

if (process.env.TP_NODE_ENV !== "production") {
    require("dotenv").config();
}

const environments:{[key:string] : EnvironmentProfile} = {

    staging: {
        environment: 'staging',
        port: handleToNumberConversion(process.env.PORT,3200),
        gridSocketPort: handleToNumberConversion(process.env.TP_GRID_SOCKET_PORT,3210),    
        hashSecretKey: process.env.TP_HASH_SECRET_KEY || "checkers",
        tokenExpirationTime: handleToNumberConversion(process.env.TP_TOKEN_EXPIRATION_TIME,15),
        gridRefreshTime: handleToNumberConversion(process.env.TP_GRID_REFRESH_TIME,2),
        paymentsRefreshTime: handleToNumberConversion(process.env.TP_PAYMENTS_REFRESH_TIME,2),
        defaultWorkerIntervalTime: handleToNumberConversion(process.env.TP_DEFAULT_WORKER_INTERVAL_TIME,900),
        baseFrontendUrl:process.env.TP_BASE_FRONTEND_URL || "http://localhost:3000/"   
    },
    production:{
        environment:'production',
        port: handleToNumberConversion(process.env.PORT,5000),
        gridSocketPort: handleToNumberConversion(process.env.TP_GRID_SOCKET_PORT,5010),        
        hashSecretKey: process.env.TP_HASH_SECRET_KEY || "checkers",
        tokenExpirationTime: handleToNumberConversion(process.env.TP_TOKEN_EXPIRATION_TIME,15),
        gridRefreshTime: handleToNumberConversion(process.env.TP_GRID_REFRESH_TIME,2),
        paymentsRefreshTime: handleToNumberConversion(process.env.TP_PAYMENTS_REFRESH_TIME,2),
        defaultWorkerIntervalTime: handleToNumberConversion(process.env.TP_DEFAULT_WORKER_INTERVAL_TIME,900),
        baseFrontendUrl:process.env.TP_BASE_FRONTEND_URL || "https://www.altar.io/live-grid"     
    }          
     
}

const config: EnvironmentProfile = environments?.[process.env.TP_NODE_ENV || ""] || environments?.["staging"];

   
export default config;           