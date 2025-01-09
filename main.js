document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(function(navLink) {
        navLink.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = navLink.getAttribute('href');
            const targetOffsetTop = document.querySelector(targetId).offsetTop;
            window.scrollTo({
                top: targetOffsetTop - 100, 
                behavior: 'smooth'
            });
        });
    });
});