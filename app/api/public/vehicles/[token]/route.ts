import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {rateLimit} from "@/lib/rate-limit";

export async function GET(req:Request,{params}:{params:Promise<{token:string}>}){
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";if(!rateLimit(`vehicle:${ip}`,60,60_000))return NextResponse.json({error:"Too many requests"},{status:429});
 const {token}=await params;if(!/^[A-Z0-9]{12,24}$/.test(token))return NextResponse.json({error:"Not found"},{status:404});
 const db=createAdminClient();const {data,error}=await db.from("vehicles").select("id,vehicle_type,brand,model,registration_number,nickname,is_active").eq("qr_token",token).eq("is_active",true).single();
 if(error||!data)return NextResponse.json({error:"This vehicle QR is inactive or invalid."},{status:404});
 const r=data.registration_number;const masked=r.length>6?`${r.slice(0,5)} •••• ${r.slice(-4)}`:"••••";
 await db.rpc("increment_scan", {vehicle_uuid:data.id});
 return NextResponse.json({vehicle:{id:data.id,type:data.vehicle_type,brand:data.brand,model:data.model,nickname:data.nickname,registration_masked:masked}});
}