 "use client";
import {useEffect,useState} from "react";

const quick=[["🚗","Please move your car"],["🅿️","Your car is blocking me"],["💡","Your lights are ON"],["🚨","Your vehicle may have been damaged"],["🔑","Your window/door appears open"],["⚠️","Urgent issue"]];

export default function PublicVehicle({token}:{token:string}){
 const [vehicle,setVehicle]=useState<any>(null),[message,setMessage]=useState(""),[conversation,setConversation]=useState<any>(null),[messages,setMessages]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{fetch(`/api/public/vehicles/${token}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setVehicle(d.vehicle)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[token]);
 useEffect(()=>{if(!conversation)return;const load=()=>fetch(`/api/public/conversations/${conversation.id}`).then(r=>r.ok?r.json():null).then(d=>d&&setMessages(d.messages||[]));load();const t=setInterval(load,3000);return()=>clearInterval(t)},[conversation]);
 async function send(){if(!message.trim())return;setLoading(true);const r=await fetch("/api/public/conversations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({qrToken:token,message})});const d=await r.json();setLoading(false);if(!r.ok){setError(d.error);return}setConversation({id:d.conversationId});setMessages([{sender_type:"visitor",message:d.message,created_at:new Date().toISOString()}]);setMessage("")}
 if(error)return <main className="container" style={{maxWidth:620,padding:"55px 0"}}><div className="card" style={{padding:30,textAlign:"center"}}><div style={{fontSize:45}}>⚠️</div><h1>QR unavailable</h1><p className="muted">{error}</p></div></main>;
 if(loading&&!vehicle)return <main className="container" style={{maxWidth:620,padding:"55px 0"}}><div className="card" style={{padding:30}}>Loading vehicle…</div></main>;
 return <main className="container" style={{maxWidth:620,padding:"20px 0 60px"}}>
  <div style={{textAlign:"center",padding:"12px 0 22px"}}><b>ParkPing</b></div>
  <div className="card" style={{padding:24}}>
   <div style={{fontSize:48}}>🚗</div><h1 style={{fontSize:34,margin:"6px 0"}}>Contact Vehicle Owner</h1>
   <p className="muted">Need to tell the owner something about their vehicle?</p>
   <div style={{fontSize:14,margin:"18px 0",padding:14,background:"var(--soft)",borderRadius:15}}>
    <b>{vehicle.nickname||`${vehicle.brand||""} ${vehicle.model||""}`.trim()||"Vehicle"}</b><br/><span className="muted">{vehicle.registration_masked}</span>
   </div>
   {!conversation?<><div style={{display:"grid",gap:9}}>{quick.map(([icon,text])=><button className="btn btn-light" style={{justifyContent:"flex-start"}} key={text} onClick={()=>setMessage(text)}>{icon} {text}</button>)}</div>
    <textarea className="field" maxLength={500} rows={4} placeholder="Write a message…" value={message} onChange={e=>setMessage(e.target.value)} style={{marginTop:12,resize:"vertical"}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}><small className="muted">{message.length}/500</small><button className="btn btn-dark" disabled={!message.trim()||loading} onClick={send}>{loading?"Sending…":"SEND MESSAGE"}</button></div>
   </>:<Chat conversation={conversation} messages={messages} setMessages={setMessages}/>}
  </div>
  <p style={{textAlign:"center",fontSize:12,color:"#888",marginTop:18}}>Your contact details are not shared with the vehicle owner.</p>
 </main>
}

function Chat({conversation,messages,setMessages}:{conversation:any,messages:any[],setMessages:any}){
 const [text,setText]=useState("");
 async function reply(){if(!text.trim())return;const r=await fetch(`/api/public/conversations/${conversation.id}/message`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:text})});if(r.ok)setText("")}
 return <div><div style={{display:"grid",gap:9,maxHeight:420,overflow:"auto",padding:"5px 0 15px"}}>{messages.map((m,i)=><div key={m.id||i} style={{justifySelf:m.sender_type==="visitor"?"end":"start",maxWidth:"85%",background:m.sender_type==="visitor"?"#111":"var(--soft)",color:m.sender_type==="visitor"?"#fff":"#111",padding:"11px 14px",borderRadius:16}}><div>{m.message}</div><small style={{opacity:.6}}>{new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</small></div>)}</div><div style={{display:"flex",gap:8}}><input className="field" placeholder="Reply…" value={text} onChange={e=>setText(e.target.value)} maxLength={500}/><button className="btn btn-dark" onClick={reply}>Send</button></div><div className="muted" style={{fontSize:12,marginTop:10}}>You are Anonymous Vehicle Visitor · Conversation expires automatically.</div></div>
}