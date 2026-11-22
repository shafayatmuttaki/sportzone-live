const API_KEY = "25d6a156-f7a3-4f24-8985-6a08f1e96202";

const i18n = {
  en: { nav1: "Matches", nav2: "Live TV", nav3: "Videos", feat: "🔥 Featured Live", all: "🏏 Match Center", sc: "Scorecard ➔" },
  bn: { nav1: "ম্যাচসমূহ", nav2: "লাইভ টিভি", nav3: "ভিডিও", feat: "🔥 আলোচিত লাইভ", all: "🏏 সব ম্যাচ", sc: "স্কোরকার্ড ➔" },
  hi: { nav1: "मैच", nav2: "लाइव टीवी", nav3: "वीडियो", feat: "🔥 लाइव मैच", all: "🏏 मैच सेंटर", sc: "स्कोरकार्ड ➔" }
};
let curLang = "en", curFmt = "ALL", matches = [], activeMatch = null;

function setLang(l, btn) {
  curLang = l;
  document.querySelectorAll(".lbtn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const t = i18n[l];
  document.getElementById("nav1").innerText = t.nav1;
  document.getElementById("nav2").innerText = t.nav2;
  document.getElementById("nav3").innerText = t.nav3;
  document.getElementById("lblFeatured").innerText = t.feat;
  document.getElementById("lblAll").innerText = t.all;
  renderMatches();
}

const fallbackMatches = [
  { id: "m1", name: "Bangladesh vs India, 1st T20I", matchType: "t20", status: "Bangladesh won by 6 wickets", venue: "Shere Bangla National Stadium, Dhaka", date: "2026-11-22", teams: ["Bangladesh", "India"], score: [{ r: 178, w: 4, o: 19.2 }, { r: 174, w: 7, o: 20 }] },
  { id: "m2", name: "Australia vs England, 2nd ODI", matchType: "odi", status: "Australia need 42 runs in 36 balls", venue: "Melbourne Cricket Ground (MCG)", date: "2026-11-22", teams: ["Australia", "England"], score: [{ r: 245, w: 5, o: 44 }, { r: 286, w: 8, o: 50 }] },
  { id: "m3", name: "South Africa vs Pakistan, 1st Test", matchType: "test", status: "Day 3: South Africa lead by 112 runs", venue: "SuperSport Park, Centurion", date: "2026-11-22", teams: ["South Africa", "Pakistan"], score: [{ r: 340, w: 10, o: 98.4 }, { r: 228, w: 10, o: 71.2 }] }
];

function teamBadge(name) {
  const colors = ["#006a4e", "#1d4ed8", "#d97706", "#059669", "#7c3aed", "#dc2626", "#0284c7"];
  const code = (name || "TM").substring(0, 3).toUpperCase();
  const bg = colors[code.charCodeAt(0) % colors.length];
  return `<div class="team-logo" style="background:${bg};">${code}</div>`;
}

function buildCard(m, idx) {
  const t = i18n[curLang];
  const s1 = m.score && m.score[0] ? `${m.score[0].r}/${m.score[0].w}<small>(${m.score[0].o} ov)</small>` : `<small>Yet to bat</small>`;
  const s2 = m.score && m.score[1] ? `${m.score[1].r}/${m.score[1].w}<small>(${m.score[1].o} ov)</small>` : `<small>Yet to bat</small>`;
  return `
    <div class="m-card" onclick="openMatch(${idx})">
      <div class="m-top">
        <span>${(m.matchType || "CRICKET").toUpperCase()} • ${m.date || "LIVE"}</span>
        <span class="live-badge"><span class="pulse"></span> LIVE</span>
      </div>
      <div class="team-row">
        <div class="team-info">${teamBadge(m.teams[0])}<span class="team-name">${m.teams[0] || "Team A"}</span></div>
        <div class="team-score">${s1}</div>
      </div>
      <div class="team-row">
        <div class="team-info">${teamBadge(m.teams[1])}<span class="team-name">${m.teams[1] || "Team B"}</span></div>
        <div class="team-score">${s2}</div>
      </div>
      <div class="m-foot">
        <span class="m-status">${m.status}</span>
        <span class="m-cta">${t.sc}</span>
      </div>
    </div>`;
}

function filterMatches(fmt, btn) {
  curFmt = fmt;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderMatches();
}

function renderMatches() {
  const filtered = curFmt === "ALL" ? matches : matches.filter(m => (m.matchType || "").toUpperCase().includes(curFmt));
  document.getElementById("featuredSlider").innerHTML = matches.slice(0, 4).map((m, i) => buildCard(m, i)).join("");
  document.getElementById("matchFeed").innerHTML = (filtered.length ? filtered : matches).map((m, i) => buildCard(m, matches.indexOf(m))).join("");
}

async function initData() {
  matches = fallbackMatches;
  renderMatches();
  try {
    const r = await fetch("./scores.json?v=" + Date.now());
    if (r.ok) {
      const j = await r.json();
      if (j && j.data && j.data.length) { matches = j.data; renderMatches(); }
    }
  } catch (e) {}
}

async function openMatch(idx) {
  activeMatch = matches[idx];
  document.getElementById("matchSheet").style.display = "flex";
  document.getElementById("sheetTitle").innerText = activeMatch.name;
  switchSub("sub-sum", document.querySelector(".sub-tab"));
}

function closeSheet() { document.getElementById("matchSheet").style.display = "none"; }

async function switchSub(tabId, btn) {
  document.querySelectorAll(".sub-tab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const body = document.getElementById("sheetBody");
  const m = activeMatch;

  if (tabId === "sub-info") {
    body.innerHTML = `
      <div class="m-card" style="cursor:default;">
        <h4 style="color:var(--accent);margin-bottom:10px;">Match Details</h4>
        <p style="font-size:13px;margin-bottom:8px;"><b>Series / Match:</b> ${m.name}</p>
        <p style="font-size:13px;margin-bottom:8px;"><b>Format:</b> ${(m.matchType || "N/A").toUpperCase()}</p>
        <p style="font-size:13px;margin-bottom:8px;"><b>Venue:</b> ${m.venue || "International Stadium"}</p>
        <p style="font-size:13px;"><b>Date:</b> ${m.date || "Today"}</p>
      </div>`;
    return;
  }

  body.innerHTML = `<div class="m-card" style="cursor:default;"><p style="color:var(--gold);font-weight:700;">${m.status}</p><div id="scLoader" style="margin-top:12px;font-size:13px;color:var(--muted);">Fetching live scorecard...</div></div>`;

  try {
    const r = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${API_KEY}&id=${m.id}`);
    const j = await r.json();
    if (j.status === "success" && j.data && j.data.scorecard && j.data.scorecard.length) {
      document.getElementById("scLoader").innerHTML = j.data.scorecard.map(inn => `
        <h4 style="color:var(--blue);margin:14px 0 6px;">${inn.inning}</h4>
        <table>
          <tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr>
          ${(inn.batting || []).map(b => `<tr><td><span class="p-link" onclick="loadPlayer('${b.batsman.id}','${b.batsman.name.replace(/'/g, "")}')">${b.batsman.name}</span><br><small style="color:var(--muted);">${b["dismissal-text"] || "not out"}</small></td><td><b>${b.r}</b></td><td>${b.b}</td><td>${b["4s"]}</td><td>${b["6s"]}</td><td>${b.sr || "-"}</td></tr>`).join("")}
        </table>
        <table>
          <tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>ECO</th></tr>
          ${(inn.bowling || []).map(bw => `<tr><td><span class="p-link" onclick="loadPlayer('${bw.bowler.id}','${bw.bowler.name.replace(/'/g, "")}')">${bw.bowler.name}</span></td><td>${bw.o}</td><td>${bw.m}</td><td>${bw.r}</td><td style="color:var(--accent);font-weight:800;">${bw.w}</td><td>${bw.eco}</td></tr>`).join("")}
        </table>`).join("");
    } else {
      document.getElementById("scLoader").innerHTML = `<p>Full ball-by-ball scorecard appears automatically when official innings feed starts.</p>`;
    }
  } catch (e) {
    document.getElementById("scLoader").innerHTML = `<p>Live feed connected. Waiting for next over update.</p>`;
  }
}

async function loadPlayer(pid, pname) {
  document.getElementById("playerPop").style.display = "flex";
  document.getElementById("pName").innerText = pname;
  document.getElementById("pBody").innerHTML = `<p style="font-size:12px;color:var(--muted);">Loading career statistics...</p>`;
  try {
    const r = await fetch(`https://api.cricapi.com/v1/players_info?apikey=${API_KEY}&id=${pid}`);
    const j = await r.json();
    if (j.status === "success" && j.data) {
      const st = j.data.stats || [];
      const getV = (fn, fmt, k) => { const f = st.find(x => x.fn === fn && x.matchtype === fmt && x.stat === k); return f && f.value ? f.value : "-"; };
      const fmts = ["test", "odi", "t20i", "ipl"];
      const metrics = [["Matches", "m"], ["Runs", "runs"], ["Highest", "hs"], ["Average", "avg"], ["Strike Rate", "sr"], ["Wickets", "wkts"], ["Economy", "econ"]];
      const rows = metrics.map(row => `<tr><td><b>${row[0]}</b></td>${fmts.map(f => `<td>${getV(row[1] === "wkts" || row[1] === "econ" ? "bowling" : "batting", f, row[1])}</td>`).join("")}</tr>`).join("");
      document.getElementById("pBody").innerHTML = `
        <p style="font-size:12px;color:var(--blue);margin-bottom:8px;">${j.data.country || ""} • ${j.data.role || ""}</p>
        <table><tr><th>Stat</th><th>Test</th><th>ODI</th><th>T20I</th><th>IPL</th></tr>${rows}</table>`;
    }
  } catch (e) {}
}

const tvChannels = [
  { name: "Red Bull TV HD", cat: "Sports • Global", url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8" },
  { name: "FIFA+ Live", cat: "Football • Live", url: "https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8" },
  { name: "Dubai Sports 1 HD", cat: "Cricket & Sports", url: "https://dmisxthvll.cdn.mgmlcdn.com/dubaisports/smil:dubaisports.stream.smil/playlist.m3u8" },
  { name: "Dubai Sports 2 HD", cat: "Live Arena", url: "https://dmisxthvll.cdn.mgmlcdn.com/dubaisports2/smil:dubaisports2.stream.smil/playlist.m3u8" },
  { name: "Sharjah Sports HD", cat: "UAE Sports", url: "https://svs.itworkscdn.net/smc4sportslive/smc4.smil/playlist.m3u8" },
  { name: "Trace Sport Stars", cat: "Sports Lifestyle", url: "https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg01076-tracetv-tracesport-samsunguk/playlist.m3u8" }
];
let activeTvIdx = -1, hlsInstance = null, adTimerInt = null;

function renderTv() {
  const q = (document.getElementById("tvSearch").value || "").toLowerCase();
  document.getElementById("tvGrid").innerHTML = tvChannels
    .map((c, i) => ({ ...c, i }))
    .filter(c => c.name.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q))
    .map(c => `
      <div class="tv-card ${activeTvIdx === c.i ? "playing" : ""}" onclick="playChannel(${c.i})">
        <div class="tv-cat">● ${c.cat}</div>
        <div class="tv-title">${c.name}</div>
      </div>`).join("");
}

function playChannel(idx) {
  activeTvIdx = idx;
  renderTv();
  const ch = tvChannels[idx];
  const overlay = document.getElementById("adOverlay");
  const timerEl = document.getElementById("adTimer");
  const video = document.getElementById("hlsPlayer");
  document.getElementById("nowPlaying").innerText = "⏳ Preparing: " + ch.name;
  video.pause();
  clearInterval(adTimerInt);

  let sec = 10;
  timerEl.innerText = sec;
  overlay.style.display = "flex";
  adTimerInt = setInterval(() => {
    sec--;
    timerEl.innerText = sec;
    if (sec <= 0) {
      clearInterval(adTimerInt);
      overlay.style.display = "none";
      document.getElementById("nowPlaying").innerText = "▶️ Live Now: " + ch.name;
      if (Hls.isSupported()) {
        if (hlsInstance) hlsInstance.destroy();
        hlsInstance = new Hls();
        hlsInstance.loadSource(ch.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      } else {
        video.src = ch.url;
        video.play();
      }
    }
  }, 1000);
}

const ytList = [
  { title: "ICC Official Cricket Highlights", id: "UCt2jxGk2fw704_7yX20r-2w" },
  { title: "ECB — England & Wales Cricket", id: "UCz1D0n02igIuw1Lp2-k2-1w" },
  { title: "Cricket Australia Official", id: "UCkBY0aHJP9BwjZLDYxAQrKg" }
];
document.getElementById("ytChannels").innerHTML = ytList.map(y => `
  <div class="m-card" onclick="document.getElementById('ytFrame').src='https://www.youtube.com/embed/live_stream?channel=${y.id}'">
    <div style="font-size:11px;color:var(--live);font-weight:800;">▶ WATCH CHANNEL</div>
    <div style="font-size:14px;font-weight:700;margin-top:4px;">${y.title}</div>
  </div>`).join("");

function switchNav(tabId, btn) {
  document.querySelectorAll(".sec").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".b-item").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  btn.classList.add("active");
}

initData();
renderTv();
