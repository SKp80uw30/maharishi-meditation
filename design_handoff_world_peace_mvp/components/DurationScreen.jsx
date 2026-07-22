function DurationScreen({onStart,onBack,duration,setDuration}){
const options=[3,5,10,20];
return (
<div style={{flex:1,display:'flex',flexDirection:'column',padding:'28px 28px 40px',background:'var(--color-cream-50)'}}>
<button onClick={onBack} style={{alignSelf:'flex-start',border:'none',background:'transparent',color:'var(--text-tertiary)',fontFamily:'var(--font-sans)',fontSize:22,cursor:'pointer'}}>←</button>
<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
<div style={{fontSize:22,fontWeight:800,color:'var(--text-primary)'}}>Choose your duration</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,width:'100%'}}>
{options.map(m=>(
<button key={m} onClick={()=>setDuration(m)} style={{border:duration===m?'none':'1.5px solid var(--border-default)',background:duration===m?'var(--brand-primary)':'var(--surface-card)',color:duration===m?'#fff':'var(--text-primary)',borderRadius:'var(--radius-l)',padding:'22px 0',fontFamily:'var(--font-sans)',fontWeight:800,fontSize:20,cursor:'pointer',boxShadow:duration===m?'var(--shadow-glow-coral)':'var(--shadow-s)'}}>{m}<span style={{fontSize:12,fontWeight:600,display:'block',marginTop:4}}>minutes</span></button>
))}
<button key="open" onClick={()=>setDuration('open')} style={{gridColumn:'1 / -1',border:duration==='open'?'none':'1.5px solid var(--border-default)',background:duration==='open'?'var(--brand-primary)':'var(--surface-card)',color:duration==='open'?'#fff':'var(--text-primary)',borderRadius:'var(--radius-l)',padding:'18px 0',fontFamily:'var(--font-sans)',fontWeight:800,fontSize:18,cursor:'pointer',boxShadow:duration==='open'?'var(--shadow-glow-coral)':'var(--shadow-s)'}}>Open<span style={{fontSize:12,fontWeight:600,display:'block',marginTop:4}}>meditate as long as you like</span></button>
</div>
</div>
<button onClick={onStart} style={{border:'none',background:'var(--brand-primary)',color:'#fff',fontFamily:'var(--font-sans)',fontWeight:700,fontSize:17,padding:'16px',borderRadius:'var(--radius-pill)',boxShadow:'var(--shadow-glow-coral)',cursor:'pointer'}}>Begin meditation</button>
</div>);
}

window.DurationScreen = DurationScreen;
