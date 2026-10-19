/* =========================================================
   AL AUTO — Auth (Firebase atau LocalStorage fallback)
   Jika Firebase belum dikonfigurasi, sistem berjalan dalam
   "mode lokal" (data di localStorage) agar mudah dicoba.
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.firebaseConfig || {};
  var isConfigured = cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY" && cfg.projectId && cfg.projectId !== "YOUR_PROJECT_ID";

  window.ALAuth = {
    ready: false,
    configured: isConfigured,
    localMode: !isConfigured,
    currentUser: null,
    userDoc: null,
    isAdmin: false,
    isApproved: false,
    db: null,
    init: init,
    login: login,
    register: register,
    logout: logout,
    onAuthChanged: null
  };

  // ---------- Helpers ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid() { return "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

  // ---------- Local DB (localStorage) ----------
  var LK_USERS = "alauto_users";
  var LK_ATT = "alauto_attendance";
  var LK_SESSION = "alauto_session";

  function readUsers() { try { return JSON.parse(localStorage.getItem(LK_USERS) || "[]"); } catch (e) { return []; } }
  function writeUsers(u) { localStorage.setItem(LK_USERS, JSON.stringify(u)); }
  function readAtt() { try { return JSON.parse(localStorage.getItem(LK_ATT) || "[]"); } catch (e) { return []; } }
  function writeAtt(a) { localStorage.setItem(LK_ATT, JSON.stringify(a)); }

  function seedAdmin() {
    var users = readUsers();
    if (users.length === 0) {
      users.push({
        uid: "admin",
        name: "Admin",
        email: "admin@alauto.com",
        password: "admin123",
        phone: "",
        role: "admin",
        status: "approved",
        createdAt: new Date().toISOString()
      });
      writeUsers(users);
    }
  }

  // Firestore-like shim
  function makeCollection(name) {
    var store = (name === "users") ? readUsers : readAtt;
    var save = (name === "users") ? writeUsers : writeAtt;
    var idField = (name === "users") ? "uid" : "id";

    function matches(doc, field, op, val) {
      if (op === "==") return doc[field] === val;
      return true;
    }

    var col = {
      _filters: [],
      _order: null,
      _limit: null,
      where: function (field, op, val) {
        var c = cloneCol(col);
        c._filters.push({ field: field, op: op, val: val });
        return c;
      },
      orderBy: function (field, dir) {
        var c = cloneCol(col);
        c._order = { field: field, dir: dir || "asc" };
        return c;
      },
      limit: function (n) {
        var c = cloneCol(col);
        c._limit = n;
        return c;
      },
      doc: function (id) {
        return {
          get: function () {
            var users = store();
            var found = users.find(function (u) { return (u.uid || u.id) === id; });
            return Promise.resolve({ exists: !!found, data: function () { return found ? Object.assign({}, found) : null; } });
          },
          set: function (data) {
            var users = store();
            var idx = users.findIndex(function (u) { return (u.uid || u.id) === id; });
            var obj = Object.assign({}, data);
            if (name === "users") obj.uid = id; else obj.id = id;
            if (idx >= 0) users[idx] = Object.assign({}, users[idx], obj);
            else users.push(obj);
            save(users);
            return Promise.resolve();
          },
          update: function (data) {
            var users = store();
            var idx = users.findIndex(function (u) { return (u.uid || u.id) === id; });
            if (idx >= 0) {
              users[idx] = Object.assign({}, users[idx], data);
              save(users);
            }
            return Promise.resolve();
          },
          delete: function () {
            var users = store();
            var idx = users.findIndex(function (u) { return (u.uid || u.id) === id; });
            if (idx >= 0) {
              users.splice(idx, 1);
              save(users);
            }
            return Promise.resolve();
          }
        };
      },
      add: function (data) {
        var items = store();
        var obj = Object.assign({}, data);
        if (name === "users") {
          if (!obj.uid) obj.uid = uid();
        } else {
          obj.id = "a_" + Math.random().toString(36).slice(2, 10);
        }
        if (!obj.createdAt) obj.createdAt = new Date().toISOString();
        items.push(obj);
        save(items);
        return Promise.resolve({ id: obj.uid || obj.id });
      },
      get: function () {
        var items = store().slice();
        // filter
        col._filters.forEach(function (f) {
          items = items.filter(function (d) { return matches(d, f.field, f.op, f.val); });
        });
        // order
        if (col._order) {
          var field = col._order.field;
          var dir = col._order.dir;
          items.sort(function (a, b) {
            var va = a[field], vb = b[field];
            if (va < vb) return dir === "desc" ? 1 : -1;
            if (va > vb) return dir === "desc" ? -1 : 1;
            return 0;
          });
        }
        // limit
        if (col._limit) items = items.slice(0, col._limit);
        var snap = {
          empty: items.length === 0,
          size: items.length,
          forEach: function (cb) { items.forEach(function (d) { cb({ data: function () { return Object.assign({}, d); }, id: d.uid || d.id }); }); }
        };
        return Promise.resolve(snap);
      }
    };
    function cloneCol(c) {
      var n = makeCollection(name);
      n._filters = c._filters.slice();
      n._order = c._order ? Object.assign({}, c._order) : null;
      n._limit = c._limit;
      return n;
    }
    return col;
  }

  function localInit() {
    seedAdmin();
    window.ALAuth.localMode = true;
    window.ALAuth.ready = true;
    window.ALAuth.db = {
      collection: function (name) { return makeCollection(name); }
    };
    // shim firebase global for absensi.js
    window.firebase = {
      firestore: {
        FieldValue: { serverTimestamp: function () { return new Date().toISOString(); } }
      }
    };
    // restore session
    try {
      var sess = JSON.parse(localStorage.getItem(LK_SESSION) || "null");
      if (sess) {
        var users = readUsers();
        var u = users.find(function (x) { return x.uid === sess.uid; });
        if (u) {
          window.ALAuth.currentUser = { uid: u.uid, email: u.email };
          window.ALAuth.userDoc = Object.assign({}, u);
          window.ALAuth.isAdmin = u.role === "admin";
          window.ALAuth.isApproved = u.status === "approved";
        }
      }
    } catch (e) {}
    updateNavbar(window.ALAuth.currentUser);
    if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(window.ALAuth.currentUser);
  }

  // ---------- Firebase init ----------
  async function firebaseInit() {
    var FB_VERSION = "10.12.2";
    var BASE = "https://www.gstatic.com/firebasejs/" + FB_VERSION + "/";
    await loadScript(BASE + "firebase-app-compat.js");
    await loadScript(BASE + "firebase-auth-compat.js");
    await loadScript(BASE + "firebase-firestore-compat.js");
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    window.ALAuth.db = firebase.firestore();
    window.ALAuth.auth = firebase.auth();
    window.ALAuth.ready = true;
    window.firebaseReady = true;
    window.ALAuth.auth.onAuthStateChanged(async function (user) {
      window.ALAuth.currentUser = user;
      if (user) {
        try {
          var snap = await window.ALAuth.db.collection("users").doc(user.uid).get();
          window.ALAuth.userDoc = snap.exists ? snap.data() : null;
          window.ALAuth.isAdmin = !!(window.ALAuth.userDoc && window.ALAuth.userDoc.role === "admin");
          window.ALAuth.isApproved = !!(window.ALAuth.userDoc && window.ALAuth.userDoc.status === "approved");
        } catch (e) {
          window.ALAuth.userDoc = null; window.ALAuth.isAdmin = false; window.ALAuth.isApproved = false;
        }
      } else {
        window.ALAuth.userDoc = null; window.ALAuth.isAdmin = false; window.ALAuth.isApproved = false;
      }
      updateNavbar(user);
      if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(user);
    });
  }

  function updateNavbar(user) {
    var nav = document.getElementById("nav-menu");
    if (!nav) return;
    nav.querySelectorAll(".nav-auth").forEach(function (el) { el.remove(); });
    var li = document.createElement("li");
    li.className = "nav-item nav-auth";
    if (user) {
      var name = (window.ALAuth.userDoc && (window.ALAuth.userDoc.name || window.ALAuth.userDoc.nama)) || (user.email || "User");
      li.innerHTML = '<a class="nav-link" href="#" id="auth-logout">Logout</a>';
      nav.appendChild(li);
      var logoutBtn = document.getElementById("auth-logout");
      if (logoutBtn) logoutBtn.addEventListener("click", function (e) { e.preventDefault(); logout(); });
      if (window.ALAuth.isAdmin) {
        var adminLi = document.createElement("li");
        adminLi.className = "nav-item nav-auth";
        var isAdminPage = window.location.pathname.toLowerCase().endsWith("admin.html");
        adminLi.innerHTML = '<a class="nav-link ' + (isAdminPage ? "active" : "") + '" href="admin.html">Admin Panel</a>';
        nav.appendChild(adminLi);
      }
    } else {
      li.innerHTML = '<a class="nav-link" href="login.html">Login / Daftar</a>';
      nav.appendChild(li);
    }
  }

  async function login(email, password) {
    if (window.ALAuth.localMode) {
      var users = readUsers();
      var u = users.find(function (x) { return x.email === email && x.password === password; });
      if (!u) throw new Error("Email atau password salah.");
      localStorage.setItem(LK_SESSION, JSON.stringify({ uid: u.uid }));
      window.ALAuth.currentUser = { uid: u.uid, email: u.email };
      window.ALAuth.userDoc = Object.assign({}, u);
      window.ALAuth.isAdmin = u.role === "admin";
      window.ALAuth.isApproved = u.status === "approved";
      updateNavbar(window.ALAuth.currentUser);
      if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(window.ALAuth.currentUser);
      return { user: window.ALAuth.currentUser };
    }
    if (!window.ALAuth.ready) throw new Error("Firebase belum siap.");
    return window.ALAuth.auth.signInWithEmailAndPassword(email, password);
  }

  async function register(name, email, password, phone) {
    if (window.ALAuth.localMode) {
      var users = readUsers();
      if (users.some(function (x) { return x.email === email; })) throw new Error("Email sudah terdaftar.");
      var u = { uid: uid(), name: name, email: email, password: password, phone: phone || "", role: "user", status: "pending", createdAt: new Date().toISOString() };
      users.push(u);
      writeUsers(users);
      return { user: { uid: u.uid, email: u.email } };
    }
    if (!window.ALAuth.ready) throw new Error("Firebase belum siap.");
    var cred = await window.ALAuth.auth.createUserWithEmailAndPassword(email, password);
    await window.ALAuth.db.collection("users").doc(cred.user.uid).set({
      name: name, email: email, phone: phone || "", role: "user", status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return cred;
  }

  async function logout() {
    if (window.ALAuth.localMode) {
      localStorage.removeItem(LK_SESSION);
      window.ALAuth.currentUser = null;
      window.ALAuth.userDoc = null;
      window.ALAuth.isAdmin = false;
      window.ALAuth.isApproved = false;
      updateNavbar(null);
      if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(null);
      return;
    }
    if (window.ALAuth.ready) await window.ALAuth.auth.signOut();
  }

  async function init() {
    if (!isConfigured) {
      localInit();
      return;
    }
    try { await firebaseInit(); }
    catch (e) { console.error("Gagal init Firebase:", e); localInit(); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
