/* Image-space masks only. These do not redraw or alter the source image. */
(()=>{'use strict';const EPS=1e-7;
const clip=(r,b)=>{const x=Math.max(r.x,b.x),y=Math.max(r.y,b.y),w=Math.min(r.x+r.w,b.x+b.w)-x,h=Math.min(r.y+r.h,b.y+b.h)-y;return w>0&&h>0?{x,y,w,h}:null;};
const parts=base=>base.buildings?.flatMap(b=>b.parts)||[base.contour].filter(Boolean);
const point=(p,rs)=>rs.some(r=>p.x>=r.x-EPS&&p.y>=r.y-EPS&&p.x<=r.x+r.w+EPS&&p.y<=r.y+r.h+EPS);
function rectInside(r,rs){if(r.w===0&&r.h===0)return point(r,rs);const area=r.w*r.h;if(area<=0)return false;const covered=rs.reduce((n,b)=>{const q=clip(r,b);return n+(q?q.w*q.h:0);},0);return Math.abs(covered-area)<EPS*Math.max(1,area);}
const building=(r,base)=>base.buildings?.find(b=>rectInside(r,b.parts))?.id||(!base.buildings&&base.contour&&rectInside(r,[base.contour])?'legacy':null);
function segmentInside(o,base){const groups=base.buildings?.map(b=>b.parts)||[parts(base)];return groups.some(rs=>{if(!rs.length)return false;const dx=o.x2-o.x,dy=o.y2-o.y,ts=[0,1];for(const r of rs){if(dx)for(const x of [r.x,r.x+r.w]){const t=(x-o.x)/dx;if(t>0&&t<1)ts.push(t);}if(dy)for(const y of [r.y,r.y+r.h]){const t=(y-o.y)/dy;if(t>0&&t<1)ts.push(t);}}ts.sort((a,b)=>a-b);return ts.every(t=>point({x:o.x+dx*t,y:o.y+dy*t},rs))&&ts.slice(1).every((t,i)=>point({x:o.x+dx*(t+ts[i])/2,y:o.y+dy*(t+ts[i])/2},rs));});}
window.ManegePlanGeometry={clip,parts,rectInside,building,segmentInside};
})();
