function IntentionScreen({onContinue,onBack}){
return (
<div style={{flex:1,display:'flex',flexDirection:'column',padding:'28px 28px 40px',background:'var(--color-cream-50)'}}>
<button onClick={onBack} style={{alignSelf:'flex-start',border:'none',background:'transparent',color:'var(--text-tertiary)',fontFamily:'var(--font-sans)',fontSize:22,cursor:'pointer'}}>←</button>
<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,textAlign:'center'}}>
<span style={{fontSize:'var(--text-caption)',fontWeight:700,letterSpacing:'var(--tracking-wide)',textTransform:'uppercase',color:'var(--brand-primary)'}}>Today's intention</span>
<div style={{fontSize:26,fontWeight:800,color:'var(--text-primary)',lineHeight:1.3}}>What energy are you<br/>sending into the world today?</div>
<div style={{width:'100%',background:'var(--surface-card)',borderRadius:'var(--radius-l)',boxShadow:'var(--shadow-m)',padding:24,display:'flex',flexDirection:'column',gap:8}}>
<div style={{fontSize:'var(--text-heading-s)',fontWeight:800,color:'var(--text-primary)'}}>World Peace & Non-violence</div>
<div style={{fontSize:'var(--text-body-s)',color:'var(--text-secondary)'}}>Whenever you begin, you meditate alongside others doing the same, right now.</div>
</div>
</div>
<button onClick={onContinue} style={{border:'none',background:'var(--brand-primary)',color:'#fff',fontFamily:'var(--font-sans)',fontWeight:700,fontSize:17,padding:'16px',borderRadius:'var(--radius-pill)',boxShadow:'var(--shadow-glow-coral)',cursor:'pointer'}}>Begin your session</button>
</div>);
}

window.IntentionScreen = IntentionScreen;
