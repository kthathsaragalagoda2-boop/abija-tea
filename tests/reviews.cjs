const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function backend(){
  const rows=[],cache=new Map();let now=Date.now(),id=0;
  const sheet={appendRow:r=>rows.push(r),setFrozenRows(){},setColumnWidths(){},setColumnWidth(){},getLastRow:()=>rows.length,getRange:(r,c,n,w)=>({getValues:()=>rows.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+w)),setFontWeight(){}})};
  class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  const ctx=vm.createContext({Date:Clock,SpreadsheetApp:{openById:()=>({getSheetByName:()=>rows.length?sheet:null,insertSheet:()=>sheet}),flush(){}},Utilities:{getUuid:()=>String(++id)},CacheService:{getScriptCache:()=>({put:(k,v)=>cache.set(k,v),get:k=>cache.get(k),remove:k=>cache.delete(k)})},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})}});
  vm.runInContext(fs.readFileSync('scripts/reviews.gs','utf8'),ctx);
  return {ctx,rows,advance:()=>{now+=4000;}};
}
test('empty state, persistence, product isolation and actual average',()=>{
 const {ctx,rows,advance}=backend(); const first=ctx.loadReviews('pure-green-tea');assert.equal(first.count,0);assert.equal(first.average,null);advance();
 const result=ctx.submitReview({product:'pure-green-tea',rating:4,name:'Customer',comment:'My own experience with this tea.',token:first.token});assert.equal(result.average,4);assert.equal(rows.length,2);assert.equal(ctx.loadReviews('black-dust-tea').count,0);assert.equal(ctx.loadReviews('pure-green-tea').count,1);
 rows[1][6]='hidden';assert.equal(ctx.loadReviews('pure-green-tea').count,0);
});
test('rejects invalid ratings, unknown products, replay and duplicates',()=>{
 const {ctx,advance}=backend();assert.throws(()=>ctx.loadReviews('../other'));let response=ctx.loadReviews('pure-green-tea');advance();const input={product:'pure-green-tea',rating:5,name:'Customer',comment:'An authentic review comment.',token:response.token};
 assert.throws(()=>ctx.submitReview({...input,rating:6}));assert.throws(()=>ctx.submitReview({...input,rating:2.5}));assert.throws(()=>ctx.submitReview({...input,website:'spam'}));assert.throws(()=>ctx.submitReview({...input,token:'invalid'}));ctx.submitReview(input);assert.throws(()=>ctx.submitReview(input));response=ctx.loadReviews('pure-green-tea');advance();assert.throws(()=>ctx.submitReview({...input,token:response.token}));
});
test('user input cannot become sheet formulas and comments render as text',()=>{
 const {ctx,rows,advance}=backend();const data=ctx.loadReviews('pure-green-tea');advance();ctx.submitReview({product:'pure-green-tea',rating:3,name:'=1+1',comment:'<script>alert(1)</script>',token:data.token});assert.equal(rows[1][4],"'=1+1");assert.equal(rows[1][5],"'<script>alert(1)</script>");const html=ctx.widget_('pure-green-tea');assert.ok(html.includes('body.textContent=r.comment'));assert.ok(!html.includes('innerHTML'));
});
