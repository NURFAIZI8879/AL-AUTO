
$(document).ready(function(){
    /*****Fixed Menu******/
    var secondaryNav = $('.cd-secondary-nav'),
       secondaryNavTopPosition = secondaryNav.offset().top;
       navbar_height = document.querySelector('.navbar').offsetHeight;
       
        $(window).on('scroll', function(){
            if($(window).scrollTop() > secondaryNavTopPosition + navbar_height ) {
                secondaryNav.addClass('is-fixed');    
                document.body.style.paddingTop = navbar_height + 'px';
                
            } else {
                secondaryNav.removeClass('is-fixed');
                document.body.style.paddingTop = '0'
            }
        });
        
});
