/* =========================================================
   AL AUTO — Halaman Pendaftaran (contact)
   Formulir pendaftaran: harga otomatis, validasi,
   dan pengiriman data via WhatsApp.
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var nameInput = document.getElementById("name");
  var phoneInput = document.getElementById("phone");
  var addressInput = document.getElementById("address");
  var packageSelect = document.getElementById("package");
  var priceInput = document.getElementById("price");

  var WHATSAPP_NUMBER = "628979480919";

  /* ---------- Data paket & harga ---------- */
  var PACKAGES = {
    "Paket Bisa Manual": { price: "Rp800.000", sessions: "10x pertemuan", unit: "1x pertemuan 1 jam" },
    "Paket Bisa Matic": { price: "Rp800.000", sessions: "10x pertemuan", unit: "1x pertemuan 1 jam" },
    "Paket Mahir Manual": { price: "Rp1.400.000", sessions: "20x pertemuan", unit: "1x pertemuan 1 jam" },
    "Paket Mahir Matic": { price: "Rp1.400.000", sessions: "25x pertemuan", unit: "1x pertemuan 1 jam" }
  };

  function updatePrice() {
    var data = PACKAGES[packageSelect.value];
    priceInput.value = data
      ? data.price + " — " + data.sessions + ", " + data.unit
      : "";
  }

  packageSelect.addEventListener("change", updatePrice);

  /* ---------- Isi otomatis paket dari URL (contact.html?paket=...) ---------- */
  var params = new URLSearchParams(window.location.search);
  var packageFromUrl = params.get("paket");

  if (packageFromUrl && PACKAGES[packageFromUrl]) {
    packageSelect.value = packageFromUrl;
    updatePrice();
  }

  /* ---------- Validasi ---------- */
  function setError(field, message) {
    clearError(field);
    field.classList.add("is-invalid");
    var msg = document.createElement("small");
    msg.className = "field-error";
    msg.textContent = message;
    field.parentNode.appendChild(msg);
  }

  function clearError(field) {
    field.classList.remove("is-invalid");
    var existing = field.parentNode.querySelector(".field-error");
    if (existing) existing.remove();
  }

  function validate() {
    var isValid = true;

    if (nameInput.value.trim().length < 2) {
      setError(nameInput, "Mohon isi nama lengkap Anda.");
      isValid = false;
    } else {
      clearError(nameInput);
    }

    var phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      setError(phoneInput, "Mohon isi nomor handphone yang valid (minimal 9 digit).");
      isValid = false;
    } else {
      clearError(phoneInput);
    }

    if (addressInput.value.trim().length < 3) {
      setError(addressInput, "Mohon isi alamat Anda.");
      isValid = false;
    } else {
      clearError(addressInput);
    }

    if (!packageSelect.value) {
      setError(packageSelect, "Mohon pilih paket kursus.");
      isValid = false;
    } else {
      clearError(packageSelect);
    }

    return isValid;
  }

  [nameInput, phoneInput, addressInput, packageSelect].forEach(function (field) {
    field.addEventListener("input", function () {
      if (field.classList.contains("is-invalid")) validate();
    });
    field.addEventListener("change", function () {
      if (field.classList.contains("is-invalid")) validate();
    });
  });

  /* ---------- Kirim via WhatsApp + simpan ke database ---------- */
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validate()) {
      if (window.showToast) {
        window.showToast("Mohon lengkapi formulir pendaftaran terlebih dahulu.");
      }
      return;
    }

    var packageName = packageSelect.value;
    var packageData = PACKAGES[packageName];

    var message =
      "Halo AL AUTO, saya ingin mendaftar kursus mengemudi.\n" +
      "\n" +
      "Nama: " + nameInput.value.trim() + "\n" +
      "No. HP: " + phoneInput.value.trim() + "\n" +
      "Alamat: " + addressInput.value.trim() + "\n" +
      "Paket: " + packageName + "\n" +
      "Harga: " + packageData.price + " (" + packageData.sessions + ", " + packageData.unit + ")";

    var whatsappUrl =
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

    // Simpan ke Firestore (jika Firebase aktif)
    if (window.ALAuth && window.ALAuth.ready && window.ALAuth.db) {
      try {
        await window.ALAuth.db.collection("registrations").add({
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          address: addressInput.value.trim(),
          package: packageName,
          price: packageData.price,
          status: "baru",
          createdAt: new Date().toISOString()
        });
      } catch (e) { console.warn("Gagal simpan pendaftaran:", e); }
    }

    window.open(whatsappUrl, "_blank");

    if (window.showToast) {
      window.showToast("Terima kasih! Formulir Anda siap dikirim melalui WhatsApp.");
    }

    form.reset();
    priceInput.value = "";
  });
})();
