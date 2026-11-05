const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const ctx={window:{},crypto:require('crypto').webcrypto,localStorage:{getItem:()=>null},document:{addEventListener(){}},URL,URLSearchParams,Blob,TextEncoder};vm.createContext(ctx);
for(const f of ['data.js','stakeholders.js','plan-data.js','studio.js','generator.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),ctx);
const D=ctx.window.MANEGE,R=ctx.window.ManegeResearch,G=ctx.window.ManegeGenerator.engine,S=ctx.window.ManegeStudio;
const unchanged=JSON.stringify(D),p=new URLSearchParams;
assert.equal(D.wishes.length,39);assert.equal(R.filtered(p).length,39);assert.equal(R.ranking(D.wishes).reduce((s,g)=>s+g.mentions,0),39);
const storage=R.ranking(D.wishes).find(g=>g.id==='opslag');assert.equal(storage.orgs.length,2);assert.equal(storage.mentions,3);
assert(!R.page(p).includes('id="wish-detail"'));assert(R.page(new URLSearchParams({id:'I01'})).includes('id="wish-detail"'));
assert.equal(R.filtered(new URLSearchParams({org:'IVN'})).length,21);assert.equal(R.filtered(new URLSearchParams({type:'Harde eisen'})).length,18);
assert.equal(R.filtered(new URLSearchParams({priority:'Hoog'})).length,0);assert.equal(R.filtered(new URLSearchParams({priority:'Nog niet vastgesteld'})).length,39);
assert(R.filtered(new URLSearchParams({theme:'Opslag'})).every(w=>R.themes(w).includes('Opslag')));
assert(R.filtered(new URLSearchParams({q:'microscopen'})).some(w=>w.id==='K05'));
assert.equal(JSON.stringify(D),unchanged);
// Synthetic records exist only in this isolated test, never in the delivered database.
D.wishes.push({id:'TEST-1',org:'Testorganisatie',title:'Aanvullende opslag',detail:'TEST',type:'Eis',priority:'Hoog',theme:'Opslag',room:'opslag',group:'opslag',source:'TEST',time:'test',advice:[]});
D.wishes.push({...D.wishes.at(-1),id:'TEST-2',title:'Nogmaals opslag'});
assert(R.orgs().includes('Testorganisatie'));assert.equal(R.ranking(D.wishes).find(g=>g.id==='opslag').orgs.length,3);assert.equal(R.ranking(D.wishes).find(g=>g.id==='opslag').mentions,5);
assert(R.compare(p).includes('Testorganisatie'));assert(R.page(p).includes('Testorganisatie'));
assert.equal(R.ranking(D.wishes,new URLSearchParams({sort:'priority'}))[0].id,'opslag');
const P=ctx.window.MANEGE_PLAN,v={id:'test',name:'test',base:{builtin:true,contour:P.contour,viewBox:P.viewBox,uri:'data:image/svg+xml,'},camera:P.viewBox,scale:1,objects:[]},c=G.defaults(v);c.confirmed=true;c.stakeholders=['Testorganisatie'];
assert.equal(G.criteria(c).length,2);for(const strategy of ['A','B','C']){const result=G.solve(v,c,strategy);assert(result.ok);assert(result.objects.some(o=>o.generation?.wishIds?.includes('TEST-1')));assert.equal(G.check({...v,objects:result.objects,generation:{config:c}}).assessments.length,2);S.validate({version:3,active:v.id,variants:[{...v,objects:result.objects}]});}
assert.equal(G.solve(v,{...c,stakeholders:[]},'A').ok,false);
for(const [width,height]of [[1500,500],[500,1500],[900,900]]){const box=S.geometry.fitCamera([0,0,54,39],width,height);assert(box[0]<0&&box[1]<0);assert(box[0]+box[2]>54&&box[1]+box[3]>39);assert(Math.abs(box[2]/box[3]-width/height)<1e-9);}
console.log('PASS: all source records preserved; unique stakeholder/record counts; filters/details; future stakeholder ranking/comparison/generation/check; fit in wide/tall/square viewports.');
