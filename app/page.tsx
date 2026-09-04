import Link from "next/link";

const features=[
 ["🔒","Your number stays private","Visitors never receive your phone number or email."],
 ["🚨","Instant vehicle alerts","Get a push notification when someone needs you."],
 ["💬","Anonymous conversation","Reply securely without exposing personal contact details."],
 ["📲","No app for visitors","A normal phone browser is all they need."]
];

export default function Home(){
 return <main>
  <nav className="container" style={{padding:"22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
   <b style={{fontSize:23}}>Park<span style={{opacity:.42}}>Ping</span></b>
   <Link href="/auth" className="btn btn-light">Owner Login</Link>
  </nav>
  <section className="container" style={{textAlign:"center",padding:"72px 0 90px"}}>
   <div style={{fontSize:13,fontWeight:800,letterSpacing:1.2}}>PRIVACY-FIRST VEHICLE CONTACT</div>
   <h1 style={{fontSize:"clamp(45px,8vw,82px)",lineHeight:.96,letterSpacing:"-4px",maxWidth:900,margin:"18px auto 25px"}}>
    Contact any vehicle.<br/><span style={{opacity:.38}}>Without sharing your number.</span>
   </h1>
   <p className="muted" style={{fontSize:18,lineHeight:1.65,maxWidth:680,margin:"0 auto 30px"}}>
    One QR sticker lets people tell you about your car, bike or EV while your personal contact details stay private.
   </p>
   <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
    <Link href="/auth?mode=register" className="btn btn-dark">Get Your Free QR →</Link>
    <a href="#how" className="btn btn-light">How it works</a>
   </div>
  </section>
  <section id="how" className="container" style={{paddingBottom:70}}>
   <div className="card" style={{padding:28}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:26}}>
     {[
      ["🚗","1. Add your vehicle","Create your secure vehicle profile."],
      ["▦","2. Print the QR","Download a print-ready QR sticker."],
      ["📲","3. Someone scans","They choose a message with no login."],
      ["🔔","4. You get alerted","Open the conversation and reply."]
     ].map(x=><div key={x[0]}><div style={{fontSize:30}}>{x[0]}</div><h3>{x[1]}</h3><p className="muted" style={{lineHeight:1.5}}>{x[2]}</p></div>)}
    </div>
   </div>
  </section>
  <section className="container" style={{paddingBottom:100}}>
   <h2 style={{fontSize:36,letterSpacing:-1}}>Made for real-world parking.</h2>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
    {features.map(f=><div className="card" style={{padding:24}} key={f[1]}><div style={{fontSize:30}}>{f[0]}</div><h3>{f[1]}</h3><p className="muted" style={{lineHeight:1.55}}>{f[2]}</p></div>)}
   </div>
  </section>
 </main>
}