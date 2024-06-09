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
let listAccount = JSON.parse(localStorage.getItem("accounts")) || [
    {
        username: "admin",
        password :"admin1"
    }
];
let isLogin = localStorage.getItem("token")? true :false
function CheckLogin(){
    if(isLogin){
        window.location.href = "index.html"
    }

}
function Login(){
    event.preventDefault();
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value
    let rememberMe = document.getElementById("rememberMeCheckbox").checked;
    let checkLogin = listAccount.some(value =>value.username === username && value.password ===password)
    if(checkLogin){
        localStorage.setItem("token",username)
        isLogin = true
        if (rememberMe) {
            localStorage.setItem("rememberedUsername", username);
        } else {
            localStorage.removeItem("rememberedUsername");
        }
        CheckLogin()
    }else{
        alert("Wrong username or password!")
    }
}
window.onload = function () {
    autoFillLoginInfo();
};
function autoFillLoginInfo() {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
        document.getElementById("username").value = rememberedUsername;
    }
}
function ChangePassword() {
    event.preventDefault();
    let username = document.getElementById("confirmusername").value;
    let currentPassword = document.getElementById("CurrentPassword").value;
    let newPassword = document.getElementById("NewPassword").value;
    let confirmPassword = document.getElementById("ConfirmPassword").value;

    let accountIndex = listAccount.findIndex(account => account.username === username && account.password === currentPassword);

    if (accountIndex === -1) {
        alert("Current username or password is incorrect.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
    }

    listAccount[accountIndex].password = newPassword;
    localStorage.setItem("accounts", JSON.stringify(listAccount));
    alert("Password has been successfully changed.");
}
// Hiển thị form đổi mật khẩu
function showChangePasswordForm() {
    event.preventDefault();
    document.getElementById("form-login").style.display = "none";
    document.getElementById("form-changepassword").style.display = "block";
}
// Hiển thị form đăng nhập
function showLoginForm() {
    event.preventDefault();
    document.getElementById("form-login").style.display = "block";
    document.getElementById("form-changepassword").style.display = "none";
}