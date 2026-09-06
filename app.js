const API_URL = https://script.google.com/macros/s/AKfycbwqn313sKP6NIa4plrwoji80VXttBtNy2gI0o3FS75fDa1j5NOJuYE-AuMrEqLLASFg/exec;

let globalBareme = [];

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(`page-${pageId}`).classList.add('active');
  event.target.classList.add('active');
}

async function loadData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    globalBareme = data.bareme;
    
    displayLeader(data.participants[0]);
    displayRanking(data.participants);
    populateForm(data.participants, data.bareme);
    displayRules(data.bareme);
  } catch (err) {
    console.error("Erreur de chargement :", err);
  }
}

function displayLeader(leader) {
  if (!leader) return;
  document.getElementById("leader-name").textContent = leader.nom;
  document.getElementById("leader-score").textContent = leader.score;
  document.getElementById("leader-incidents").textContent = `${leader.incidents} incident(s)`;
}

function displayRanking(participants) {
  const list = document.getElementById("ranking-list");
  list.innerHTML = "";
  participants.forEach((p, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.nom}</strong> <span>${p.score} pts (${p.incidents} inc.)</span>`;
    list.appendChild(li);
  });
}

function displayRules(bareme) {
  const list = document.getElementById("rules-list");
  list.innerHTML = "";
  bareme.forEach(b => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${b.action}</span> <strong>+${b.points} pt(s)</strong>`;
    list.appendChild(li);
  });
}

function populateForm(participants, bareme) {
  const selectPart = document.getElementById("select-participant");
  const selectAct = document.getElementById("select-action");
  
  selectPart.innerHTML = "";
  selectAct.innerHTML = "";

  participants.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.nom;
    opt.textContent = p.nom;
    selectPart.appendChild(opt);
  });

  bareme.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.action;
    opt.textContent = `${b.action} (+${b.points} pts)`;
    selectAct.appendChild(opt);
  });
}

document.getElementById("incident-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-submit");
  btn.disabled = true;
  btn.textContent = "Enregistrement...";

  const participant = document.getElementById("select-participant").value;
  const actionName = document.getElementById("select-action").value;
  const contexte = document.getElementById("input-contexte").value;
  const actionObj = globalBareme.find(b => b.action === actionName);

  const payload = {
    participant: participant,
    action: actionName,
    points: actionObj ? actionObj.points : 0,
    contexte: contexte
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    
    document.getElementById("input-contexte").value = "";
    await loadData();
    showPage('home');
  } catch (err) {
    console.error("Erreur :", err);
  } finally {
    btn.disabled = false;
    btn.textContent = "Valider l'incident";
  }
});

loadData();
