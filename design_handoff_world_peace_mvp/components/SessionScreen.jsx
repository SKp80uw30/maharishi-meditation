function SessionScreen({duration,onFinish,onEndEarly,soundOn,onToggleSound}){
const isOpen=duration==='open';
const [secondsLeft,setSecondsLeft]=React.useState(isOpen?0:duration*60);
const total=isOpen?0:duration*60;
React.useEffect(()=>{
if(isOpen){
const t=setTimeout(()=>setSecondsLeft(s=>s+1),1000);
return ()=>clearTimeout(t);
}
if(secondsLeft<=0){onFinish();return;}
const t=setTimeout(()=>setSecondsLeft(s=>s-1),1000);
return ()=>clearTimeout(t);
},[secondsLeft,isOpen]);
const mm=String(Math.floor(secondsLeft/60)).padStart(2,'0');
const ss=String(secondsLeft%60).padStart(2,'0');
const pct=isOpen?0:1-secondsLeft/total;
return (
<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',background:'var(--color-ink-900)',overflow:'hidden',gap:32}}>
<div style={{position:'absolute',inset:0,background:'var(--gradient-dusk-glow)'}}/>
<button onClick={onToggleSound} style={{position:'absolute',top:24,right:24,border:'1.5px solid rgba(255,255,255,0.25)',background:soundOn?'rgba(255,255,255,0.14)':'transparent',color:'var(--color-cream-100)',borderRadius:'var(--radius-pill)',padding:'8px 16px',fontFamily:'var(--font-sans)',fontSize:13,cursor:'pointer'}}>{soundOn?'Sound on':'Sound off'}</button>
<div style={{position:'relative',width:220,height:220,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:isOpen?'rgba(255,255,255,0.12)':`conic-gradient(var(--color-coral-400) ${pct*360}deg,rgba(255,255,255,0.12) 0)`}}>
<div style={{width:188,height:188,borderRadius:'50%',background:'var(--color-ink-900)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
<span style={{fontSize:38,fontWeight:800,color:'#fff'}}>{mm}:{ss}</span>
<span style={{fontSize:12,color:'var(--color-ink-300)',marginTop:4,letterSpacing:'var(--tracking-wide)',textTransform:'uppercase'}}>{isOpen?'Open session':'World Peace'}</span>
</div>
</div>
<div style={{position:'relative',color:'var(--color-cream-100)',fontSize:'var(--text-body-m)',textAlign:'center',maxWidth:260}}>Breathe gently. Others are meditating alongside you right now.{soundOn?' A gentle ambient tone plays as you go.':''}</div>
<button onClick={onEndEarly} style={{position:'relative',border:'1.5px solid rgba(255,255,255,0.25)',background:'transparent',color:'var(--color-cream-100)',borderRadius:'var(--radius-pill)',padding:'10px 24px',fontFamily:'var(--font-sans)',cursor:'pointer'}}>{isOpen?'End session':'End early'}</button>
</div>);
}

window.SessionScreen = SessionScreen;
