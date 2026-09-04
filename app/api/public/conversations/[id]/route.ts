import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createAdminClient} from "@/lib/supabase/admin";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const cstore=await cookies();const session=cstore.get(`pp_session_${id}`)?.value;
 if(!session)return NextResponse.json({error:"Session expired"},{status:401});
 const db=createAdminClient();const {data:c}=await db.from("conversations").select("id,status,anonymous_session_id,vehicle_id").eq("id",id).eq("anonymous_session_id",session).single();if(!c)return NextResponse.json({error:"Not found"},{status:404});
 const {data:messages}=await db.from("messages").select("id,sender_type,message,created_at,read_at").eq("conversation_id",id).order("created_at");
 return NextResponse.json({conversation:{id:c.id,status:c.status},messages:messages||[]});
}