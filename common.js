(()=>{
const q=s=>document.querySelector(s),toggle=q('.menu-toggle'),nav=q('.primary-nav');
const close=()=>{nav?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.querySelector('.sr-only').textContent='Open navigation';};
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('.sr-only').textContent=open?'Close navigation':'Open navigation';});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('is-open')){close();toggle.focus();}});
if(q('#year'))q('#year').textContent=new Date().getFullYear();
const revealHash=()=>{const node=document.getElementById(location.hash.slice(1));if(node?.tagName==='DETAILS')node.open=true;};revealHash();window.addEventListener('hashchange',revealHash);
const sticky=q('.mobile-book');const seen=new Map();
const sync=()=>{const keyboard=window.visualViewport&&window.visualViewport.height<window.innerHeight*.75;sticky?.classList.toggle('is-hidden',[...seen.values()].some(Boolean)||Boolean(keyboard));};
if(window.IntersectionObserver){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>seen.set(e.target,e.isIntersecting));sync();});['#booking','.hero-actions'].forEach(s=>{const n=q(s);if(n)observer.observe(n);});}
window.visualViewport?.addEventListener('resize',sync);window.addEventListener('resize',()=>{if(window.innerWidth>1100)close();});
})();