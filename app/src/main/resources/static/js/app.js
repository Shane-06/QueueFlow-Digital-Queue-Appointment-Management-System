document.addEventListener('DOMContentLoaded',()=>{
 const current=location.pathname;
 document.querySelectorAll('.nav a').forEach(link=>{if(link.pathname===current||(link.pathname==='/dashboard'&&current.endsWith('/dashboard')))link.setAttribute('aria-current','page');});
 document.querySelectorAll('.badge').forEach(b=>b.dataset.status=b.textContent.trim());
 const toggle=document.querySelector('[data-menu]'),nav=document.querySelector('.nav');
 if(toggle&&nav)toggle.addEventListener('click',()=>{const expanded=nav.classList.toggle('expanded');toggle.setAttribute('aria-expanded',String(expanded));});
 document.querySelectorAll('[data-filter]').forEach(input=>input.addEventListener('input',()=>{const term=input.value.toLowerCase();document.querySelectorAll(input.dataset.filter).forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(term));}));
});
document.addEventListener('submit',event=>{const form=event.target;if(form.dataset.confirm&&!window.confirm(form.dataset.confirm)){event.preventDefault();return;}const button=form.querySelector('button[type="submit"],button:not([type])');if(button){button.disabled=true;setTimeout(()=>button.disabled=false,5000);}});
