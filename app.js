const NAV = [
  ["overview", "Overview"],
  ["trips", "My Trips"],
  ["audit", "Travel Audit"],
  ["assistant", "AI Assistant"],
  ["approvals", "Approval Center"],
  ["apps", "Connected Apps"],
  ["voice", "Voice Briefings"],
  ["activity", "Activity History"],
  ["settings", "Settings"],
];

const S = {
  audit: { status: "idle", step: 0, done: false },
  sel: new Set(),
  filter: "All",
  chat: [],
  approvals: [
    {
      id: 1,
      title: "Add “Check passport validity” task",
      reason: "Passport expiry (Mar 2027) is under 6 months after return date.",
      src: "Google Tasks",
      orig: "No passport task in list",
      prop: "Create task due Dec 1: “Check passport validity”",
      risk: "Low — adds one task",
      status: "pending",
    },
    {
      id: 2,
      title: "Move “Team sync” to avoid flight",
      reason: "Event overlaps flight LH 401 departure by 45 min.",
      src: "Google Calendar",
      orig: "Team sync — Dec 12, 09:00–10:00",
      prop: "Reschedule to Dec 11, 09:00–10:00",
      risk: "Medium — notifies 4 attendees",
      status: "pending",
    },
    {
      id: 3,
      title: "Add “Pack rain jacket” to checklist",
      reason: "Forecast shows rain on 4 of 7 days in Lisbon.",
      src: "Open-Meteo",
      orig: "Checklist has no rain gear",
      prop: "Create task: “Pack rain jacket”",
      risk: "Low — adds one task",
      status: "pending",
    },
    {
      id: 4,
      title: "Add travel insurance reminder",
      reason: "No insurance confirmation found in itinerary emails.",
      src: "Gmail",
      orig: "No insurance email found",
      prop: "Create task due Dec 5: “Buy travel insurance”",
      risk: "Low — adds one task",
      status: "pending",
    },
  ],
  act: [
    ["10:42", "Gmail itinerary analyzed", "Gmail", "READ", "n/a", "Completed"],
    [
      "10:43",
      "Calendar conflict detected",
      "Google Calendar",
      "READ",
      "n/a",
      "Completed",
    ],
    [
      "10:44",
      "Missing checklist items identified",
      "Google Tasks",
      "READ",
      "n/a",
      "Completed",
    ],
    [
      "10:45",
      "Approval requested (4 items)",
      "PackPilot",
      "SUGGEST",
      "Pending",
      "Completed",
    ],
  ],
  trips: [
    ["Lisbon, Portugal", "Dec 12", "Dec 19", 2, "Upcoming", 78],
    ["Tokyo, Japan", "Feb 3", "Feb 14", 1, "Upcoming", 52],
    ["Berlin, Germany", "Sep 1", "Sep 5", 1, "Completed", 100],
  ],
  apps: [
    ["Gmail", "Reads itinerary emails", "Read: inbox search · Write: none"],
    [
      "Google Calendar",
      "Reads events, proposes changes",
      "Read: events · Write: edit events (approval only)",
    ],
    [
      "Google Tasks",
      "Reads and updates checklists",
      "Read: tasks · Write: create tasks (approval only)",
    ],
    ["Open-Meteo", "Weather forecasts", "Read: forecast · Write: none"],
  ],
  steps: [
    "Retrieve itinerary information",
    "Analyze email information",
    "Review calendar events",
    "Check existing tasks",
    "Retrieve weather information",
    "Detect missing essentials",
    "Identify schedule conflicts",
    "Generate readiness score",
    "Prepare suggested updates",
  ],
};

const $ = (s) => document.querySelector(s);

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      })[c],
  );

const pill = (s) => `<span class="pill ${s.toLowerCase()}">${s}</span>`;

const ring = (v) => `
  <svg viewBox="0 0 120 120" width="130" height="130" role="img" aria-label="${v} out of 100">
    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bd)" stroke-width="10"/>
    <circle
      cx="60"
      cy="60"
      r="52"
      fill="none"
      stroke="${v >= 80 ? "var(--ok)" : "var(--warn)"}"
      stroke-width="10"
      stroke-linecap="round"
      stroke-dasharray="${3.27 * v} 327"
      transform="rotate(-90 60 60)"
    />
    <text x="60" y="58" text-anchor="middle" font-size="28" font-weight="700" fill="var(--tx)">${v}</text>
    <text x="60" y="76" text-anchor="middle" font-size="11" fill="var(--tx2)">/ 100</text>
  </svg>`;

