import {randomBytes} from "crypto";

export function createQrToken(){
 return randomBytes(18).toString("base64url").replace(/[-_]/g,"").slice(0,22);
}
export function vehicleUrl(token:string){
 return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/v/${token}`;
}