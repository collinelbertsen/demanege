const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{},crypto:require('crypto').webcrypto,localStorage:{getItem:()=>null},document:{addEventListener(){}},URL,Blob,TextEncoder,console};vm.createContext(ctx);
for(const f of ['data.js','plan-data.js','studio.js','generator.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/')+f,'utf8'),ctx);
const E=ctx.window.ManegeGenerator.engine,P=ctx.window.MANEGE_PLAN,D=ctx.window.MANEGE;
const base={id:'fixture',name:'Testbron',base:{builtin:true,contour:JSON.parse(JSON.stringify(P.contour)),viewBox:P.viewBox,uri:'data:image/svg+xml,'},camera:P.viewBox,scale:1,objects:[]};
const c=E.defaults(base);c.confirmed=true;
assert.equal(E.criteria(c).length,D.wishes.length);
const shapes=[];
for(const s of ['A','B','C']){const r=E.solve(base,c,s);assert(r.ok,JSON.stringify(r));const out={...base,objects:r.objects,generation:{config:c}};const check=E.check(out);assert.equal(check.geometry.length,0,JSON.stringify(check.geometry));assert.equal(check.disconnected.length,0);assert.equal(check.complete,0);assert.equal(check.assessments.length,39);assert.equal(r.objects.filter(o=>o.type==='wall').length===0,s==='C');shapes.push(r.objects.filter(o=>o.type==='room').map(o=>[o.x,o.y,o.w,o.h]));console.log(s,r.objects.length,'objects;',r.attempts,'candidates;',check.partial,'partial,',check.unknown,'not automatically assessable');ctx.window.ManegeStudio.validate({version:3,active:out.id,variants:[out]});}
assert.notDeepEqual(shapes[0],shapes[1]);assert.notDeepEqual(shapes[1],shapes[2]);
assert.equal(E.solve({...base,scale:null},c,'A').ok,false);
assert.equal(E.solve(base,{...c,confirmed:false},'A').ok,false);
assert.equal(E.solve(base,{...c,zone:{x:0,y:0,w:100,h:100}},'A').ok,false);
assert.equal(E.solve(base,{...c,minAreas:{zaal:5000}},'A').ok,false);
const protectedObj={id:'locked',type:'room',name:'Bestaand ontwerp',x:15,y:4,w:4,h:4,function:'opslag',user:'IVN',wishes:[]};
const rv=E.solve({...base,objects:[protectedObj]},c,'B');assert(rv.ok);assert(rv.objects.some(o=>o.id==='locked'));assert.equal(E.check({...base,objects:rv.objects,generation:{config:c}}).geometry.length,0);
const mod={...base,objects:rv.objects,generation:{config:c}};const target=mod.objects.find(o=>o.type==='room'&&o.generated&&o.generation.role==='function');target.x=-100;const before=JSON.stringify(mod);assert(E.check(mod).geometry.length>0);assert.equal(before,JSON.stringify(mod));
console.log('PASS: source ingestion, all 3 distinct strategies, geometric bounds/overlap, route adjacency, source protection, impossible minima, missing calibration, nondestructive recheck, editor format.');
