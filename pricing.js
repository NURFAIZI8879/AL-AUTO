document.addEventListener("DOMContentLoaded", function() {
    var elements = document.querySelectorAll('.fade-in');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible'); // Hapus kelas 'visible' saat elemen tidak terlihat
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(function(element) {
        observer.observe(element);
    });
});
