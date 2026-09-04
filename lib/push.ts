import webpush from "web-push";
import {createAdminClient} from "@/lib/supabase/admin";

export async function sendOwnerPush(userId:string,payload:{title:string;body:string;url:string}){
 if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY||!process.env.VAPID_SUBJECT)return;
 webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
 const db=createAdminClient();
 const {data:subs}=await db.from("push_subscriptions").select("id,endpoint,p256dh,auth").eq("user_id",userId).eq("is_active",true);
 for(const sub of subs||[]){
  try{
   await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify(payload));
  }catch(err:any){
   if(err?.statusCode===404||err?.statusCode===410) await db.from("push_subscriptions").update({is_active:false}).eq("id",sub.id);
  }
 }
}