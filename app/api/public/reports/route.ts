import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {createAdminClient} from "@/lib/supabase/admin";
import {reportSchema} from "@/lib/validation";
export async function POST(req:Request){
 try{const {conversationId}=await req.json();const session=(await cookies()).get(`pp_session_${conversationId}`)?.value;if(!session)return NextResponse.json({error:"Session expired"},{status:401});const {reason,description}=reportSchema.parse(await req.json());const db=createAdminClient();const {data:c}=await db.from("conversations").select("id,anonymous_session_id").eq("id",conversationId).single();if(!c||c.anonymous_session_id!==session)return NextResponse.json({error:"Forbidden"},{status:403});const {error}=await db.from("reports").insert({conversation_id:conversationId,reporter_type:"visitor",reason,description});if(error)throw error;return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}