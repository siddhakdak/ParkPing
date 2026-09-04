import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createAdminClient} from "@/lib/supabase/admin";
import {messageSchema} from "@/lib/validation";
import {rateLimit} from "@/lib/rate-limit";
import {sendOwnerPush} from "@/lib/push";
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";if(!rateLimit(`reply:${ip}`,15,60_000))return NextResponse.json({error:"Please slow down."},{status:429});
 const {id}=await params;const session=(await cookies()).get(`pp_session_${id}`)?.value;if(!session)return NextResponse.json({error:"Session expired"},{status:401});
 try{const {message}=messageSchema.parse(await req.json());const db=createAdminClient();const {data:c}=await db.from("conversations").select("id,anonymous_session_id,vehicle_id,vehicles(owner_id)").eq("id",id).single();if(!c||c.anonymous_session_id!==session)return NextResponse.json({error:"Forbidden"},{status:403});
  const {error}=await db.from("messages").insert({conversation_id:id,sender_type:"visitor",message});if(error)throw error;
  const ownerId=(c as any).vehicles.owner_id;await db.from("notifications").insert({user_id:ownerId,conversation_id:id,type:"vehicle_message",title:"New vehicle message",body:message,sent_at:new Date().toISOString()});await sendOwnerPush(ownerId,{title:"New vehicle message",body:message,url:`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`});
  return NextResponse.json({ok:true});
 }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}