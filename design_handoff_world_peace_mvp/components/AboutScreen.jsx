function AboutScreen({onBack}){
return (
<div style={{flex:1,display:'flex',flexDirection:'column',padding:'28px 28px 40px',background:'var(--color-cream-50)'}}>
<button onClick={onBack} style={{alignSelf:'flex-start',border:'none',background:'transparent',color:'var(--text-tertiary)',fontFamily:'var(--font-sans)',fontSize:22,cursor:'pointer'}}>←</button>
<div style={{flex:1,display:'flex',flexDirection:'column',gap:20,marginTop:12}}>
<div style={{fontSize:24,fontWeight:800,color:'var(--text-primary)'}}>Privacy, simply</div>
<div style={{background:'var(--surface-card)',borderRadius:'var(--radius-l)',boxShadow:'var(--shadow-m)',padding:20,display:'flex',flexDirection:'column',gap:10}}>
<div style={{fontSize:'var(--text-body-m)',color:'var(--text-secondary)',lineHeight:1.5}}>No accounts. No location. No personal data, ever.</div>
<div style={{fontSize:'var(--text-body-m)',color:'var(--text-secondary)',lineHeight:1.5}}>Each session adds one anonymous count to the shared World Peace total — that's the only thing we keep.</div>
</div>
<div style={{background:'var(--surface-card)',borderRadius:'var(--radius-l)',boxShadow:'var(--shadow-m)',padding:20,display:'flex',flexDirection:'column',gap:8}}>
<div style={{fontSize:'var(--text-heading-s)',fontWeight:800,color:'var(--text-primary)'}}>About the practice</div>
<div style={{fontSize:'var(--text-body-s)',color:'var(--text-secondary)',lineHeight:1.5}}>Named for the Maharishi Effect — the studied idea that a group meditating on the same intention has a measurable collective effect. This app makes that shared field visible, one session at a time.</div>
</div>
</div>
<div style={{marginTop:'auto',textAlign:'center',fontSize:'var(--text-caption)',color:'var(--text-tertiary)'}}>v1.0 · made for a shared field of practice</div>
</div>);
}

window.AboutScreen = AboutScreen;
