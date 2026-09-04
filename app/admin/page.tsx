import {requireUser} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
export const dynamic="force-dynamic";
export default async function Admin(){
 const user=await requireUser();const db=createAdminClient();const {data:p}=await db.from("users").select("is_admin").eq("id",user.id).single();if(!p?.is_admin)return <main className="container" style={{padding:"70px 0"}}><h1>403</h1><p>Admin access required.</p></main>;
 const [u,v,c,m,r]=await Promise.all([db.from("users").select("id",{count:"exact",head:true}),db.from("vehicles").select("id",{count:"exact",head:true}),db.from("conversations").select("id",{count:"exact",head:true}),db.from("messages").select("id",{count:"exact",head:true}),db.from("reports").select("id",{count:"exact",head:true})]);
 const stats=[["Users",u.count||0],["Vehicles",v.count||0],["Conversations",c.count||0],["Messages",m.count||0],["Reports",r.count||0]];
 return <main className="container" style={{padding:"45px 0"}}><h1>Admin overview</h1><p className="muted">ParkPing operations</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:15}}>{stats.map(([a,b])=><div className="card" style={{padding:22}} key={a as string}><div className="muted">{a}</div><strong style={{fontSize:34}}>{b}</strong></div>)}</div></main>
}