const pend = () => S.approvals.filter((a) => a.status === "pending").length;

function toast(t) {
  const e = document.createElement("div");
  e.className = "toast";
  e.textContent = t;
  document.body.append(e);
  setTimeout(() => e.remove(), 2600);
}

function log(a, app, op, ap, res) {
  const d = new Date();
  S.act.unshift([d.toTimeString().slice(0, 5), a, app, op, ap, res]);
}

const V = {
  overview: () => `
    <h1>Welcome Back, Traveler!</h1>
    <p class="sub">Your Travel, Under Control.</p>

    <div class="grid">
      <div class="card">
        <div class="lbl">Upcoming Trips</div>
        <div class="stat">2</div>
      </div>
      <div class="card">
        <div class="lbl">Missing Essentials</div>
        <div class="stat">3</div>
      </div>
      <div class="card">
        <div class="lbl">Schedule Conflicts</div>
        <div class="stat">1</div>
      </div>
      <div class="card">
        <div class="lbl">Pending Approvals</div>
        <div class="stat" style="color:var(--ora)">${pend()}</div>
      </div>
    </div>
    <br>

    <div class="grid">
      <div class="card" style="text-align:center">
        <h2>Travel Readiness</h2>
        ${ring(78)}
        <div class="pill med">Needs Attention</div>
      </div>

      <div class="card">
        <h2>Recent Activity</h2>
        ${S.act
          .slice(0, 5)
          .map(
            (a) => `
          <div class="step">
            <span class="dot completed">✓</span>
            ${esc(a[1])}
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="card">
        <h2>Upcoming Trips</h2>
        ${S.trips
          .filter((t) => t[4] == "Upcoming")
          .map(
            (t) => `
          <p>
            <b>${t[0]}</b><br>
            <span class="lbl">${t[1]} – ${t[2]} · audit ${t[5]}/100</span>
          </p>
        `,
          )
          .join("")}
        <button class="btn" data-go="audit">Run audit</button>
      </div>
    </div>`,

  trips: () => `
    <h1>My Trips</h1>
    <p class="sub">Upcoming and previous trips.</p>
    <input
      id="q"
      placeholder="Search trips…"
      style="width:100%;margin-bottom:14px"
      value="${esc(S.q || "")}"
    >
    <div class="grid">
      ${S.trips
        .filter((t) => t[0].toLowerCase().includes((S.q || "").toLowerCase()))
        .map(
          (t) => `
          <div class="card">
            <h2>${t[0]}</h2>
            <p class="lbl">${t[1]} → ${t[2]} · ${t[3]} traveler(s)</p>
            <p>
              ${pill(t[4] == "Upcoming" ? "Pending" : "Completed").replace(/Pending|Completed/, t[4])}
              Readiness <b>${t[5]}</b>
            </p>
            <div class="row">
              <button class="btn g" data-toast="Trip detail needs GET /api/trips/:id">View Details</button>
              <button class="btn t" data-go="audit">Run Audit</button>
            </div>
          </div>
        `,
        )
        .join("")}
    </div>`,

  audit: () => {
    const a = S.audit;
    const pct = Math.round((a.step / 9) * 100);

    return `
      <h1>MCP Travel Audit</h1>
      <p class="sub">Lisbon, Portugal · Dec 12 – Dec 19 · 7 days</p>

      <div class="card">
        <div class="row" style="margin-bottom:10px">
          ${["Gmail", "Google Calendar", "Google Tasks", "Open-Meteo"]
            .map((x) => `<span class="pill">${x} · mock</span>`)
            .join("")}
        </div>

        <button class="btn o" data-run ${a.status == "running" ? "disabled" : ""}>
          ${a.status == "running" ? "Running…" : "Run MCP Travel Audit"}
        </button>

        <div class="bar"><i style="width:${pct}%"></i></div>
        ${S.audit.msg ? `<p class="lbl">${esc(S.audit.msg)}</p>` : ""}
        ${V.steps()}
      </div>
      ${a.done ? V.results() : ""}`;
  },

  results: () => `
    <div class="grid">
      <div class="card" style="text-align:center">
        <h2>Readiness Score</h2>
        ${ring(78)}
      </div>

      <div class="card">
        <h2>By category</h2>
        ${[
          ["Documents", 60],
          ["Calendar", 70],
          ["Packing", 75],
          ["Bookings", 95],
        ]
          .map(
            (c) => `
            <div class="lbl">${c[0]} ${c[1]}%</div>
            <div class="bar"><i style="width:${c[1]}%"></i></div>
          `,
          )
          .join("")}
      </div>

      <div class="card">
        <h2>Missing essentials</h2>
        <p>${pill("High")} Passport validity check</p>
        <p>${pill("Med")} Travel insurance</p>
        <p>${pill("Med")} Rain jacket</p>
      </div>

      <div class="card">
        <h2>Schedule conflict</h2>
        <p>Team sync (Dec 12, 09:00) overlaps flight departure by 45 min.</p>
      </div>

      <div class="card">
        <h2>Weather (mock)</h2>
        <p>16–21°C, rain on 4 days. Pack layers and a waterproof jacket.</p>
      </div>
    </div>

    <div class="card">
      <h2>${pend()} suggested actions awaiting approval</h2>
      <p class="lbl">Nothing is written until you approve it.</p>
      <button class="btn o" data-go="approvals">Open Approval Center</button>
    </div>`,

  approvals: () => `
    <h1>Approval Center</h1>
    <p class="sub">PackPilot only suggests. Nothing is written until you approve.</p>

    <div class="row" style="margin-bottom:14px">
      <button class="btn t" data-bulk="approve" ${S.sel.size ? "" : "disabled"}>
        Approve Selected (${S.sel.size})
      </button>
      <button class="btn g" data-bulk="reject" ${S.sel.size ? "" : "disabled"}>
        Reject Selected
      </button>
    </div>

    ${S.approvals
      .map(
        (a) => `
      <div class="card">
        <div class="row">
          ${
            a.status == "pending"
              ? `
            <input
              type="checkbox"
              data-sel="${a.id}"
              ${S.sel.has(a.id) ? "checked" : ""}
              aria-label="Select"
            >
          `
              : ""
          }
          <b>${a.title}</b>
          ${pill(a.status[0].toUpperCase() + a.status.slice(1))}
          <span class="pill">${a.src}</span>
        </div>

        <p class="lbl">Why: ${a.reason}</p>
        <div class="diff">
          <div class="a"><b>Original</b><br>${a.orig}</div>
          <div class="b"><b>Proposed</b><br>${a.prop}</div>
        </div>
        <p class="lbl">Impact: ${a.risk}</p>

        ${
          a.status == "pending"
            ? `
          <div class="row">
            <button class="btn t" data-ap="${a.id}">Approve</button>
            <button class="btn g" data-rj="${a.id}">Reject</button>
          </div>
        `
            : ""
        }
      </div>
    `,
      )
      .join("")}`,

  apps: () => `
    <h1>Connected Apps</h1>
    <p class="sub">Integrations run through the backend MCP service. No live connections exist in this prototype.</p>

    <div class="grid">
      ${S.apps
        .map(
          (a) => `
        <div class="card">
          <h2>${a[0]}</h2>
          <p class="lbl">${a[1]}</p>
          <p><span class="pill">Disconnected</span></p>
          <p class="lbl">Last sync: never · ${a[2]}</p>
          <div class="row">
            <button class="btn t" data-toast="Needs backend: POST /api/integrations/connect">Connect</button>
            <button class="btn g" disabled>Disconnect</button>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>`,

  assistant: () => `
    <h1>AI Assistant</h1>
    <div class="card">
      <div class="chat">
        <div class="msg a">
          Hello! I’m PackPilot, your intelligent travel companion. I can help organize your travel information and make sure nothing important gets missed.
        </div>
        ${S.chat.map((m) => `<div class="msg ${m[0]}">${m[1]}</div>`).join("")}
      </div>

      <div class="row" style="margin:10px 0">
        ${[
          "Audit my upcoming trip",
          "Find missing travel essentials",
          "Check my calendar for conflicts",
          "Give me a weather-based travel briefing",
        ]
          .map((p) => `<button class="btn g" data-chat="${p}">${p}</button>`)
          .join("")}
      </div>

      <div class="row">
        <input id="ci" placeholder="Ask PackPilot…" style="flex:1">
        <button class="btn" data-send>Send</button>
      </div>
      <p class="lbl">Mock replies — no AI backend connected.</p>
    </div>`,

  voice: () => `
    <h1>Voice Briefings</h1>
    <div class="card">
      <p class="pill med">Unavailable — ElevenLabs integration needs the backend</p>
      <p><button class="btn" disabled>Generate Voice Briefing</button></p>
      <div class="bar"><i style="width:0"></i></div>
      <p class="lbl">0:00 / --:--</p>
      <h2>Sample transcript</h2>
      <p>“Your upcoming trip is almost ready. Your itinerary is confirmed, but three checklist items need attention and one calendar conflict requires review.”</p>
    </div>`,

  activity: () => {
    const f = S.filter;
    const rows = S.act.filter(
      (a) =>
        f == "All" ||
        (f == "Read" && a[3] == "READ") ||
        (f == "Write" && a[3] == "WRITE") ||
        (f == "Approved" && a[4] == "Approved") ||
        (f == "Rejected" && a[4] == "Rejected") ||
        (f == "Failed" && a[5] == "Failed"),
    );

    return `
      <h1>Activity History</h1>
      <div class="row" style="margin:12px 0">
        ${["All", "Read", "Write", "Approved", "Rejected", "Failed"]
          .map(
            (x) =>
              `<button class="btn ${x == f ? "" : "g"}" data-f="${x}">${x}</button>`,
          )
          .join("")}
      </div>

      <div class="card tw">
        <table>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>App</th>
            <th>Type</th>
            <th>Approval</th>
            <th>Result</th>
          </tr>
          ${
            rows
              .map(
                (r) => `
            <tr>
              ${r.map((c, i) => `<td>${i == 5 ? pill(c) : esc(c)}</td>`).join("")}
            </tr>
          `,
              )
              .join("") || "<tr><td colspan=6>No matching activity</td></tr>"
          }
        </table>
      </div>`;
  },

  settings: () => `
    <h1>Settings</h1>
    <div class="card">
      <h2>Profile</h2>
      <div class="row">
        <input placeholder="Full name" value="Traveler">
        <input placeholder="Email" value="traveler@example.com">
      </div>
    </div>

    <div class="card">
      <h2>Permissions</h2>
      <p class="lbl">
        Read access: Gmail, Calendar, Tasks, Open-Meteo<br>
        Write access: Calendar, Tasks — only after your approval
      </p>
      <button class="btn g" data-toast="Revoking needs the backend">Review &amp; revoke connections</button>
    </div>

    <div class="card">
      <h2>Notifications</h2>
      <label><input type="checkbox" checked> Email me when approvals are pending</label>
    </div>

    <div class="card">
      <h2>Security</h2>
      <button class="btn g" data-toast="Needs auth backend">Change password</button>
      <button class="btn r" data-toast="Logged out (mock)">Logout</button>
    </div>`,
};

V.steps = () => {
  const a = S.audit;
  return a.status == "idle"
    ? ""
    : S.steps
        .map((t, i) => {
          const st =
            i < a.step
              ? "completed"
              : i == a.step && a.status == "running"
                ? "processing"
                : "waiting";

          return `
      <div class="step">
        <span class="dot ${st}">${st == "completed" ? "✓" : i + 1}</span>
        ${t} <span class="lbl">${st}</span>
      </div>`;
        })
        .join("");
};

function render() {
  const r = (location.hash || "#overview").slice(1);
  const k = V[r] ? r : "overview";

  $("#side").innerHTML = `
    <div class="logo">Pack<b>Pilot</b> ✈</div>
    ${NAV.map(
      (n) => `
      <a href="#${n[0]}" class="${n[0] == k ? "on" : ""}">
        ${n[1]}
        ${n[0] == "approvals" && pend() ? `<span class="pill pending">${pend()}</span>` : ""}
      </a>
    `,
    ).join("")}
  `;

  $("#main").innerHTML = `
    <div class="top"><button class="menu" data-menu>☰ Menu</button></div>
    <div class="banner">Prototype: all data is mock. No Gmail, Calendar, Tasks or weather account is connected.</div>
    ${V[k]()}
  `;
  $("#side").classList.remove("open");
}

function runAudit() {
  const a = S.audit;
  a.status = "running";
  a.step = 0;
  a.done = false;
  a.msg = "Connecting to MCP service (mock)…";
  render();

  const t = setInterval(() => {
    a.step++;
    a.msg = S.steps[Math.min(a.step, 8)] + "…";

    if (a.step >= 9) {
      clearInterval(t);
      a.status = "idle";
      a.done = true;
      a.msg = "Audit complete (mock results).";
      log("Travel audit run", "MCP", "READ", "n/a", "Completed");
    }

    render();
  }, 550);
}

function confirm_(ids, kind) {
  const n = ids.length;

  $("#ov").innerHTML = `
    <div class="modal">
      <div class="card">
        <h2>${kind == "approve" ? "Approve" : "Reject"} ${n} change${n > 1 ? "s" : ""}?</h2>
        <p class="lbl">
          ${
            kind == "approve"
              ? "This sends a write request to the MCP service. You can’t undo it from here."
              : "The suggestion will be discarded; no data changes."
          }
        </p>
        <div class="row">
          <button class="btn ${kind == "approve" ? "t" : "r"}" data-yes>Confirm</button>
          <button class="btn g" data-no>Cancel</button>
        </div>
      </div>
    </div>
  `;
  S.pendingAct = [ids, kind];
}

function apply() {
  const [ids, kind] = S.pendingAct;
  $("#ov").innerHTML = "";
  S.sel.clear();

  ids.forEach((id) => {
    const a = S.approvals.find((x) => x.id == id);

    if (kind == "reject") {
      a.status = "rejected";
      log("Rejected: " + a.title, a.src, "WRITE", "Rejected", "Completed");
      return;
    }

    a.status = "approved";
    log("Approved: " + a.title, a.src, "WRITE", "Approved", "Processing");

    setTimeout(() => {
      a.status = "processing";
      render();
    }, 600);

    setTimeout(() => {
      a.status = "completed";
      log(
        "Executed (mock): " + a.title,
        a.src,
        "WRITE",
        "Approved",
        "Completed",
      );
      render();
    }, 1800);
  });

  render();
  toast("Decision recorded");
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("button,input[type=checkbox]");
  if (!t) return;

  const d = t.dataset;

  if (d.go) {
    location.hash = d.go;
  } else if (d.toast !== undefined) {
    toast(d.toast);
  } else if ("run" in d) {
    runAudit();
  } else if (d.ap) {
    confirm_([+d.ap], "approve");
  } else if (d.rj) {
    confirm_([+d.rj], "reject");
  } else if (d.bulk) {
    confirm_([...S.sel], d.bulk);
  } else if ("yes" in d) {
    apply();
  } else if ("no" in d) {
    $("#ov").innerHTML = "";
  } else if (d.sel) {
    +d.sel && (S.sel.has(+d.sel) ? S.sel.delete(+d.sel) : S.sel.add(+d.sel));
    render();
  } else if (d.f) {
    S.filter = d.f;
    render();
  } else if ("menu" in d) {
    $("#side").classList.toggle("open");
  } else if (d.chat || "send" in d) {
    const v = d.chat || $("#ci").value.trim();
    if (!v) return;

    S.chat.push(
      ["u", esc(v)],
      [
        "a",
        "Mock reply: I’d call the MCP audit tool here. Found 3 missing essentials and 1 conflict — see Travel Audit. I’ll never change anything without your approval.",
      ],
    );
    render();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id == "q") {
    S.q = e.target.value;
    const p = e.target.selectionStart;
    render();

    const q = $("#q");
    q.focus();
    q.setSelectionRange(p, p);
  }
});

addEventListener("hashchange", render);
render();
