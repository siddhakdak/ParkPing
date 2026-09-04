import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
import {z} from "zod";

const schema=z.object({name:z.string().trim().min(1).max(100)});
export async function POST(req:Request){
 try{
  const user=await requireUser(); const body=schema.parse(await req.json());
  const db=createAdminClient();
  const {error}=await db.from("users").upsert({id:user.id,name:body.name,phone:user.phone||"",email:user.email||null},{onConflict:"id"});
  if(error)throw error;
  return NextResponse.json({ok:true});
 }catch(e:any){return NextResponse.json({error:e.message||"Unable to save profile"},{status:e.message==="UNAUTHORIZED"?401:400})}
}