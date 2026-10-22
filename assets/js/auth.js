/* =========================================================
   AL AUTO — Auth (Firebase Auth + Firestore)
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.firebaseConfig || {};
  var isConfigured = cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY" && cfg.projectId && cfg.projectId !== "YOUR_PROJECT_ID";

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

  window.ALAuth = {
    ready: false,
    configured: isConfigured,
    currentUser: null,
    userDoc: null,
    isAdmin: false,
    isApproved: false,
    init: init,
    login: login,
    register: register,
    logout: logout,
    onAuthChanged: null
  };

  async function init() {
    if (!isConfigured) {
      console.warn("Firebase belum dikonfigurasi. Mode demo.");
      updateNavbar(null);
      window.ALAuth.ready = true;
      if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(null);
      return;
    }
    try {
      var FB_VERSION = "10.12.2";
      var BASE = "https://www.gstatic.com/firebasejs/" + FB_VERSION + "/";
      await loadScript(BASE + "firebase-app-compat.js");
      await loadScript(BASE + "firebase-auth-compat.js");
      await loadScript(BASE + "firebase-firestore-compat.js");
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      window.ALAuth.db = firebase.firestore();
      window.ALAuth.auth = firebase.auth();
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
        if (!window.ALAuth.ready) window.ALAuth.ready = true;
        updateNavbar(user);
        if (typeof window.ALAuth.onAuthChanged === "function") window.ALAuth.onAuthChanged(user);
      });
    } catch (e) {
      console.error("Gagal init Firebase:", e);
      window.ALAuth.ready = true;
    }
  }

  function updateNavbar(user) {
    var nav = document.getElementById("nav-menu");
    if (!nav) return;
    nav.querySelectorAll(".nav-auth").forEach(function (el) { el.remove(); });
    var li = document.createElement("li");
    li.className = "nav-item nav-auth";
    if (user) {
      var name = (window.ALAuth.userDoc && (window.ALAuth.userDoc.name || window.ALAuth.userDoc.nama)) || user.email;
      li.innerHTML = '<a class="nav-link" href="#" id="auth-logout">Logout</a>';
      nav.appendChild(li);
      var logoutBtn = document.getElementById("auth-logout");
      if (logoutBtn) logoutBtn.addEventListener("click", function (e) { e.preventDefault(); logout(); });
      if (window.ALAuth.isAdmin) {
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

  async function login(email, password) {
    if (!window.ALAuth.ready) throw new Error("Firebase belum siap.");
    var cred = await window.ALAuth.auth.signInWithEmailAndPassword(email, password);
    return cred;
  }

  async function register(name, email, password, phone) {
    if (!window.ALAuth.ready) throw new Error("Firebase belum siap.");
    var cred = await window.ALAuth.auth.createUserWithEmailAndPassword(email, password);
    try { await cred.user.sendEmailVerification(); } catch (e) { console.warn("Gagal kirim verifikasi email:", e); }
    await window.ALAuth.db.collection("users").doc(cred.user.uid).set({
      name: name, email: email, phone: phone || "", role: "user", status: "pending",
      emailVerified: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return cred;
  }

  async function logout() {
    if (window.ALAuth.ready && window.ALAuth.auth) await window.ALAuth.auth.signOut();
    window.location.href = "index.html";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
