import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 try{const user=await requireUser();const {id}=await params;const db=createAdminClient();const {data:c}=await db.from("conversations").select("id,vehicles(owner_id)").eq("id",id).single();if(!c||(c as any).vehicles.owner_id!==user.id)return NextResponse.json({error:"Forbidden"},{status:403});await db.from("conversations").update({status:"resolved"}).eq("id",id);return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}