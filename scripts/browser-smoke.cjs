// Optional local browser acceptance check. Install playwright under .tools/browser first.
const {chromium}=require('../.tools/browser/node_modules/playwright');
const fs=require('fs');const path=require('path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const password=fs.readFileSync(path.join(__dirname,'../.local/demo-password'),'utf8');
 const errors=[];
 try{
  if(process.argv.includes('--verify-persistence')){
   const proof=JSON.parse(fs.readFileSync(path.join(__dirname,'../.local/browser-proof.json'),'utf8'));const page=await browser.newPage();await page.goto('http://localhost:8080/login');await page.locator('[name=username]').fill('student@queueflow.local');await page.locator('[name=password]').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/student/dashboard');await page.goto('http://localhost:8080/student/appointments');if(!(await page.locator('main').innerText()).includes(proof.reference))throw Error('Booking did not survive restart');console.log('PASS: browser-created booking survives Java application restart.');return;
  }
  for(const role of ['student','staff','admin']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());console.log('Checking '+role);
   await page.goto('http://localhost:8080/login');await page.locator('[name=username]').fill(role+'@queueflow.local');await page.locator('[name=password]').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/'+role+'/dashboard');
   const routes={student:['services','appointments','queue','history','notifications','profile'],staff:['queue','appointments','history'],admin:['services','counters','staff','schedules','appointments','queue','reports','audit']}[role];
   for(const route of routes){const response=await page.goto('http://localhost:8080/'+role+'/'+route);if(response.status()!==200)throw Error(role+'/'+route+' returned '+response.status());if(!(await page.locator('h1').count()))throw Error('Missing page title: '+route);}
   if(role==='student'){
    await page.goto('http://localhost:8080/student/services');await page.getByRole('link',{name:'Book appointment',exact:true}).first().click();
    const date=new Date();date.setDate(date.getDate()+2);while([0,6].includes(date.getDay()))date.setDate(date.getDate()+1);const iso=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
    await page.locator('[name=date]').fill(iso);await page.getByRole('button',{name:'Show slots',exact:true}).click();await page.getByRole('button',{name:'Confirm slot',exact:true}).first().click();await page.waitForLoadState('networkidle');if(!page.url().endsWith('/student/appointments'))throw Error('Booking failed: '+await page.locator('main').innerText());
    const reference=(await page.locator('main').innerText()).match(/APT-[a-f0-9-]+/);if(!reference)throw Error('Booking confirmation not visible');fs.writeFileSync(path.join(__dirname,'../.local/browser-proof.json'),JSON.stringify({reference:reference[0],date:iso}));
   }
   await page.goto('http://localhost:8080/'+role+'/dashboard');await page.screenshot({path:path.join(__dirname,'../.local/'+role+'-desktop.png'),fullPage:true});
   await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(__dirname,'../.local/'+role+'-mobile.png'),fullPage:true});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error(role+' dashboard overflows mobile viewport');
   await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/login?logout');await context.close();
  }
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: three real logins, all role routes, desktop/mobile screenshots, no dashboard overflow, logout, no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
