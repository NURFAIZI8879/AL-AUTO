/* =========================================================
   AL AUTO — Halaman Absensi (absen)
   Formulir absensi: validasi + pengiriman via WhatsApp.
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("absen-form");
  if (!form) return;

  var idAbsenInput = document.getElementById("id_absen");
  var idPesertaInput = document.getElementById("id_peserta");
  var tanggalInput = document.getElementById("tanggal_absen");
  var statusSelect = document.getElementById("status");

  var WHATSAPP_NUMBER = "628979480919";

  /* ---------- Tanggal default: hari ini ---------- */
  var today = new Date();
  var localDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  tanggalInput.value = localDate;
  tanggalInput.max = localDate;

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

    if (idAbsenInput.value.trim().length < 2) {
      setError(idAbsenInput, "Mohon isi ID absen Anda.");
      isValid = false;
    } else {
      clearError(idAbsenInput);
    }

    if (idPesertaInput.value.trim().length < 2) {
      setError(idPesertaInput, "Mohon isi ID peserta Anda.");
      isValid = false;
    } else {
      clearError(idPesertaInput);
    }

    if (!tanggalInput.value) {
      setError(tanggalInput, "Mohon pilih tanggal absen.");
      isValid = false;
    } else {
      clearError(tanggalInput);
    }

    if (!statusSelect.value) {
      setError(statusSelect, "Mohon pilih status kehadiran.");
      isValid = false;
    } else {
      clearError(statusSelect);
    }

    return isValid;
  }

  [idAbsenInput, idPesertaInput, tanggalInput, statusSelect].forEach(function (field) {
    field.addEventListener("input", function () {
      if (field.classList.contains("is-invalid")) validate();
    });
    field.addEventListener("change", function () {
      if (field.classList.contains("is-invalid")) validate();
    });
  });

  /* ---------- Kirim via WhatsApp ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      if (window.showToast) {
        window.showToast("Mohon lengkapi formulir absensi terlebih dahulu.");
      }
      return;
    }

    var message =
      "Halo AL AUTO, absensi kehadiran peserta:\n" +
      "\n" +
      "ID Absen: " + idAbsenInput.value.trim() + "\n" +
      "ID Peserta: " + idPesertaInput.value.trim() + "\n" +
      "Tanggal: " + tanggalInput.value + "\n" +
      "Status: " + statusSelect.value;

    var whatsappUrl =
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

    window.open(whatsappUrl, "_blank");

    if (window.showToast) {
      window.showToast("Absensi siap dikirim melalui WhatsApp. Terima kasih!");
    }

    form.reset();
    tanggalInput.value = localDate;
  });
})();
