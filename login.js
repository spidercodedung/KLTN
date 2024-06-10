$(document).ready(function() {
    $('.eye').click(function() {
        $(this).toggleClass('open');
        $(this).children('i').toggleClass('fa-eye-slash fa-eye');
        const passwordField = $(this).siblings('.form-input');
        if ($(this).hasClass('open')) {
            passwordField.attr('type', 'text');
        } else {
            passwordField.attr('type', 'password');
        }
    });
});
