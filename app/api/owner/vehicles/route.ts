import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
import {createQrToken} from "@/lib/qr";
import {vehicleSchema} from "@/lib/validation";

export async function GET(){
 try{const user=await requireUser();const db=createAdminClient();const {data,error}=await db.from("vehicles").select("*").eq("owner_id",user.id).order("created_at",{ascending:false});if(error)throw error;return NextResponse.json(data)}
 catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="UNAUTHORIZED"?401:500})}
}
export async function POST(req:Request){
 try{
  const user=await requireUser();const body=vehicleSchema.parse(await req.json());const db=createAdminClient();
  let token="";for(let i=0;i<5;i++){token=createQrToken();const {data}=await db.from("vehicles").select("id").eq("qr_token",token).maybeSingle();if(!data)break}
  const {data,error}=await db.from("vehicles").insert({...body,owner_id:user.id,qr_token:token.toUpperCase()}).select("id,qr_token").single();
  if(error)throw error;return NextResponse.json(data,{status:201});
 }catch(e:any){return NextResponse.json({error:e.message||"Invalid request"},{status:e.message==="UNAUTHORIZED"?401:400})}
}