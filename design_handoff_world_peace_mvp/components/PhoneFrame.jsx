function PhoneFrame({children}){
return React.createElement('div',{style:{width:390,height:780,borderRadius:44,background:'var(--surface-page)',boxShadow:'var(--shadow-l)',overflow:'hidden',position:'relative',display:'flex',flexDirection:'column',fontFamily:'var(--font-sans)'}},children);
}

window.PhoneFrame = PhoneFrame;
