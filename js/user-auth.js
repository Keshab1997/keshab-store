// ফর্মগুলো ধরা
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// --- ১. সাইন আপ লজিক ---
if(signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('sName').value;
        const email = document.getElementById('sEmail').value;
        const password = document.getElementById('sPassword').value;
        const errorMsg = document.getElementById('signupError');

        errorMsg.innerText = "Creating Account...";

        // Supabase এ সাইন আপ রিকোয়েস্ট
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: name } // নাম সেভ রাখা
            }
        });

        if (error) {
            errorMsg.innerText = error.message;
        } else {
            alert("Account Created Successfully! Please Login.");
            showLogin(); // লগইন ফর্মে পাঠিয়ে দেবে
        }
    });
}

// --- ২. লগইন লজিক ---
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('lEmail').value;
        const password = document.getElementById('lPassword').value;
        const errorMsg = document.getElementById('loginError');

        errorMsg.innerText = "Logging in...";

        // Supabase এ লগইন রিকোয়েস্ট
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            errorMsg.innerText = "Wrong Email or Password!";
        } else {
            // লোকাল স্টোরেজে ইউজারের নাম রাখা (তাৎক্ষণিক দেখানোর জন্য)
            localStorage.setItem("userName", data.user.user_metadata.full_name);
            localStorage.setItem("userEmail", email);
            
            alert("Login Successful!");
            window.location.href = "index.html"; // হোম পেজে ফেরত যাবে
        }
    });
}

// --- ৩. ফর্ম অদলবদল (Toggle) ফাংশন ---
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginBtn').classList.add('active');
    document.getElementById('signupBtn').classList.remove('active');
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginBtn').classList.remove('active');
    document.getElementById('signupBtn').classList.add('active');
}

// --- ৪. লগআউট ফাংশন (অন্য পেজ থেকে কল করার জন্য) ---
async function userLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.reload(); // পেজ রিফ্রেশ
}