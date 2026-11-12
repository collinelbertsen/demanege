const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const source=path.join(__dirname,'../dist'),ctx={window:{},crypto:crypto.webcrypto,localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){}},URL,URLSearchParams,Blob,TextEncoder};vm.createContext(ctx);
for(const f of ['data.js','stakeholders.js','plan-data.js','plan-geometry.js','studio.js','generator.js'])vm.runInContext(fs.readFileSync(path.join(source,f),'utf8'),ctx);
const P=ctx.window.MANEGE_PLAN,E=ctx.window.ManegeGenerator.engine,G=ctx.window.ManegePlanGeometry,S=ctx.window.ManegeStudio;
const png=fs.readFileSync(path.join(source,'U19-bron-origineel.png'));
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),P.sourceHash);assert.equal(png.readUInt32BE(16),4000);assert.equal(png.readUInt32BE(20),2829);assert.equal(P.nominalScale,null);assert.equal(P.contour,null);assert(P.svg.includes('id="vervallen-00-31-tot-00-39"'));assert.deepStrictEqual(Array.from(P.correction.roomIds),Array.from({length:9},(_,i)=>'00.'+(31+i)));assert.equal(P.correction.confirmedByUser,true);
const old={id:'old',name:'oude indeling',base:{builtin:true,uri:'data:image/svg+xml,old',contour:{x:4,y:4,w:42.12,h:28.03},viewBox:[0,0,54,39]},scale:1,objects:[{id:'old-room',type:'room',name:'oud',x:4,y:4,w:5,h:5}],camera:[1,2,3,4]},before=JSON.stringify(old),seed=E.automaticSeed(old,[old]);
assert.equal(seed.base.planId,P.id);assert.equal(seed.scale,null);assert.equal(seed.objects.length,0);assert.equal(JSON.stringify(old),before);
const plan=E.automaticPlan(seed,{stakeholders:['IVN','KNNV'],boosted:[]});assert(plan.ok&&!plan.noPlacement);const objects=plan.objects.filter(o=>o.generated),buildingIds=new Set(objects.filter(o=>o.type==='room').map(o=>o.generation.buildingId));assert.equal(buildingIds.size,2);
for(const o of objects){if(o.type==='room')assert(G.building(o,seed.base),JSON.stringify(o));if(o.type==='wall')assert(G.segmentInside(o,seed.base));}
const courtyard={x:15,y:19,w:5,h:1};assert.equal(G.building(courtyard,seed.base),null);assert.equal(G.segmentInside({x:20,y:16,x2:25,y2:24},seed.base),false);
// Concave L mask must reject the empty area inside its bounding box.
assert.equal(G.building({x:16,y:23,w:5,h:3},seed.base),null);
const out={...seed,id:'new',objects:plan.objects,generation:{config:plan.config},scale:plan.outputScale};assert.equal(E.check(out).geometry.length,0);S.validate({version:3,active:out.id,variants:[out]});
const moved=JSON.parse(JSON.stringify(out)),room=moved.objects.find(o=>o.type==='room');Object.assign(room,courtyard);assert(E.check(moved).geometry.some(g=>g.type.includes('plein')));
// Existing saved work is kept as an archive; a current source variant becomes active.
const migrated={...ctx,window:{MANEGE:ctx.window.MANEGE,MANEGE_PLAN:P},localStorage:{getItem:()=>JSON.stringify({version:3,active:old.id,variants:[old]}),setItem(){}}};vm.createContext(migrated);vm.runInContext(fs.readFileSync(path.join(source,'studio.js'),'utf8'),migrated);const project=migrated.window.ManegeStudio.getProject();assert.equal(project.variants.length,2);assert.deepStrictEqual(JSON.parse(JSON.stringify(project.variants[0].objects)),old.objects);assert.equal(project.variants.find(v=>v.id===project.active).base.planId,P.id);
for(const [width,height]of [[1000,450],[400,700]]){const camera=S.geometry.fitCamera(P.viewBox,width,height);assert(camera[0]<=0&&camera[1]<=0);assert(camera[0]+camera[2]>=P.viewBox[2]&&camera[1]+camera[3]>=P.viewBox[3]);}
console.log('PASS: U19 source hash and unchanged sheet coordinates; no inherited legacy scale/geometry; two separate buildings used; courtyard/L-shaped gap never built on; wall/room containment; archive migration; whole-sheet fit; editable JSON.');

assert(P.svg.includes('id="u19-correctie"')); 
const savedDesigned={...JSON.parse(JSON.stringify(out)),id:'saved-designed',name:'Bewaard ontwerp'};const originalDesigned=JSON.stringify(savedDesigned);
const reloadCtx={...ctx,window:{MANEGE:ctx.window.MANEGE,MANEGE_PLAN:P},localStorage:{getItem:()=>JSON.stringify({version:3,active:savedDesigned.id,variants:[savedDesigned]}),setItem(){}}};vm.createContext(reloadCtx);vm.runInContext(fs.readFileSync(path.join(source,'studio.js'),'utf8'),reloadCtx);const reloaded=reloadCtx.window.ManegeStudio.getProject();assert.equal(JSON.stringify(reloaded.variants.find(v=>v.id===savedDesigned.id)),originalDesigned);assert.equal(reloaded.variants.find(v=>v.id===reloaded.active).objects.length,0);assert.notEqual(reloaded.active,savedDesigned.id);
console.log('PASS: confirmed 00.31–00.39 correction mask; saved design unchanged; empty default after reload.');
