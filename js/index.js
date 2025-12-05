// js/index.js - Full Updated Code for Keshab Store

const container = document.getElementById('productContainer');
const loading = document.getElementById('loading');

// ১. পেজ লোড হলে সব ফাংশন একসাথে কল হবে
window.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();      // কার্ট কাউন্ট আপডেট
    checkUserLogin();       // ইউজার লগইন চেক
    await fetchProducts();  // প্রোডাক্ট লোড
});

// ২. Supabase থেকে প্রোডাক্ট নিয়ে আসার ফাংশন
async function fetchProducts() {
    let { data: products, error } = await supabase
        .from('products')
        .select('*');

    // ডাটা আসার পর লোডিং লেখা বন্ধ হবে
    if(loading) loading.style.display = 'none';

    if (error) {
        console.error("Supabase Error:", error);
        if(container) container.innerHTML = "<p style='text-align:center; padding:20px;'>Error loading products. Please try again.</p>";
    } else {
        displayProducts(products);
    }
}

// ৩. প্রোডাক্টগুলো স্ক্রিনে সাজানোর ফাংশন
function displayProducts(products) {
    if(!container) return;
    container.innerHTML = ""; // আগের সব পরিষ্কার করা

    products.forEach(product => {
        // ২০% ফেক ডিসকাউন্ট লজিক
        let originalPrice = Math.floor(product.price * 1.2); 
        
        // ব্যাকআপ ইমেজ (যদি আসল ছবি লোড না হয়)
        const backupImage = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

        const card = document.createElement('div');
        card.className = 'product-card';

        // HTML স্ট্রাকচার তৈরি
        card.innerHTML = `
            <div class="heart-icon"><i class="fas fa-heart"></i></div>
            
            <img src="${product.image_url}" 
                 alt="${product.name}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${backupImage}';">
            
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <div class="category-tag" style="font-size:10px; color:#878787; margin-bottom:2px;">${product.category || 'General'}</div>
                
                <div class="price-row">
                    <span class="current-price">₹${product.price}</span>
                    <span class="old-price">₹${originalPrice}</span>
                    <span class="discount">20% off</span>
                </div>
                
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image_url}')">
                    Add to Cart
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ৪. কার্টে প্রোডাক্ট যোগ করার ফাংশন
function addToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // চেক করা প্রোডাক্টটি আগে থেকেই কার্টে আছে কিনা
    const existingItem = cart.find(item => item.id == id);

    if (existingItem) {
        existingItem.quantity += 1; // থাকলে সংখ্যা বাড়াবে
    } else {
        cart.push({ id, name, price, image, quantity: 1 }); // না থাকলে নতুন যোগ করবে
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // সুন্দর অ্যালার্ট (Optional)
    alert("Item added to cart! 🛒");
}

// ৫. কার্ট আইকনের লাল সংখ্যা আপডেট করার ফাংশন
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElement = document.getElementById('cartCount');
    if(countElement) {
        countElement.innerText = total;
        // যদি ০ হয়, আইকন লুকিয়ে রাখতে পারো (Optional)
        // countElement.style.display = total > 0 ? 'flex' : 'none';
    }
}

// --- User Auth & UI Handling (Desktop + Mobile) ---

async function checkUserLogin() {
    // Supabase থেকে ইউজার চেক
    const { data: { user } } = await supabase.auth.getUser();

    // HTML এলিমেন্ট ধরা
    const desktopLoginBtn = document.getElementById('desktopLoginBtn');
    const desktopProfileMenu = document.getElementById('desktopProfileMenu');
    const mobileAccountText = document.getElementById('mobileAccountText');
    const desktopUserName = document.querySelector('.user-name'); // Desktop dropdown name

    if (user) {
        // --- যদি লগইন থাকে ---
        const fullName = user.user_metadata.full_name || "User";
        const firstName = fullName.split(" ")[0]; 

        // Desktop: লগইন বাটন লুকাও, প্রোফাইল দেখাও
        if(desktopLoginBtn) desktopLoginBtn.style.display = 'none';
        if(desktopProfileMenu) {
            desktopProfileMenu.style.display = 'block';
            if(desktopUserName) desktopUserName.innerHTML = `${firstName} <i class="fas fa-angle-down"></i>`;
        }

        // Mobile: "Login" লেখার বদলে নাম দেখাও
        if(mobileAccountText) mobileAccountText.innerText = firstName;
        
    } else {
        // --- যদি লগআউট থাকে ---
        // Desktop
        if(desktopLoginBtn) desktopLoginBtn.style.display = 'block';
        if(desktopProfileMenu) desktopProfileMenu.style.display = 'none';

        // Mobile
        if(mobileAccountText) mobileAccountText.innerText = "Login";
    }
}

// ৬. লগআউট ফাংশন (Desktop Dropdown এর জন্য)
async function logoutUser() {
    if(confirm("Are you sure you want to logout?")) {
        await supabase.auth.signOut();
        window.location.reload(); // পেজ রিফ্রেশ
    }
}

// ৭. মোবাইল বটম নেভিগেশন হ্যান্ডলার (Mobile Only)
// তোমার HTML এ onclick="handleMobileAccount()" দেওয়া আছে
async function handleMobileAccount() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // লগইন না থাকলে লগইন পেজে যাও
        window.location.href = "login.html"; 
    } else {
        // লগইন থাকলে প্রোফাইল পেজে যাও বা লগআউট অপশন দাও
        // আপাতত আমরা প্রোফাইল পেজে পাঠাচ্ছি
        window.location.href = "profile.html";
        
        // অথবা যদি সরাসরি লগআউট করাতে চাও মোবাইলে:
        /*
        if(confirm("Do you want to logout?")) {
            await supabase.auth.signOut();
            window.location.reload();
        }
        */
    }
}