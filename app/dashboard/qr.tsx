 "use client";
import {useState} from "react";
export default function QRPanel({vehicle}:{vehicle:any}){
 const [open,setOpen]=useState(false);
 return <><button className="btn btn-light" onClick={()=>setOpen(true)}>▦ View QR</button>{open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:20,display:"grid",placeItems:"center",padding:16}}>
  <div className="card print-area" style={{padding:28,width:"min(420px,100%)",textAlign:"center"}}>
   <button className="no-print" onClick={()=>setOpen(false)} style={{float:"right",border:0,background:"transparent",fontSize:22}}>×</button>
   <div style={{fontSize:22,fontWeight:800}}>🚗 NEED TO CONTACT ME?</div><p className="muted">SCAN HERE — NO PHONE NUMBER REQUIRED</p>
   <img src={`/api/owner/vehicles/${vehicle.id}/qr`} alt="Vehicle QR code" style={{width:280,height:280,margin:"10px auto",display:"block"}}/>
   <strong>{vehicle.nickname||vehicle.model||"My vehicle"}</strong>
   <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"center"}}><a className="btn btn-dark no-print" href={`/api/owner/vehicles/${vehicle.id}/qr?download=1`}>Download</a><button className="btn btn-light no-print" onClick={()=>print()}>Print</button></div>
  </div>
 </div>}</>
}