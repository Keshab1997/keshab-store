// js/index.js - Full Updated Code

const container = document.getElementById('productContainer');
const loading = document.getElementById('loading');

// পেজ লোড হলে কার্ট এবং প্রোডাক্ট চেক করবে
window.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    await fetchProducts();
});

// Supabase থেকে প্রোডাক্ট নিয়ে আসার ফাংশন
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

// প্রোডাক্টগুলো স্ক্রিনে সাজানোর ফাংশন
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
            
            <!-- loading="lazy" যোগ করা হয়েছে স্পিড বাড়ানোর জন্য -->
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
                
                <!-- কার্টে যোগ করার বাটন -->
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image_url}')">
                    Add to Cart
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// কার্টে প্রোডাক্ট যোগ করার ফাংশন
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
    alert("Item added to cart successfully! 🛒");
}

// কার্ট আইকনের লাল সংখ্যা আপডেট করার ফাংশন
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElement = document.getElementById('cartCount');
    if(countElement) {
        countElement.innerText = total;
    }
}