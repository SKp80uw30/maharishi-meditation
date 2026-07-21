function StatsScreen({duration,onRestart}){
return (
<div style={{flex:1,display:'flex',flexDirection:'column',padding:'32px 28px 40px',background:'var(--color-cream-50)',alignItems:'center',gap:20,textAlign:'center'}}>
<div style={{width:64,height:64,borderRadius:'var(--radius-blob)',background:'var(--gradient-sunrise)'}}/>
<div style={{fontSize:24,fontWeight:800,color:'var(--text-primary)'}}>Session complete</div>
<div style={{fontSize:'var(--text-body-m)',color:'var(--text-secondary)',maxWidth:260}}>Thank you for {duration==='open'?'your session':`your ${duration} minutes`}. Others were meditating alongside you at the same time.</div>
<div style={{width:'100%',display:'flex',flexDirection:'column',gap:12,marginTop:8}}>
<div style={{background:'var(--surface-card)',borderRadius:'var(--radius-l)',boxShadow:'var(--shadow-m)',padding:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<span style={{fontSize:'var(--text-body-s)',color:'var(--text-secondary)'}}>World Peace meditations today</span>
<span style={{fontSize:22,fontWeight:800,color:'var(--brand-primary)'}}>12,483</span>
</div>
<div style={{background:'var(--surface-card)',borderRadius:'var(--radius-l)',boxShadow:'var(--shadow-m)',padding:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<span style={{fontSize:'var(--text-body-s)',color:'var(--text-secondary)'}}>All time</span>
<span style={{fontSize:22,fontWeight:800,color:'var(--text-primary)'}}>1,204,996</span>
</div>
</div>
<button onClick={onRestart} style={{marginTop:'auto',border:'none',background:'var(--brand-primary)',color:'#fff',fontFamily:'var(--font-sans)',fontWeight:700,fontSize:17,padding:'16px',width:'100%',borderRadius:'var(--radius-pill)',boxShadow:'var(--shadow-glow-coral)',cursor:'pointer'}}>Meditate again</button>
</div>);
}

window.StatsScreen = StatsScreen;
