(function () {
  // Paste your deployed Google Apps Script web app URL here
  var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdJHaXH_nAyeOSYC7bM1zdnllZuxk_ls_Kgkd75lU3FyNrqk2UAczh3oXa-HFuwt5u/exec";

  var PER_SESSION = 5;
  var STORAGE_KEY = "emotion_label_data";

  var allTweets = [];
  var sessionTweets = [];
  var labels = {};
  var idx = 0;
  var uid = "";

  var badgeColors = {
    anger: "#bf544c",
    fear: "#7b6ba5",
    joy: "#b8912a",
    love: "#ad5575",
    sadness: "#5a7da0",
    surprise: "#ad7530",
  };

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function show(id) {
    $$(".screen").forEach(function (s) { s.classList.remove("active"); });
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function generateUid() {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var id = "";
    for (var i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (_) { return []; }
  }

  function saveLocal(submission) {
    var data = loadStored();
    data.push(submission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function sendRemote(submission) {
    if (!SCRIPT_URL) return;
    try {
      var flat = [];
      submission.responses.forEach(function (r) {
        flat.push({
          uid: submission.uid,
          timestamp: submission.timestamp,
          tweetId: r.tweetId,
          tweetText: r.tweetText,
          selectedLabel: r.selectedLabel,
        });
      });
      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ rows: flat }),
      });
    } catch (_) {}
  }

  function pickTweets() {
    var copy = allTweets.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
    }
    return copy.slice(0, PER_SESSION);
  }

  function renderTweet() {
    var tw = sessionTweets[idx];
    $("#tweet-text").textContent = tw.text;
    $("#current-num").textContent = idx + 1;
    $("#total-num").textContent = PER_SESSION;

    var pct = ((idx + 1) / PER_SESSION) * 100;
    $(".progress-fill").style.width = pct + "%";

    $$(".emotion-btn").forEach(function (b) {
      b.classList.toggle("selected", labels[idx] === b.dataset.emotion);
    });

    $("#prev-btn").disabled = idx === 0;
    $("#next-btn").disabled = !(idx in labels);
    $("#next-btn").innerHTML =
      idx === PER_SESSION - 1 ? "Review &rarr;" : "Next &rarr;";
  }

  function buildReview() {
    var list = $("#review-list");
    list.innerHTML = "";

    sessionTweets.forEach(function (tw, i) {
      var item = document.createElement("div");
      item.className = "review-item";

      var text = tw.text.length > 100 ? tw.text.slice(0, 100) + "…" : tw.text;
      var em = labels[i];
      item.innerHTML =
        '<div class="review-tweet">“' + escapeHtml(text) + '”</div>' +
        '<span class="label-badge" style="background:' + badgeColors[em] + '">' +
        em.charAt(0).toUpperCase() + em.slice(1) + "</span>";

      item.addEventListener("click", function () {
        idx = i;
        show("labeling");
        renderTweet();
      });

      list.appendChild(item);
    });
  }

  function submit() {
    var responses = sessionTweets.map(function (tw, i) {
      return {
        tweetId: tw.id,
        tweetText: tw.text,
        selectedLabel: labels[i],
        groundTruth: tw.ground_truth,
      };
    });

    var submission = {
      uid: uid,
      timestamp: new Date().toISOString(),
      responses: responses,
    };

    saveLocal(submission);
    sendRemote(submission);
    show("done");
  }

  function startSession() {
    sessionTweets = pickTweets();
    labels = {};
    idx = 0;
    show("labeling");
    renderTweet();
  }

  function bindEvents() {
    var input = $("#participant-id");
    var startBtn = $("#start-btn");

    input.addEventListener("input", function () {
      startBtn.disabled = input.value.trim() === "";
    });

    function begin() {
      if (!input.value.trim()) return;
      uid = generateUid();
      startSession();
    }

    startBtn.addEventListener("click", begin);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && input.value.trim()) begin();
    });

    $$(".emotion-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        labels[idx] = btn.dataset.emotion;
        $$(".emotion-btn").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        $("#next-btn").disabled = false;
      });
    });

    $("#prev-btn").addEventListener("click", function () {
      if (idx > 0) { idx--; renderTweet(); }
    });

    $("#next-btn").addEventListener("click", function () {
      if (idx < PER_SESSION - 1) { idx++; renderTweet(); }
      else { buildReview(); show("review"); }
    });

    $("#submit-btn").addEventListener("click", submit);

    $("#restart-btn").addEventListener("click", startSession);
  }

  fetch("tweets.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      allTweets = data;
      bindEvents();
    });
})();
