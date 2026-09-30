const SHEET_ID = '1CG8mG5IPqPINURttFxHBqIL7R0ahyD2ZQGgCbPDzV0w';
const PRODUCTS = ['black-dust-tea','pure-green-tea','black-fannings-tea','silver-tips','golden-tips'];
const HEADERS = ['id','created_at','product','rating','name','comment','status'];

function sheet_() {
  const book = SpreadsheetApp.openById(SHEET_ID);
  let sheet = book.getSheetByName('Reviews');
  if (!sheet) {
    sheet = book.insertSheet('Reviews');
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,7).setFontWeight('bold');
    sheet.setColumnWidths(1,7,150);
    sheet.setColumnWidth(6,400);
  }
  if (sheet.getRange(1,1,1,7).getValues()[0].join('|') !== HEADERS.join('|')) throw new Error('Review storage needs attention. Please contact Abija Tea.');
  return sheet;
}
function product_(product) {
  if (PRODUCTS.indexOf(product) < 0) throw new Error('Unknown product.');
  return product;
}
function reviews_(product) {
  const sheet = sheet_();
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues() : [];
  return rows.filter(r => r[2] === product && r[6] === 'published' && Number.isInteger(Number(r[3])) && Number(r[3]) >= 1 && Number(r[3]) <= 5)
    .map(r => ({rating:Number(r[3]),name:String(r[4]),comment:String(r[5]),date:new Date(r[1]).toISOString().slice(0,10)}));
}
function loadReviews(product) {
  product_(product);
  const rows = reviews_(product);
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('form:'+token, JSON.stringify({product:product,time:Date.now()}),1800);
  return {count:rows.length,average:rows.length ? rows.reduce((s,r)=>s+r.rating,0)/rows.length : null,reviews:rows.slice(-50).reverse(),token:token};
}
function submitReview(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid review.');
  const product = product_(input.product);
  const name = String(input.name || '').trim();
  const comment = String(input.comment || '').trim();
  const rating = Number(input.rating);
  if (input.website || name.length < 2 || name.length > 60 || comment.length < 10 || comment.length > 1000 || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Choose 1–5 stars, a name (2–60 characters) and a comment (10–1000 characters).');
  if (/(https?:\/\/|www\.)/i.test(name+' '+comment)) throw new Error('Please remove links from your review.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('Please try again in a moment.');
  try {
    const cache = CacheService.getScriptCache();
    const saved = cache.get('form:'+String(input.token));
    const token = saved ? JSON.parse(saved) : null;
    if (!token || token.product !== product || Date.now()-token.time < 3000) throw new Error('Please reload the reviews and try again.');
    const sheet = sheet_();
    const rows = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues() : [];
    if (rows.some(r => r[2]===product && String(r[4]).replace(/^'/,'')===name && String(r[5]).replace(/^'/,'')===comment)) throw new Error('This review has already been received.');
    if (rows.filter(r => Date.now()-new Date(r[1]).getTime() < 3600000).length >= 30) throw new Error('Reviews are busy. Please try again later.');
    // Prefix user text to prevent spreadsheet formula execution.
    sheet.appendRow([Utilities.getUuid(),new Date(),product,rating,"'"+name,"'"+comment,'published']);
    cache.remove('form:'+String(input.token));
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return loadReviews(product);
}
function doGet(e) {
  const product = product_(e && e.parameter && e.parameter.product);
  return HtmlService.createHtmlOutput(widget_(product)).setTitle('Abija Tea customer reviews')
    .addMetaTag('viewport','width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function widget_(product) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;padding:16px;color:#292c23;background:#fff;font:16px Arial,sans-serif}h2{font-size:24px;margin:0 0 12px}button,input,textarea{font:inherit}label{display:block;margin:14px 0 6px}input[type=text],textarea{width:100%;padding:12px;border:1px solid #b7b8a8;border-radius:8px}textarea{min-height:95px;resize:vertical}fieldset{border:0;padding:0;margin:16px 0}legend{margin-bottom:8px}.stars{display:flex;gap:8px}.stars label{margin:0;cursor:pointer;color:#705815;font-size:28px}.stars input{width:18px;height:18px}button{background:#705815;color:white;border:0;border-radius:8px;padding:13px 22px;cursor:pointer}button:disabled{opacity:.6}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #426331;outline-offset:3px}.small{font-size:14px;color:#5b6054;line-height:1.5}.trap{position:absolute;left:-10000px}article{border-top:1px solid #ddd;padding:16px 0;overflow-wrap:anywhere}article p{white-space:pre-wrap;line-height:1.5}#message{min-height:24px;line-height:1.5}#summary{color:#705815;font-weight:bold}form{max-width:650px;margin-bottom:28px}
  </style></head><body><h2>Customer reviews</h2><p id="summary" aria-live="polite">Loading reviews…</p>
  <form id="review"><fieldset><legend>Your rating</legend><div class="stars">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating" value="${n}" required aria-label="${n} ${n===1?'star':'stars'}">${n}★</label>`).join('')}</div></fieldset>
  <label for="name">Display name</label><input id="name" name="name" type="text" minlength="2" maxlength="60" required autocomplete="nickname">
  <label for="comment">Your experience with this tea</label><textarea id="comment" name="comment" minlength="10" maxlength="1000" required></textarea>
  <label class="trap" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  <p class="small">Your name, rating and comment will be public. Please share your own experience and do not include contact details. Reviews are not verified purchases. <a href="mailto:abijateabandara@gmail.com" target="_blank">Report a review</a>.</p>
  <button id="send" disabled>Publish review</button><p id="message" role="status"></p></form><div id="list"></div>
  <script>
  const product=${JSON.stringify(product)};let token='';const form=document.getElementById('review'),send=document.getElementById('send'),message=document.getElementById('message');
  function show(data){token=data.token;send.disabled=false;document.getElementById('summary').textContent=data.count ? '★ '+data.average.toFixed(1)+' / 5 · '+data.count+' review'+(data.count===1?'':'s') : 'No reviews yet. Be the first to share your experience.';const list=document.getElementById('list');list.replaceChildren();for(const r of data.reviews){const article=document.createElement('article'),title=document.createElement('strong'),date=document.createElement('p'),body=document.createElement('p');title.textContent='★'.repeat(r.rating)+'☆'.repeat(5-r.rating)+' — '+r.name;date.className='small';date.textContent=r.date;body.textContent=r.comment;article.append(title,date,body);list.append(article);}if(data.count>50){const note=document.createElement('p');note.textContent='Showing the latest 50 reviews. The average includes all published reviews.';list.append(note);}}
  function fail(error){message.textContent=error.message||'Could not load reviews. Please refresh and try again.';send.disabled=!token;}
  google.script.run.withSuccessHandler(show).withFailureHandler(fail).loadReviews(product);
  form.addEventListener('submit',function(event){event.preventDefault();if(!form.reportValidity())return;send.disabled=true;message.textContent='Saving your review…';const data=Object.fromEntries(new FormData(form));data.product=product;data.token=token;google.script.run.withSuccessHandler(function(result){form.reset();show(result);message.textContent='Thank you. Your review is published.';}).withFailureHandler(fail).submitReview(data);});
  </script></body></html>`;
}
