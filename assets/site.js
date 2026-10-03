/* Six Star Signal: page behaviour. Every node is set with createElement/textContent (no innerHTML), so the page runs under
   require-trusted-types-for 'script'. Sections: sign-up, illustrative wanted-level meter, "which host are you?" quiz. */
(function () {
"use strict";

var API = "https://acp9reat3l.execute-api.us-east-1.amazonaws.com/signal/request-link";
var SITE = "sixstarsignal.com";
var LANDING_RE = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%\/-]{0,199}$/;   // same shape the API accepts
var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

/* ---------- sign-up: POST {email, hp, site, landing_path, tz, query?} (same payload as the hub) ---------- */
function payload(email, hp) {
  var b = { email: email, hp: hp || "", site: SITE };
  if (LANDING_RE.test(location.pathname)) b.landing_path = location.pathname;
  try { var tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (tz && tz.length <= 40) b.tz = tz; } catch (e) { /* no zone: the API falls back */ }
  var q = location.search;
  if (q && q.length <= 2048 && /[?&](utm_[a-z]+|ref)=/i.test(q)) b.query = q;   // campaign attribution only
  return b;
}
function post(body) {
  var ctl = window.AbortController ? new AbortController() : null, timer = ctl ? window.setTimeout(function () { ctl.abort(); }, 15000) : 0;
  return fetch(API, { method: "POST", mode: "cors", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { window.clearTimeout(timer); return { status: r.status, code: j && j.error }; }); },
          function () { window.clearTimeout(timer); return { status: 0, code: "network" }; });
}
function errText(res) {
  var s = res.status, c = res.code;
  if (s === 400 && c === "invalid_email") return "That email address doesn't look right. Check it for a typo?";
  if (s === 400) return "Something in the form didn't go through. Please try again.";
  if (s === 415) return "Your browser sent the form in a format we can't read. Refresh the page and try again.";
  if (s === 429) return "Lots of sign-ups from your network just now. Wait a minute, then try again.";
  if (s === 403) return "Sign-up only works on our own site. Open " + SITE + " and try again.";
  if (s >= 500) return "Our sign-up desk hit a snag. Please try again in a moment.";
  return "We couldn't reach the sign-up desk. Check your connection and try again.";
}
function validEmail(v) { return v.length <= 254 && EMAIL_RE.test(v); }

var form = $("#join");
var em = $('input[type="email"]', form), hp = $('input[name="website"]', form), err = $(".js-err", form);
var btn = $('button[type="submit"]', form), done = $("#done"), doneEmail = $("#done-email"), busy = false;
em.addEventListener("blur", function () {   // inline validation on blur, never only on submit
  var v = em.value.trim();
  if (v && !validEmail(v)) { err.textContent = "That email address doesn't look right yet."; em.setAttribute("aria-invalid", "true"); }
  else { err.textContent = ""; em.removeAttribute("aria-invalid"); }
});
em.addEventListener("input", function () { if (em.getAttribute("aria-invalid") && validEmail(em.value.trim())) { err.textContent = ""; em.removeAttribute("aria-invalid"); } });
form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (busy) return;
  var v = em.value.trim();
  if (!validEmail(v)) { err.textContent = "Please enter your email address, like name@example.com."; em.setAttribute("aria-invalid", "true"); em.focus(); return; }
  busy = true; btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…"; err.textContent = "";
  post(payload(v, hp ? hp.value : "")).then(function (res) {
    busy = false; btn.disabled = false; btn.textContent = label;
    if (res.status === 200) { form.hidden = true; doneEmail.textContent = v; done.hidden = false; done.focus(); return; }
    err.textContent = errText(res);
    if (res.code === "invalid_email") { em.setAttribute("aria-invalid", "true"); em.focus(); }
  });
});
function goJoin(e) {
  if (e) e.preventDefault();
  var target = form.hidden ? done : form;
  target.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "center" });
  window.setTimeout(function () { if (!form.hidden) em.focus({ preventScroll: true }); else done.focus({ preventScroll: true }); }, REDUCE ? 0 : 350);
}
$$("[data-join]").forEach(function (a) { a.addEventListener("click", goJoin); });

