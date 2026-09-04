import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
export async function GET(){
 try{const user=await requireUser();const db=createAdminClient();const {data:p}=await db.from("users").select("is_admin").eq("id",user.id).single();if(!p?.is_admin)return NextResponse.json({error:"Forbidden"},{status:403});
  const [u,v,c,m,r]=await Promise.all([
   db.from("users").select("id",{count:"exact",head:true}),db.from("vehicles").select("id,is_active",{count:"exact",head:true}),db.from("conversations").select("id",{count:"exact",head:true}),db.from("messages").select("id",{count:"exact",head:true}),db.from("reports").select("id",{count:"exact",head:true})
  ]);
  return NextResponse.json({users:u.count||0,vehicles:v.count||0,conversations:c.count||0,messages:m.count||0,reports:r.count||0});
 }catch(e:any){return NextResponse.json({error:e.message},{status:400})}
}