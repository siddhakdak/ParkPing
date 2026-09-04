import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
 try{const user=await requireUser();const {id}=await params;const db=createAdminClient();const {data:v}=await db.from("vehicles").select("is_active").eq("id",id).eq("owner_id",user.id).single();if(!v)return NextResponse.json({error:"Not found"},{status:404});const {error}=await db.from("vehicles").update({is_active:!v.is_active}).eq("id",id).eq("owner_id",user.id);if(error)throw error;return NextResponse.json({ok:true})}
 catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="UNAUTHORIZED"?401:400})}
}