document.addEventListener("DOMContentLoaded", function() {
    const slideContainer = document.querySelector('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    prevBtn.addEventListener('click', () => {
        slideContainer.scrollBy({
            left: -slideContainer.clientWidth,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        slideContainer.scrollBy({
            left: slideContainer.clientWidth,
            behavior: 'smooth'
        });
    });

    var elements = document.querySelectorAll('.fade-in');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(function(element) {
        observer.observe(element);
    });
});
