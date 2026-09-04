 "use client";
import {useState} from "react";
export default function PushSetup(){
 const [status,setStatus]=useState("");
 async function enable(){
  try{
   if(!("Notification" in window)||!("serviceWorker" in navigator)||!("PushManager" in window)){setStatus("Push notifications are not supported here.");return}
   const permission=await Notification.requestPermission();if(permission!=="granted"){setStatus("Notifications are blocked. Enable them in browser settings.");return}
   const reg=await navigator.serviceWorker.register("/sw.js");
   const key=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
   if(!key){setStatus("Push is not configured yet.");return}
   const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(key) as any});
   const j=sub.toJSON();await fetch("/api/push/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({endpoint:j.endpoint,p256dh:j.keys?.p256dh,auth:j.keys?.auth})});
   setStatus("Push alerts enabled.");
  }catch{setStatus("Could not enable notifications.")}
 }
 return <div><button className="btn btn-light" onClick={enable}>🔔 Enable alerts</button>{status&&<div className="muted" style={{fontSize:12,marginTop:6}}>{status}</div>}</div>
}
function urlBase64ToUint8Array(base64String:string){const padding="=".repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");const raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
