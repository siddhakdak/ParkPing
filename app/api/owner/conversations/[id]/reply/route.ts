import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
import {messageSchema} from "@/lib/validation";
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{const user=await requireUser();const {id}=await params;const {message}=messageSchema.parse(await req.json());const db=createAdminClient();const {data:c}=await db.from("conversations").select("id,vehicle_id,vehicles(owner_id)").eq("id",id).single();if(!c||(c as any).vehicles.owner_id!==user.id)return NextResponse.json({error:"Forbidden"},{status:403});const {error}=await db.from("messages").insert({conversation_id:id,sender_type:"owner",message});if(error)throw error;await db.from("conversations").update({last_message_at:new Date().toISOString()}).eq("id",id);return NextResponse.json({ok:true})}
 catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="UNAUTHORIZED"?401:400})}
}