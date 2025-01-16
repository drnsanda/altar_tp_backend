export interface User {
    _id: string; 
    name: string; 
    email: string; 
    phone?: string; 
    address?: {
      street: string; 
      city: string; 
      state: string; 
      postalCode: string; 
      country: string;
    };
    roles: string[]; 
    isActive: boolean; 
    createdAt: string; 
    updatedAt?: string;
    isEmailVerified?:boolean;
    lastLogin?: string; 
    securityAccess:string;   
    token?:{
        id:string,
        expiresAt:number;
    }  
  }