// js/profile.js - Handles Profile Page Logic & Menu Actions

window.addEventListener('DOMContentLoaded', async () => {
    await checkSession();     // লগইন চেক
    await loadUserProfile();  // ডাটা লোড
    setupSidebarActions();    // সাইডবার মেনুর অ্যাকশন সেট করা
});

// 1. Check if User is Logged In
async function checkSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = "login.html"; // লগইন না থাকলে লগইন পেজে পাঠাবে
    }
}

// 2. Load User Data from Supabase
async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // Get Name from Metadata
        const fullName = user.user_metadata.full_name || "Keshab Sarkar";
        const email = user.email;
        
        // নামের প্রথম এবং শেষ অংশ আলাদা করা
        const splitName = fullName.split(" ");
        const firstName = splitName[0];
        const lastName = splitName.slice(1).join(" "); // বাকি সবটুকু লাস্ট নেম

        // Update HTML Elements
        const sidebarName = document.getElementById('sidebarName');
        const headerUserName = document.getElementById('headerUserName');
        
        if(sidebarName) sidebarName.innerText = fullName;
        if(headerUserName) headerUserName.innerText = firstName;
        
        // ইনপুট ফিল্ডে ভ্যালু বসানো
        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('emailField').value = email;
        
        // Mobile Number (যদি মেটাডাটায় থাকে, নাহলে ডিফল্ট দেখাবে)
        const mobile = user.user_metadata.mobile || "+91 9382284190"; 
        document.getElementById('mobileField').value = mobile;
    }
}

// 3. Sidebar Menu Action Handler (নতুন যোগ করা হয়েছে)
function setupSidebarActions() {
    
    // --- A. My Orders Button ---
    const orderBtn = document.querySelector('.menu-head i.fa-box-open').parentElement;
    if (orderBtn) {
        orderBtn.onclick = () => {
            window.location.href = "orders.html"; // Orders পেজে নিয়ে যাবে
        };
    }

    // --- B. Submenu Links Handling ---
    const allLinks = document.querySelectorAll('.submenu a');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // ডিফল্ট জাম্প বন্ধ করা

            const text = link.textContent.trim();

            // ১. Active ক্লাস পরিবর্তন করা (UI এর জন্য)
            allLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // ২. টেক্সট অনুযায়ী অ্যাকশন সেট করা
            if (text.includes("Profile Information")) {
                // আমরা অলরেডি এই পেজে আছি, তাই কিছু করার দরকার নেই
                console.log("Already on Profile Info");
            } 
            else if (text.includes("Manage Addresses")) {
                // ভবিষ্যতে address.html বানালে সেখানে পাঠাবে
                alert("Address Management Page Coming Soon! 🏠");
                // window.location.href = "address.html";
            } 
            else if (text.includes("My Wishlist")) {
                window.location.href = "wishlist.html";
            } 
            else if (text.includes("Gift Cards")) {
                alert("Your Gift Card Balance is ₹0");
            }
            else if (text.includes("Saved UPI") || text.includes("Saved Cards")) {
                alert("Payment Methods Management Coming Soon! 💳");
            }
            else if (text.includes("My Coupons")) {
                alert("No Coupons Available right now! 🎟️");
            }
            else if (text.includes("Notifications")) {
                alert("No New Notifications! 🔔");
            }
            else {
                // বাকি সব অপশনের জন্য
                alert(`You clicked on: ${text}`);
            }
        });
    });
}

// 4. Edit Button Functionality
function enableEdit(fieldId) {
    const saveBtn = document.getElementById('saveBtn');
    if(saveBtn) saveBtn.style.display = 'block'; // Save বাটন দেখাবে

    if (fieldId === 'nameFields') {
        document.getElementById('firstName').disabled = false;
        document.getElementById('lastName').disabled = false;
        document.getElementById('firstName').focus();
    } else {
        const input = document.getElementById(fieldId);
        if(input) {
            input.disabled = false;
            input.focus();
        }
    }
}

// 5. Save Changes to Supabase
async function saveProfile() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const fullName = `${firstName} ${lastName}`.trim();
    const mobile = document.getElementById('mobileField').value;

    const saveBtn = document.getElementById('saveBtn');
    if(saveBtn) saveBtn.innerText = "Saving..."; // লোডিং এফেক্ট

    // Update Supabase User Metadata
    const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName, mobile: mobile }
    });

    if (error) {
        alert("Error updating profile: " + error.message);
        if(saveBtn) saveBtn.innerText = "Save Changes";
    } else {
        alert("Profile updated successfully! ✅");
        window.location.reload(); // পেজ রিফ্রেশ করে ইনপুট আবার লক করা হবে
    }
}

// 6. Logout Function
async function logoutUser() {
    if(confirm("Are you sure you want to logout?")) {
        await supabase.auth.signOut();
        window.location.href = "index.html"; // হোমপেজে পাঠিয়ে দেবে
    }
}