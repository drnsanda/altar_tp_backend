type UserRole = "dev" | "client" | "admin"
interface User{
    name:string;
    createdDate:number;
    updatedDate:number;
    roles: Array<UserRole>,
    email:string;
    securityAccess:string;
}
const users:{[key:string]:User} =  {
    "tp_project_frontend@altar.io":{
        name:"Joshua Altar",
        createdDate: 1737294358917,
        updatedDate: 1737294375577,
        roles: ["dev"],
        email:"tp_project_frontend@altar.io",
        securityAccess:""
    },
    "admin@altar.io":{
        name:"Administrator",
        createdDate: 1737294358917,
        updatedDate: 1737294375577,
        roles: ["admin"],
        email: "admin@altar.io",
        securityAccess:""
    }
}

export const validateUser = (email:string,securityAccess:string)=>{
    const user= users?.[email];
    if(user.email.toLowerCase()===email.toLowerCase() && user?.securityAccess===securityAccess){
        return {
            status:true,
            user
        }
    }else{
        return {
            status:false
        }
    }
}