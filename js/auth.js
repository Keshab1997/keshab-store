// js/auth.js

const loginForm = document.getElementById('loginForm');

// --- ১. লগইন পেজের লজিক ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // এখানে আপনার গোপন পাসওয়ার্ড সেট করুন
        if (user === "admin" && pass === "123") {
            // ব্রাউজারে মনে রাখবে যে আপনি লগইন করেছেন
            sessionStorage.setItem("isLoggedIn", "true");
            
            // অ্যাডমিন পেজে পাঠিয়ে দেবে
            window.location.href = "admin.html";
        } else {
            document.getElementById('errorMsg').style.display = 'block';
        }
    });
}

// --- ২. অ্যাডমিন পেজ প্রোটেকশন লজিক ---
// আমরা চেক করব ইউজার এখন কোন পেজে আছে
const path = window.location.pathname;

// যদি ফাইলের নাম admin.html অথবা admin-orders.html হয়
if (path.includes("admin.html") || path.includes("admin-orders.html")) {
    
    // চেক করবে লগইন করা আছে কিনা
    const loggedIn = sessionStorage.getItem("isLoggedIn");

    if (!loggedIn) {
        // লগইন না থাকলে সোজা লগইন পেজে পাঠিয়ে দেবে
        alert("You must login first!");
        window.location.href = "login.html";
    }
}

// --- ৩. লগআউট অপশন (অ্যাডমিন পেজের জন্য) ---
function logout() {
    sessionStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}