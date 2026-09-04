import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
import Link from "next/link";
import DashboardClient from "./ui";

export const dynamic="force-dynamic";

export default async function Dashboard(){
 const user=await requireUser(); const db=createAdminClient();
 await db.from("users").upsert({id:user.id,name:user.user_metadata?.name||"Owner",phone:user.phone||"",email:user.email||null},{onConflict:"id"});
 const {data:vehicles}=await db.from("vehicles").select("id,vehicle_type,brand,model,registration_number,nickname,qr_token,is_active,scan_count,message_count,last_activity_at").eq("owner_id",user.id).order("created_at",{ascending:false});
 const {data:conversations}=await db.from("conversations").select("id,vehicle_id,status,last_message_at,messages(id,sender_type,message,created_at)").in("vehicle_id",(vehicles||[]).map(v=>v.id)).order("last_message_at",{ascending:false}).limit(20);
 return <DashboardClient vehicles={vehicles||[]} conversations={conversations||[]}/>;
}