function LaunchScreen({onBegin}){
return (
<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',background:'var(--color-cream-50)',overflow:'hidden',padding:32}}>
<div style={{position:'absolute',inset:0,background:'var(--gradient-glow)'}}/>
<div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:28,textAlign:'center'}}>
<div style={{width:120,height:120,borderRadius:'var(--radius-blob)',background:'var(--gradient-sunrise)',boxShadow:'var(--shadow-glow-coral)'}}/>
<div>
<div style={{fontSize:28,fontWeight:800,color:'var(--text-primary)',letterSpacing:'var(--tracking-tight)'}}>Maharishi Meditation</div>
<div style={{fontSize:'var(--text-body-m)',color:'var(--text-secondary)',marginTop:8,maxWidth:260}}>A shared meditation for World Peace.</div>
</div>
<button onClick={onBegin} style={{border:'none',background:'var(--brand-primary)',color:'#fff',fontFamily:'var(--font-sans)',fontWeight:700,fontSize:17,padding:'16px 40px',borderRadius:'var(--radius-pill)',boxShadow:'var(--shadow-glow-coral)',cursor:'pointer'}}>Begin</button>
</div>
</div>);
}

window.LaunchScreen = LaunchScreen;
