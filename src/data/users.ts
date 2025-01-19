type UserRole = "dev" | "client" | "admin"
interface User{
    name:string;
    createdDate:number;
    updatedDate:number;
    roles: Array<UserRole>,
    email:string;
    securityAccess:string;
    isEmailVerified:boolean;
}
const users:{[key:string]:User} =  {
    "tp_project_frontend@altar.io":{
        name:"Joshua Altar",
        createdDate: 1737294358917,
        updatedDate: 1737294375577,
        roles: ["dev"],
        email:"tp_project_frontend@altar.io",
        securityAccess:"c980423363e3f8091596eee5a50260aec66ef665f2a55174eebef87440286b70",
        isEmailVerified:true,
    },
    "admin@altar.io":{
        name:"Administrator",   
        createdDate: 1737294358917,
        updatedDate: 1737294375577,
        roles: ["admin"],
        email: "admin@altar.io",
        securityAccess:"c980423363e3f8091596eee5a50260aec66ef665f2a55174eebef87440286b70",
        isEmailVerified:true
    }
}

export const validateUser = (email:string)=>{
    const user = users?.[email];
    if(user?.email?.toLowerCase()===email?.toLowerCase()){
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