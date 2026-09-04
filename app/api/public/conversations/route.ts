import {NextResponse} from "next/server";
import {randomUUID} from "crypto";
import {cookies} from "next/headers";
import {createAdminClient} from "@/lib/supabase/admin";
import {messageSchema} from "@/lib/validation";
import {rateLimit} from "@/lib/rate-limit";
import {sendOwnerPush} from "@/lib/push";

const QUICK=["Please move your car","Your car is blocking me","Your lights are ON","Your vehicle may have been damaged","Your window/door appears open","Urgent issue"];

export async function POST(req:Request){
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";if(!rateLimit(`message:${ip}`,8,60_000))return NextResponse.json({error:"Please wait before sending another message."},{status:429});
 try{
  const body=await req.json();const token=String(body.qrToken||"");const parsed=messageSchema.parse({message:body.message});
  const db=createAdminClient();const {data:v}=await db.from("vehicles").select("id,owner_id,is_active").eq("qr_token",token).single();if(!v||!v.is_active)return NextResponse.json({error:"Vehicle unavailable"},{status:404});
  const sessionId=randomUUID();const {data:c,error}=await db.from("conversations").insert({vehicle_id:v.id,anonymous_session_id:sessionId,status:"active"}).select("id").single();if(error)throw error;
  const {error:me}=await db.from("messages").insert({conversation_id:c.id,sender_type:"visitor",message:parsed.message});if(me)throw me;
  await db.rpc("increment_message_count",{vehicle_uuid:v.id});
  await db.from("notifications").insert({user_id:v.owner_id,conversation_id:c.id,type:"vehicle_message",title:"🚨 Vehicle Alert",body:parsed.message,sent_at:new Date().toISOString()});
  await sendOwnerPush(v.owner_id,{title:"🚨 Vehicle Alert",body:parsed.message,url:`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`});
  const cookieStore=await cookies();cookieStore.set(`pp_session_${c.id}`,sessionId,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:60*60*24*2,path:"/"});
  return NextResponse.json({conversationId:c.id,visitorName:"Anonymous Vehicle Visitor",message:parsed.message});
 }catch(e:any){return NextResponse.json({error:e.message||"Unable to send"},{status:400})}
}