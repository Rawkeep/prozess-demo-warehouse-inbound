const P=window.PROCESS;
const TYPE_DE={START:"Start",END:"Ende",TASK:"Manuell",SERVICE:"Automatisiert",
APPROVAL:"Freigabe (HITL)",DECISION:"Entscheidung"};
const W=170,H=56,DIA=66,R=28;
const ctr=s=>({x:s.x+85,y:s.y+40});
const byId={};P.steps.forEach(s=>byId[s.id]=s);
function anchor(s,side){const c=ctr(s);
 const half=s.type==="DECISION"?DIA/2:(s.type==="START"||s.type==="END")?R:W/2;
 return{x:c.x+(side==="r"?half:-half),y:c.y};}
function draw(){
 const maxX=Math.max(...P.steps.map(s=>s.x))+260;
 const maxY=Math.max(...P.steps.map(s=>s.y))+140;
 const svg=document.getElementById("svg");
 svg.setAttribute("viewBox",`0 0 ${maxX} ${maxY}`);
 svg.setAttribute("width",maxX);svg.setAttribute("height",maxY);
 const NS="http://www.w3.org/2000/svg";
 const defs=document.createElementNS(NS,"defs");
 defs.innerHTML='<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" '+
  'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'+
  '<path d="M0 0L10 5L0 10z" fill="#2c4a37"/></marker>'+
  '<marker id="arrh" viewBox="0 0 10 10" refX="9" refY="5" '+
  'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'+
  '<path d="M0 0L10 5L0 10z" fill="#d3f566"/></marker>';
 svg.appendChild(defs);
 P.transitions.forEach((t,i)=>{
  const a=byId[t.source],b=byId[t.target];if(!a||!b)return;
  const fwd=ctr(b).x>=ctr(a).x;
  const p1=anchor(a,fwd?"r":"l"),p2=anchor(b,fwd?"l":"r");
  const dx=Math.max(46,Math.abs(p2.x-p1.x)/2);
  const d=`M${p1.x} ${p1.y} C${p1.x+(fwd?dx:-dx)} ${p1.y},`+
   `${p2.x+(fwd?-dx:dx)} ${p2.y},${p2.x} ${p2.y}`;
  const g=document.createElementNS(NS,"g");
  g.setAttribute("class","edge");g.id="e"+i;
  const path=document.createElementNS(NS,"path");
  path.setAttribute("d",d);path.setAttribute("marker-end","url(#arr)");
  g.appendChild(path);
  if(t.condition){const tx=document.createElementNS(NS,"text");
   tx.setAttribute("x",(p1.x+p2.x)/2);tx.setAttribute("y",(p1.y+p2.y)/2-7);
   tx.setAttribute("text-anchor","middle");tx.textContent=t.condition;
   g.appendChild(tx);}
  svg.appendChild(g);});
 P.steps.forEach(s=>{
  const c=ctr(s);const g=document.createElementNS(NS,"g");
  g.setAttribute("class","node "+s.type);g.id="n"+s.id;
  let shape,fo;
  if(s.type==="START"||s.type==="END"){
   shape=document.createElementNS(NS,"circle");
   shape.setAttribute("cx",c.x);shape.setAttribute("cy",c.y);shape.setAttribute("r",R);
   fo=foLabel(c.x-70,c.y+R+3,140,30,s.name,"sub");
  }else if(s.type==="DECISION"){
   shape=document.createElementNS(NS,"polygon");
   const h=DIA/2;shape.setAttribute("points",
    `${c.x},${c.y-h} ${c.x+h},${c.y} ${c.x},${c.y+h} ${c.x-h},${c.y}`);
   fo=foLabel(c.x-80,c.y+h+3,160,30,s.name,"sub");
  }else{
   shape=document.createElementNS(NS,"rect");
   shape.setAttribute("x",c.x-W/2);shape.setAttribute("y",c.y-H/2);
   shape.setAttribute("width",W);shape.setAttribute("height",H);
   shape.setAttribute("rx",12);
   fo=foLabel(c.x-W/2,c.y-H/2,W,H,s.name,"lbl");
  }
  g.appendChild(shape);g.appendChild(fo);svg.appendChild(g);});
 function foLabel(x,y,w,h,text,cls){
  const fo=document.createElementNS(NS,"foreignObject");
  fo.setAttribute("x",x);fo.setAttribute("y",y);
  fo.setAttribute("width",w);fo.setAttribute("height",h);
  const div=document.createElement("div");div.className=cls;div.textContent=text;
  fo.appendChild(div);return fo;}
}
function decisions(){return P.steps.filter(s=>s.type==="DECISION");}
function buildControls(){
 const box=document.getElementById("decs");
 decisions().forEach(d=>{
  const out=P.transitions.filter(t=>t.source===d.id);
  const wrapper=document.createElement("div");wrapper.className="dec";
  const lab=document.createElement("label");lab.textContent=d.name;
  const seg=document.createElement("div");seg.className="seg";
  out.forEach((t,i)=>{
   const b=document.createElement("button");b.type="button";
   b.textContent=t.condition;b.dataset.dec=d.id;b.dataset.val=t.condition;
   if(i===0)b.classList.add("on");
   b.onclick=()=>{seg.querySelectorAll("button").forEach(x=>
    x.classList.remove("on"));b.classList.add("on");run();};
   seg.appendChild(b);});
  wrapper.appendChild(lab);wrapper.appendChild(seg);box.appendChild(wrapper);});
}
function chosen(){const m={};document.querySelectorAll(".seg button.on")
 .forEach(b=>m[b.dataset.dec]=b.dataset.val);return m;}
