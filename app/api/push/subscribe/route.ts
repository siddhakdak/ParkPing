import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
import {pushSchema} from "@/lib/validation";
export async function POST(req:Request){
 try{const user=await requireUser();const body=pushSchema.parse(await req.json());const db=createAdminClient();const {error}=await db.from("push_subscriptions").upsert({user_id:user.id,...body,is_active:true},{onConflict:"user_id,endpoint"});if(error)throw error;return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}