const KEY="sportTrackV1";
const defaultPlans=[
 {id:1,name:"Full Body",exercises:["Pompes","Squats","Fentes","Gainage"]},
 {id:2,name:"Haut du corps",exercises:["Pompes","Dips","Rowing","Gainage"]},
 {id:3,name:"Séance libre",exercises:["Exercice 1"]}
];
let db=JSON.parse(localStorage.getItem(KEY)||"null")||{plans:defaultPlans,history:[]};
let current=null, timer=null, startTime=0;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function persist(){localStorage.setItem(KEY,JSON.stringify(db))}
function show(id){$$(".screen").forEach(x=>x.classList.toggle("active",x.id===id)); $$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.screen===id)); render()}
function render(){
 $("#weekSessions").textContent=db.history.filter(h=>Date.now()-h.date<7*864e5).length;
 $("#weekMinutes").textContent=Math.round(db.history.filter(h=>Date.now()-h.date<7*864e5).reduce((a,h)=>a+h.duration/60,0));
 $("#planList").innerHTML=db.plans.map(p=>`<div class="plan"><div><strong>${esc(p.name)}</strong><br><small>${p.exercises.length} exercices</small></div><button onclick="startPlan(${p.id})">▶</button></div>`).join("");
 $("#historyList").innerHTML=db.history.length?db.history.slice().reverse().map(h=>`<div class="history-item"><strong>${esc(h.name)}</strong><small>${new Date(h.date).toLocaleString("fr-FR")} · ${Math.round(h.duration/60)} min · ${h.totalSets} séries</small><small>${h.exercises.map(e=>`${esc(e.name)}: ${e.sets.map(s=>s.reps||0).join(" / ")}`).join(" · ")}</small></div>`).join(""):`<div class="empty">Aucune séance enregistrée.</div>`;
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function startPlan(id){let p=db.plans.find(x=>x.id===id); current={name:p.name,exercises:p.exercises.map(n=>({name:n,sets:[{reps:""},{reps:""},{reps:""}]}))}; startTime=Date.now(); show("workout"); $("#workoutTitle").textContent=current.name; updateWorkout(); clearInterval(timer);timer=setInterval(updateClock,1000)}
function updateClock(){let s=Math.floor((Date.now()-startTime)/1000);$("#sessionTimer").textContent=fmt(s)}
function fmt(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function updateWorkout(){
 $("#exerciseArea").innerHTML=current.exercises.map((e,ei)=>`<div class="exercise"><h3>${esc(e.name)}</h3><div class="sets"><div>#</div><div>Répétitions</div><div>Objectif</div><div></div>${e.sets.map((s,si)=>`<div>${si+1}</div><input type="number" min="0" inputmode="numeric" value="${s.reps}" data-e="${ei}" data-s="${si}" placeholder="0"><div>—</div><button class="${s.done?"done":""}" data-d="${ei}-${si}">${s.done?"✓":"○"}</button>`).join("")}</div></div>`).join("");
 $$("input[data-e]").forEach(inp=>inp.oninput=e=>{current.exercises[+e.target.dataset.e].sets[+e.target.dataset.s].reps=e.target.value});
 $$("button[data-d]").forEach(b=>b.onclick=()=>{let [ei,si]=b.dataset.d.split("-").map(Number);current.exercises[ei].sets[si].done=!current.exercises[ei].sets[si].done;updateWorkout()});
}
function finish(){clearInterval(timer);let duration=Math.floor((Date.now()-startTime)/1000);let totalSets=current.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done||s.reps).length,0);$("#summaryBox").innerHTML=`<b>${esc(current.name)}</b><p>⏱ ${fmt(duration)}</p><p>🏋️ ${current.exercises.length} exercices</p><p>🔢 ${totalSets} séries</p>`;current.duration=duration;current.totalSets=totalSets;show("summary")}
$("#startBtn").onclick=()=>startPlan(db.plans[0].id);
$("#finishBtn").onclick=finish;
$("#saveWorkout").onclick=()=>{db.history.push({date:Date.now(),name:current.name,duration:current.duration,totalSets:current.totalSets,exercises:current.exercises});persist();current=null;show("home")};
$("#cancelWorkout").onclick=()=>{if(confirm("Abandonner cette séance ?")){clearInterval(timer);current=null;show("home")}};
$$(".back").forEach(b=>{if(b.id!=="cancelWorkout")b.onclick=()=>show("home")});
$$("[data-screen]").forEach(b=>b.onclick=()=>show(b.dataset.screen));
$("#newPlan").onclick=()=>$("#modal").classList.remove("hidden");
$("#closeModal").onclick=()=>$("#modal").classList.add("hidden");
$("#createPlan").onclick=()=>{let name=$("#planName").value.trim(), ex=$("#planExercises").value.split("\n").map(x=>x.trim()).filter(Boolean);if(!name||!ex.length)return alert("Indique un nom et au moins un exercice.");db.plans.push({id:Date.now(),name,exercises:ex});persist();$("#planName").value="";$("#planExercises").value="";$("#modal").classList.add("hidden");render()};
$("#resetBtn").onclick=()=>{if(confirm("Réinitialiser toutes les données ?")){localStorage.removeItem(KEY);location.reload()}};
render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
