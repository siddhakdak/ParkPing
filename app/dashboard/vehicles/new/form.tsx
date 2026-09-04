 "use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export default function VehicleForm(){
 const router=useRouter();const [form,setForm]=useState({vehicle_type:"Car",brand:"",model:"",registration_number:"",nickname:""});const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const r=await fetch("/api/owner/vehicles",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});const d=await r.json();setBusy(false);if(!r.ok)setError(d.error||"Unable to create vehicle");else router.push("/dashboard")}
 return <div className="card" style={{padding:28}}><a href="/dashboard" className="muted">← Dashboard</a><h1>Add vehicle</h1><p className="muted">Your QR token contains no phone number.</p><form onSubmit={submit} style={{display:"grid",gap:13}}>
 <select className="field" value={form.vehicle_type} onChange={e=>setForm({...form,vehicle_type:e.target.value})}>{["Car","Bike","EV","Commercial vehicle","Other"].map(x=><option key={x}>{x}</option>)}</select>
 {["brand","model","registration_number","nickname"].map(k=><input key={k} className="field" required={k==="registration_number"} placeholder={k==="registration_number"?"Registration number (e.g. RJ 27 AB 1234)":k[0].toUpperCase()+k.slice(1)} value={(form as any)[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}/>)}
 {error&&<div style={{color:"#b42318"}}>{error}</div>}<button className="btn btn-dark" disabled={busy}>{busy?"Creating…":"Create vehicle & QR →"}</button></form></div>
}