/* ---------- the six-star wanted level: an ILLUSTRATIVE scale, not live data ---------- */
var LEVELS = [
  ["A whisper", "One unverified post, with nothing behind it. Label: Rumor."],
  ["Chatter", "A few accounts repeating the same unverified claim. Label: Rumor."],
  ["Heat", "Credible outlets are reporting it, but the source has not confirmed it. Label: Reported."],
  ["Manhunt", "The company confirms one detail and fans are all over it. Label: Confirmed."],
  ["Citywide", "A major official announcement: a date, a price, a platform list. Label: Confirmed."],
  ["Six stars", "The biggest moments there are: a launch, a delay, a big reveal, official and everywhere at once. Label: Confirmed."]
];
var lvl = $("#level"), stars = $$("#stars li");
function paintLevel() {
  var n = +lvl.value;
  stars.forEach(function (s, i) { s.className = i < n ? "lit" : ""; });
  $("#levelOut").textContent = n + (n === 1 ? " star" : " stars");
  $("#levelName").textContent = LEVELS[n - 1][0];
  $("#levelDesc").textContent = LEVELS[n - 1][1];
}
lvl.addEventListener("input", paintLevel); paintLevel();

/* ---------- "Which GTA 6 host are you?" (original hosts; light and fun, no stakes) ---------- */
var HOSTS = {
  six: ["Six", "The dispatcher", "Calm, controlled and deadpan-funny under pressure. You run the board, read the wanted level like a scanner report, and never lose your cool when the news breaks."],
  nitro: ["Nitro", "The getaway driver", "Breathless, warm and always mid-chase. You treat every headline like a heist beat, you are always in the field, and you are never, ever early."],
  dot: ["Dot", "The veteran crime-radio DJ", "Husky, seen-it-all and wry. You have heard every rumor twice, you ask where it came from, and you are right more often than you let on."],
  ricochet: ["Ricochet", "The over-caffeinated rookie reporter", "First week on the beat and sure this is the scoop of the century. You are fast, you are eager, and you are usually right."],
  carto: ["The Cartographer", "The leak-mapping detective", "Mysterious, low and methodical. You map every clue like a case file and chase shadows until someone brings a source."]
};
var QS = [
  ["Launch night. Where are you?", [["six", "Controller in hand, plan made, snacks sorted."], ["nitro", "Already driving to pick up everyone."], ["dot", "On the couch, explaining how the old days were better."], ["ricochet", "Refreshing every feed for the first reactions."]]],
  ["A rumor lands in the group chat.", [["six", "Check where it came from before replying."], ["ricochet", "Forward it with a dozen exclamation marks."], ["dot", "Reply: a screenshot is not a source."], ["carto", "Pin it to a wall and connect it with string."]]],
  ["Your spot on the crew?", [["six", "The one with the plan."], ["nitro", "The driver."], ["dot", "The veteran who has seen it all."], ["carto", "The scout who maps every exit."]]],
  ["Pick a soundtrack.", [["six", "Calm scanner chatter."], ["nitro", "Fast synths, windows down."], ["dot", "Late-night crime radio."], ["ricochet", "Whatever just dropped."]]]
];
var ORDER = ["six", "nitro", "dot", "ricochet", "carto"];
var qi = 0, score = {}, qForm = $("#quizForm"), qSet = $("#quizSet"), qErr = $("#quizErr"), qNext = $("#quizNext"), qRes = $("#quizResult");
function resetScore() { score = {}; ORDER.forEach(function (k) { score[k] = 0; }); }
function showQ() {
  var q = QS[qi], opts = clear($("#quizOpts"));
  $("#quizNum").textContent = "Question " + (qi + 1) + " of " + QS.length;
  $("#quizQ").textContent = q[0];
  q[1].forEach(function (o, i) {
    var id = "q" + qi + "o" + i, w = el("div", "opt"), r = document.createElement("input");
    r.type = "radio"; r.name = "quiz"; r.id = id; r.value = o[0];
    var l = el("label", null, o[1]); l.setAttribute("for", id);
    w.appendChild(r); w.appendChild(l); opts.appendChild(w);
  });
  qErr.textContent = ""; qNext.textContent = qi === QS.length - 1 ? "See my host" : "Next";
  var first = $("input", opts); if (first && qi > 0) first.focus({ preventScroll: true });
}
function showResult() {
  var best = ORDER[0];
  ORDER.forEach(function (k) { if (score[k] > score[best]) best = k; });
  var h = HOSTS[best];
  qForm.hidden = true; qRes.hidden = false;
  $("#resName").textContent = h[0]; $("#resRole").textContent = h[1]; $("#resText").textContent = h[2];
  qRes.focus();
}
qForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var pick = $('input[name="quiz"]:checked', qSet);
  if (!pick) { qErr.textContent = "Pick one to keep going."; return; }
  score[pick.value] += 1;
  if (qi < QS.length - 1) { qi += 1; showQ(); } else showResult();
});
$("#quizAgain").addEventListener("click", function () { qi = 0; resetScore(); qRes.hidden = true; qForm.hidden = false; showQ(); $("#quizQ").scrollIntoView({ block: "center", behavior: REDUCE ? "auto" : "smooth" }); });
resetScore(); showQ();
})();
