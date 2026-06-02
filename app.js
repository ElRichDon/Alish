const today = new Date();
const todayKey = today.toISOString().slice(0,10);

document.getElementById("todayDate").textContent = today.toLocaleDateString(undefined, {
  month:"long", day:"numeric", year:"numeric"
});
document.getElementById("medDate").textContent = today.toLocaleDateString(undefined, {
  month:"short", day:"numeric"
});

const songLinks = {
  "My Shot": "https://www.youtube.com/results?search_query=Hamilton+My+Shot",
  "The Schuyler Sisters": "https://www.youtube.com/results?search_query=Hamilton+The+Schuyler+Sisters",
  "Dear Theodosia": "https://www.youtube.com/results?search_query=Hamilton+Dear+Theodosia",
  "It's Quiet Uptown": "https://www.youtube.com/results?search_query=Hamilton+Its+Quiet+Uptown",
  "Hamilton Piano Cover": "https://www.youtube.com/results?search_query=Hamilton+Piano+Cover",
  "Wait For It": "https://www.youtube.com/results?search_query=Hamilton+Wait+For+It"
};

let meds = JSON.parse(localStorage.getItem(`alish-meds-${todayKey}`)) || [
  {time:"08:00", name:"Escitalopram", dose:"10 mg", taken:true},
  {time:"12:00", name:"Vitamin D3", dose:"2,000 IU", taken:true},
  {time:"18:00", name:"Magnesium", dose:"250 mg", taken:false},
  {time:"21:00", name:"Melatonin", dose:"5 mg", taken:false}
];

function saveMeds(){
  localStorage.setItem(`alish-meds-${todayKey}`, JSON.stringify(meds));
}

function renderMeds(){
  const list = document.getElementById("medicineList");
  list.innerHTML = "";

  meds.sort((a,b)=>a.time.localeCompare(b.time));

  meds.forEach((med,index)=>{
    const row = document.createElement("div");
    row.className = `med-row ${med.taken ? "done" : ""}`;
    row.innerHTML = `
      <span>${formatTime(med.time)}</span>
      <strong>${escapeHtml(med.name)}</strong>
      <span>${escapeHtml(med.dose || "")}</span>
      <button class="${med.taken ? "taken" : ""}">${med.taken ? "✓ Taken" : "Take"}</button>
    `;
    row.querySelector("button").onclick = () => {
      meds[index].taken = !meds[index].taken;
      saveMeds();
      renderMeds();
    };
    list.appendChild(row);
  });

  updateWellness();
}

document.getElementById("medicineForm").onsubmit = e => {
  e.preventDefault();
  meds.push({
    time: document.getElementById("medTime").value,
    name: document.getElementById("medName").value.trim(),
    dose: document.getElementById("medDose").value.trim(),
    taken: false
  });
  e.target.reset();
  saveMeds();
  renderMeds();
};

document.querySelectorAll(".mood-grid button").forEach(button=>{
  button.onclick = () => {
    document.querySelectorAll(".mood-grid button").forEach(b=>b.classList.remove("active"));
    button.classList.add("active");

    const mood = button.dataset.mood;
    const song = button.dataset.song;

    document.getElementById("moodMessage").textContent = `Today's mood: ${mood}. Your Hamilton vibe is "${song}".`;
    document.getElementById("songTitle").textContent = song;
    document.getElementById("songMood").textContent = `Fits your mood: ${mood}`;
    document.getElementById("youtubeBtn").href = songLinks[song];
    document.getElementById("youtubeBtn").textContent = `▶ Play "${song}" on YouTube`;
    updateWellness();
  };
});

document.querySelectorAll("[data-search]").forEach(button=>{
  button.onclick = () => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(button.dataset.search)}`,"_blank");
  };
});

function updateWellness(){
  const total = meds.length;
  const taken = meds.filter(m=>m.taken).length;
  const medPercent = total ? Math.round((taken/total)*100) : 0;
  document.getElementById("medProgress").value = medPercent;
  document.getElementById("medCount").textContent = `${taken}/${total}`;

  const moodDone = document.querySelector(".mood-grid button.active") ? 1 : 0;
  const score = Math.round((medPercent * 0.45) + (75 * 0.25) + (66 * 0.15) + (moodDone * 100 * 0.15));
  document.getElementById("wellnessScore").textContent = `${score}%`;
}

function formatTime(time){
  const [h,m] = time.split(":");
  const d = new Date();
  d.setHours(h,m);
  return d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
}

function escapeHtml(text){
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

renderMeds();
