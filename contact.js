
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var firstName = document.querySelector('input[name="first_name"]').value;
        var lastName = document.querySelector('input[name="last_name"]').value;
        var email = document.querySelector('input[name="email"]').value;
        var message = document.querySelector('textarea[name="message"]').value;
        
        var whatsappUrl = "https://wa.me/628979480919?text=" 
            + "First Name: " + firstName + "%0a"
            + "Last Name: " + lastName + "%0a"
            + "Email: " + email + "%0a"
            + "Message: " + message;
        
        window.open(whatsappUrl, '_blank');
    });
});