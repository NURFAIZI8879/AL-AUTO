/* =========================================================
   AL AUTO — Auth (Backend API)
   Menggunakan .NET backend (http://localhost:5000).
   ========================================================= */
(function () {
  "use strict";

  var API_BASE = "http://localhost:5000";
  var TOKEN_KEY = "alauto_token";

  window.ALAuth = {
    ready: false,
    currentUser: null,
    userDoc: null,
    isAdmin: false,
    isApproved: false,
    apiBase: API_BASE,
    init: init,
    login: login,
    register: register,
    logout: logout,
    onAuthChanged: null,
    db: null
  };

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }

  async function api(path, opts) {
    opts = opts || {};
    var headers = opts.headers || {};
    headers["Content-Type"] = "application/json";
    var t = getToken();
    if (t) headers["Authorization"] = "Bearer " + t;
    var res = await fetch(API_BASE + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if (!res.ok) {
      var err = await res.text();
      throw new Error(err || ("HTTP " + res.status));
    }
    if (res.status === 204) return null;
    return res.json();
  }

  // ---- DB shim (Firestore-like) ----
  function makeCollection(name) {
    return {
      _filters: [], _order: null, _limit: null,
      where: function () { return this; },
      orderBy: function () { return this; },
      limit: function () { return this; },
      doc: function (id) {
        return {
          get: async function () {
            try {
              if (name === "users") {
                var u = await api("/api/users/" + id); // may not exist; fallback
                return { exists: true, data: function () { return u; } };
              }
            } catch (e) {}
            // fallback: fetch all and find
            if (name === "users") {
              var list = await api("/api/users");
              var found = list.find(function (x) { return x.uid === id; });
              return { exists: !!found, data: function () { return found; } };
            }
            return { exists: false, data: function () { return null; } };
          },
          set: async function (data) {
            if (name === "users") {
              await api("/api/users", { method: "POST", body: { name: data.name, email: data.email, phone: data.phone, password: data.password || "changeme", role: data.role || "user", status: data.status || "pending" } });
            }
          },
          update: async function (data) {
            if (name === "users") {
              await api("/api/users/" + id, { method: "PUT", body: { name: data.name, email: data.email, phone: data.phone, role: data.role, status: data.status, password: data.password } });
            }
          },
          delete: async function () {
            if (name === "users") await api("/api/users/" + id, { method: "DELETE" });
            if (name === "attendance") await api("/api/attendance/" + id, { method: "DELETE" });
          }
        };
      },
      add: async function (data) {
        if (name === "attendance") {
          var r = await api("/api/attendance", { method: "POST", body: { idAbsen: data.idAbsen, idPeserta: data.idPeserta, tanggal: data.tanggal, status: data.status } });
          return { id: r.id };
        }
        if (name === "users") {
          var r2 = await api("/api/users", { method: "POST", body: { name: data.name, email: data.email, phone: data.phone, password: data.password || "changeme", role: data.role || "user", status: data.status || "pending" } });
          return { id: r2.uid };
        }
      },
      get: async function () {
        var items = [];
        if (name === "users") {
          try { items = await api("/api/users"); } catch (e) { items = []; }
        } else if (name === "attendance") {
          try { items = await api("/api/attendance"); } catch (e) { items = []; }
        }
        // normalize to docs with .data() and .id
        var docs = items.map(function (it) {
          return { id: it.uid || it.id, data: function () { return it; } };
        });
        return { empty: docs.length === 0, size: docs.length, forEach: function (cb) { docs.forEach(cb); } };
      }
    };
  }

  async function restoreSession() {
    var token = getToken();
    if (!token) { window.ALAuth.currentUser = null; window.ALAuth.userDoc = null; window.ALAuth.isAdmin = false; window.ALAuth.isApproved = false; return; }
    try {
      var me = await api("/api/auth/me");
      window.ALAuth.currentUser = { uid: me.uid, email: me.email };
      window.ALAuth.userDoc = me;
      window.ALAuth.isAdmin = me.role === "admin";
      window.ALAuth.isApproved = me.status === "approved";
    } catch (e) {
      setToken(null);
      window.ALAuth.currentUser = null;
      window.ALAuth.userDoc = null;
      window.ALAuth.isAdmin = false;
      window.ALAuth.isApproved = false;
    }
  }

  async function init() {
    window.ALAuth.db = { collection: function (name) { return makeCollection(name); } };
    await restoreSession();
    window.ALAuth.ready = true;
    updateNavbar(window.ALAuth.currentUser);
    if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(window.ALAuth.currentUser);
  }

  async function login(email, password) {
    var res = await api("/api/auth/login", { method: "POST", body: { email: email, password: password } });
    setToken(res.token);
    window.ALAuth.currentUser = { uid: res.user.uid, email: res.user.email };
    window.ALAuth.userDoc = res.user;
    window.ALAuth.isAdmin = res.user.role === "admin";
    window.ALAuth.isApproved = res.user.status === "approved";
    updateNavbar(window.ALAuth.currentUser);
    if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(window.ALAuth.currentUser);
    return res;
  }

  async function register(name, email, password, phone) {
    var res = await api("/api/auth/register", { method: "POST", body: { name: name, email: email, password: password, phone: phone } });
    return res;
  }

  async function logout() {
    setToken(null);
    window.ALAuth.currentUser = null;
    window.ALAuth.userDoc = null;
    window.ALAuth.isAdmin = false;
    window.ALAuth.isApproved = false;
    updateNavbar(null);
    if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(null);
    window.location.href = "index.html";
  }

  function updateNavbar(user) {
    var nav = document.getElementById("nav-menu");
    if (!nav) return;
    nav.querySelectorAll(".nav-auth").forEach(function (el) { el.remove(); });
    var li = document.createElement("li");
    li.className = "nav-item nav-auth";
    if (user) {
      li.innerHTML = '<a class="nav-link" href="#" id="auth-logout">Logout</a>';
      nav.appendChild(li);
      var logoutBtn = document.getElementById("auth-logout");
      if (logoutBtn) logoutBtn.addEventListener("click", function (e) { e.preventDefault(); logout(); });
      var ud = window.ALAuth.userDoc || {};
      if (ud.role === "admin") {
        var adminLi = document.createElement("li");
        adminLi.className = "nav-item nav-auth";
        var isAdminPage = window.location.pathname.toLowerCase().endsWith("panel-admin.html");
        adminLi.innerHTML = '<a class="nav-link ' + (isAdminPage ? "active" : "") + '" href="panel-admin.html">Admin Panel</a>';
        nav.appendChild(adminLi);
      }
    } else {
      li.innerHTML = '<a class="nav-link" href="login.html">Login / Daftar</a>';
      nav.appendChild(li);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
