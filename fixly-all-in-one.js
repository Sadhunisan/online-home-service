const http = require('http');
const crypto = require('crypto');

const PORT = 3000;
const users = [];
const sessions = new Map();
const bookings = [];
const services = [
  { id: 1, name: 'Electrical', icon: '⚡', price: 'From INR 499' },
  { id: 2, name: 'Plumbing', icon: '🔧', price: 'From INR 399' },
  { id: 3, name: 'Cleaning', icon: '🧹', price: 'From INR 699' },
  { id: 4, name: 'AC Repair', icon: '❄', price: 'From INR 499' },
  { id: 5, name: 'Painting', icon: '🎨', price: 'From INR 1,499' },
  { id: 6, name: 'Carpentry', icon: '🪚', price: 'From INR 599' },
  { id: 7, name: 'Pest Control', icon: '🐜', price: 'From INR 799' },
  { id: 8, name: 'Appliance Repair', icon: '🔌', price: 'From INR 399' }
];
const providers = [
  { name: 'Ravi Menon', trade: 'Electrician', rating: 4.9, jobs: 1204, city: 'Chennai' },
  { name: 'Sunita Kaur', trade: 'Home Cleaning', rating: 4.8, jobs: 2031, city: 'Bengaluru' },
  { name: 'Deepak Prasad', trade: 'Plumber', rating: 4.9, jobs: 876, city: 'Coimbatore' }
];

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fixly - Home services, sorted.</title>
<style>
:root{--bg:#081321;--panel:#10243b;--line:#29415e;--text:#f5f8ff;--muted:#aabbd0;--blue:#25c8e8;--violet:#7067ff;--green:#32d39b}
*{box-sizing:border-box}body{margin:0;color:var(--text);font:16px/1.55 Arial,sans-serif;background:radial-gradient(circle at 15% 0,#26336d 0,transparent 35%),linear-gradient(145deg,var(--bg),#0b1e36);min-height:100vh}header{border-bottom:1px solid var(--line);background:#081321dd;position:sticky;top:0;z-index:2}.nav{max-width:1100px;margin:auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between}.brand{font-size:25px;font-weight:bold}.brand b{color:var(--blue)}button{border:0;border-radius:10px;padding:12px 18px;font-weight:bold;cursor:pointer;color:white;background:linear-gradient(135deg,var(--violet),var(--blue))}.ghost{background:transparent;border:1px solid var(--line)}main{max-width:1100px;margin:auto;padding:70px 24px}.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center}.eyebrow{color:var(--blue);font-weight:bold}.hero h1{font-size:clamp(42px,7vw,76px);line-height:1;margin:16px 0}.hero p{color:var(--muted);font-size:18px}.hero-card,.panel,.card{background:#ffffff0c;border:1px solid var(--line);border-radius:18px;padding:25px;box-shadow:0 20px 60px #0004}.hero-card strong{color:var(--green)}section{margin-top:90px}h2{font-size:36px;margin:0 0 10px}.muted{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.card{transition:.2s}.card:hover{transform:translateY(-4px);border-color:var(--blue)}.icon{font-size:35px}.card h3{margin:10px 0 4px}.card button{margin-top:15px;width:100%}.providers{grid-template-columns:repeat(3,1fr)}.provider strong{font-size:19px}.provider small{display:block;color:var(--blue);margin:5px 0 12px}.booking{display:grid;grid-template-columns:.8fr 1.2fr;gap:30px}.form{display:grid;grid-template-columns:1fr 1fr;gap:14px}.full{grid-column:1/-1}label{display:block;color:var(--muted);font-size:13px;margin-bottom:5px}input,select,textarea{width:100%;padding:12px;border-radius:9px;border:1px solid var(--line);background:#071525;color:white;font:inherit}textarea{resize:vertical}.form button{grid-column:1/-1}.modal{position:fixed;inset:0;background:#000b;display:none;place-items:center;padding:20px;z-index:5}.modal.open{display:grid}.dialog{width:min(450px,100%);background:#10243b;border:1px solid var(--line);border-radius:18px;padding:28px}.dialog form{display:grid;gap:13px}.dialog h2{font-size:28px}.error{color:#ff9ba9;min-height:22px}.book-item{border-top:1px solid var(--line);padding:14px 0}.status{color:var(--green);font-weight:bold}@media(max-width:800px){.hero,.booking{grid-template-columns:1fr}.grid,.providers{grid-template-columns:1fr 1fr}}@media(max-width:520px){.grid,.providers,.form{grid-template-columns:1fr}.nav{padding:14px 16px}main{padding:45px 16px}}
</style></head>
<body><header><nav class="nav"><div class="brand">Fixly<b>.</b></div><div id="nav"><button class="ghost" onclick="openAuth('login')">Log in</button></div></nav></header>
<main><section class="hero"><div><div class="eyebrow">VERIFIED PROS, REAL AVAILABILITY</div><h1>Home repairs, handled by a real pro.</h1><p>Book trusted electricians, plumbers, cleaners and more with clear pricing and local reviews.</p><button onclick="document.querySelector('#booking').scrollIntoView({behavior:'smooth'})">Book a service</button></div><div class="hero-card"><div class="muted">WORK ORDER #4471</div><h2>AC repair and gas top-up</h2><p>Provider: Raghav K.<br>Rating: <strong>4.9 / 5</strong><br>Arrives today at 3:30 PM</p><strong>INR 499</strong></div></section>
<section><h2>Choose a service</h2><p class="muted">Select a category to start your booking.</p><div class="grid" id="services"></div></section>
<section><h2>Top-rated near you</h2><div class="grid providers" id="providers"></div></section>
<section id="booking"><div class="panel booking"><div><h2>Get a pro on the way</h2><p class="muted">Choose a service, date, time and address. Your request is saved immediately.</p><p>✓ No booking fees</p><p>✓ Free rescheduling</p><p>✓ Satisfaction guarantee</p></div><form class="form" id="bookingForm"><div><label>Service</label><select id="service"></select></div><div><label>Date</label><input id="date" type="date" required></div><div><label>Time</label><input id="time" type="time" required></div><div><label>Phone</label><input id="phone" type="tel" required></div><div class="full"><label>Address</label><input id="address" required placeholder="House, street, area"></div><div class="full"><label>Describe the issue</label><textarea id="notes" rows="3" required placeholder="What needs fixing?"></textarea></div><button type="submit">Confirm booking</button></form></div></section></main>
<div class="modal" id="auth"><div class="dialog"><button class="ghost" onclick="closeModal()">Close</button><h2 id="authTitle">Log in</h2><p class="muted">Create an account or log in to book services.</p><div class="error" id="authError"></div><form id="authForm"><input id="name" placeholder="Full name" style="display:none"><input id="email" type="email" placeholder="Email" required><input id="password" type="password" placeholder="Password" required><button id="authSubmit">Log in</button></form><button class="ghost" style="margin-top:12px;width:100%" onclick="toggleAuth()" id="switchAuth">Create account</button></div></div>
<div class="modal" id="bookings"><div class="dialog"><button class="ghost" onclick="document.querySelector('#bookings').classList.remove('open')">Close</button><h2>My bookings</h2><div id="bookingList"></div></div></div>
<script>
const services=${JSON.stringify(services)}, providers=${JSON.stringify(providers)};let mode='login';
const $=id=>document.getElementById(id);function token(){return localStorage.getItem('fixly_token')}function user(){return JSON.parse(localStorage.getItem('fixly_user')||'null')}function data(key,fallback){return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}function openAuth(next){mode=next;renderAuth();$('auth').classList.add('open')}function closeModal(){$('auth').classList.remove('open')}function toggleAuth(){mode=mode==='login'?'register':'login';renderAuth()}function renderAuth(){$('authTitle').textContent=mode==='login'?'Log in':'Create account';$('name').style.display=mode==='login'?'none':'block';$('authSubmit').textContent=mode==='login'?'Log in':'Create account';$('switchAuth').textContent=mode==='login'?'Create account':'I already have an account';$('authError').textContent=''}
function renderNav(){const u=user();$('nav').innerHTML=u?'<span style="margin-right:12px">Hi, '+u.name.split(' ')[0]+'</span><button onclick="showBookings()">My bookings</button> <button class="ghost" onclick="logout()">Log out</button>':'<button class="ghost" onclick="openAuth(\\'login\\')">Log in</button>'}
function render(){ $('services').innerHTML=services.map(s=>'<div class="card"><div class="icon">'+s.icon+'</div><h3>'+s.name+'</h3><div class="muted">'+s.price+'</div><button onclick="choose('+s.id+')">Book now</button></div>').join('');$('service').innerHTML=services.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('');$('providers').innerHTML=providers.map(p=>'<div class="card provider"><strong>'+p.name+'</strong><small>'+p.trade+' · '+p.city+'</small><div>★★★★★ '+p.rating+'</div><div class="muted">'+p.jobs+' completed jobs</div></div>').join('');renderNav()}
function choose(id){$('service').value=id;$('booking').scrollIntoView({behavior:'smooth'})}function logout(){localStorage.removeItem('fixly_token');localStorage.removeItem('fixly_user');renderNav()}
$('authForm').onsubmit=e=>{e.preventDefault();const email=$('email').value.trim().toLowerCase(),password=$('password').value;let users=data('fixly_users',[]);if(mode==='register'){if(!$('name').value.trim()){return $('authError').textContent='Enter your name.'}if(users.some(u=>u.email===email)){return $('authError').textContent='Email already registered.'}const u={id:Date.now(),name:$('name').value.trim(),email,password};users.push(u);save('fixly_users',users);login(u)}else{const u=users.find(item=>item.email===email&&item.password===password);if(!u){return $('authError').textContent='Invalid email or password.'}login(u)}};
function login(u){save('fixly_user',u);localStorage.setItem('fixly_token','local-'+u.id);closeModal();renderNav();alert('You are logged in.')}
$('bookingForm').onsubmit=e=>{e.preventDefault();if(!user())return openAuth('login');const list=data('fixly_bookings',[]),s=services.find(x=>x.id==$('service').value);list.unshift({id:Date.now(),userId:user().id,service:s.name,date:$('date').value,time:$('time').value,phone:$('phone').value,address:$('address').value,notes:$('notes').value,status:'PENDING'});save('fixly_bookings',list);e.target.reset();alert('Booking confirmed.');};
function showBookings(){const list=data('fixly_bookings',[]).filter(b=>b.userId===user().id);$('bookingList').innerHTML=list.length?list.map(b=>'<div class="book-item"><b>'+b.service+'</b> <span class="status">'+b.status+'</span><br><span class="muted">'+b.date+' at '+b.time+'<br>'+b.address+'</span></div>').join(''):'<p class="muted">No bookings yet.</p>';$('bookings').classList.add('open')}
render();
</script></body></html>`;

function json(res, status, value) { res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(value)); }
function body(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', chunk => raw += chunk); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } }); }); }
function authUser(req) { const value = req.headers.authorization || ''; return sessions.get(value.replace('Bearer ', '')); }
async function api(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const path = req.url.split('?')[0];
  if (req.method === 'GET' && path === '/api/services') return json(res, 200, services);
  if (req.method === 'GET' && path === '/api/providers') return json(res, 200, providers);
  if (req.method === 'POST' && path === '/api/auth/register') { const b = await body(req); if (users.some(u => u.email === b.email)) return json(res, 409, { error: 'Email already registered' }); const u = { id: Date.now(), name: b.name, email: b.email, password: b.password, role: b.role || 'CUSTOMER' }; users.push(u); const t = crypto.randomUUID(); sessions.set(t, u); return json(res, 200, { token: t, name: u.name, role: u.role, userId: u.id }); }
  if (req.method === 'POST' && path === '/api/auth/login') { const b = await body(req); const u = users.find(x => x.email === b.email && x.password === b.password); if (!u) return json(res, 401, { error: 'Invalid email or password' }); const t = crypto.randomUUID(); sessions.set(t, u); return json(res, 200, { token: t, name: u.name, role: u.role, userId: u.id }); }
  const u = authUser(req); if (!u) return json(res, 401, { error: 'Login required' });
  if (req.method === 'POST' && path === '/api/bookings') { const b = await body(req); const s = services.find(x => x.id === Number(b.serviceCategoryId)); const item = { id: Date.now(), userId: u.id, service: s ? s.name : 'Home service', status: 'PENDING', provider: 'Not yet assigned', ...b }; bookings.push(item); return json(res, 200, item); }
  if (req.method === 'GET' && path === '/api/bookings/my') return json(res, 200, bookings.filter(b => b.userId === u.id));
  return json(res, 404, { error: 'Not found' });
}
http.createServer((req, res) => { if (req.url === '/' || req.url === '/index.html') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(page); } api(req, res).catch(error => json(res, 500, { error: error.message })); }).listen(PORT, () => console.log('Fixly all-in-one running at http://localhost:' + PORT));