function simulate(dec){
 const start=P.steps.find(s=>s.type==="START");
 let cur=start,path=[],edges=[],sla=0,guard=0;
 while(cur&&guard++<1000){
  path.push(cur);sla+=cur.sla||0;
  if(cur.type==="END")return{path,edges,sla,done:true};
  const out=P.transitions.map((t,i)=>({t,i})).filter(o=>o.t.source===cur.id);
  if(!out.length)break;
  let pick=out[0];
  if(cur.type==="DECISION"&&dec[cur.id]){
   const m=out.find(o=>o.t.condition===dec[cur.id]);if(m)pick=m;}
  edges.push(pick.i);cur=byId[pick.t.target];}
 return{path,edges,sla,done:false};}
let timers=[];
function run(){
 timers.forEach(clearTimeout);timers=[];
 document.querySelectorAll(".hit").forEach(e=>e.classList.remove("hit"));
 const r=simulate(chosen());
 const res=document.getElementById("result");res.classList.add("show");
 const chips=document.getElementById("chips");chips.innerHTML="";
 r.path.forEach((s,i)=>{
  const c=document.createElement("span");c.className="chip";c.textContent=s.name;
  chips.appendChild(c);
  timers.push(setTimeout(()=>{
   c.classList.add("hot");
   document.getElementById("n"+s.id).classList.add("hit");
   if(i<r.edges.length)document.getElementById("e"+r.edges[i]).classList.add("hit");
  },i*140));});
 document.getElementById("sla").textContent=
  `${r.path.length} Schritte · Ziel-Durchlaufzeit ${fmtH(r.sla)}`;}
function fmtH(h){return h.toLocaleString("de-DE",{maximumFractionDigits:1})+" h";}
function buildTable(){
 const tb=document.getElementById("tbody");
 P.steps.forEach(s=>{const tr=document.createElement("tr");
  tr.innerHTML=`<td class="n">${esc(s.name)}</td><td>${TYPE_DE[s.type]}</td>`+
   `<td>${esc(s.lane||"—")}</td><td>${esc(s.system||"—")}</td>`+
   `<td>${s.sla?fmtH(s.sla):"—"}</td>`;
  tb.appendChild(tr);});}
function esc(x){const d=document.createElement("i");d.textContent=x;return d.innerHTML;}
function dl(name,content,type){const b=new Blob([content],{type});
 const a=document.createElement("a");a.href=URL.createObjectURL(b);
 a.download=name;a.click();URL.revokeObjectURL(a.href);}
document.getElementById("dl-n8n").onclick=()=>
 dl(P.id+".n8n.json",JSON.stringify(P.n8n,null,2),"application/json");
document.getElementById("dl-bpmn").onclick=()=>
 dl(P.id+".bpmn",P.bpmn,"application/xml");
document.getElementById("replay").onclick=run;
draw();buildControls();buildTable();run();
