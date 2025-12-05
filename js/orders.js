// js/orders.js - Handles Orders with JSON Items

window.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    loadUserProfile();
    fetchOrders(); 
});

// 1. সেশন চেক
async function checkSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) window.location.href = "login.html";
}

// 2. সাইডবার নাম লোড
async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        const fullName = user.user_metadata.full_name || "User";
        document.getElementById('sidebarName').innerText = fullName;
        document.getElementById('headerUserName').innerText = fullName.split(" ")[0];
    }
}

// 3. Supabase থেকে অর্ডার আনা
async function fetchOrders() {
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '<div class="loading-spinner">Loading your orders...</div>';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // তোমার কলাম অনুযায়ী ডেটা আনা
    // ধরে নিচ্ছি তোমার টেবিলে 'user_id' আছে ইউজার চেনার জন্য
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*') // customer_name, total_amount, items, created_at সব আসবে
        .eq('user_id', user.id) 
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        container.innerHTML = '<p style="padding:20px; text-align:center; color:red;">Failed to load orders.</p>';
    } else {
        processAndDisplayOrders(orders);
    }
}

// 4. ডেটা প্রসেস এবং ডিসপ্লে করা
function processAndDisplayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    container.innerHTML = ""; 

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="no-orders">
                <img src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png" width="200">
                <h3>No orders found!</h3>
                <p>Looks like you haven't ordered anything yet.</p>
                <button class="shop-now-btn" onclick="window.location.href='index.html'">Shop Now</button>
            </div>
        `;
        return;
    }

    // প্রতিটি অর্ডারের জন্য লুপ
    orders.forEach(order => {
        
        // ডেট ফরম্যাট করা (যেমন: Oct 25, 2023)
        const orderDateObj = new Date(order.created_at);
        const dateString = orderDateObj.toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' });
        
        // ডেলিভারি ডেট (অর্ডার ডেট + ৫ দিন আনুমানিক)
        orderDateObj.setDate(orderDateObj.getDate() + 5);
        const deliveryDate = orderDateObj.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });

        // আইটেম লিস্ট বের করা (যদি JSON স্ট্রিং থাকে তবে Parse করবে)
        let itemsList = order.items;
        if (typeof itemsList === 'string') {
            try {
                itemsList = JSON.parse(itemsList);
            } catch (e) {
                itemsList = [];
            }
        }

        // এখন অর্ডারের ভেতরের প্রতিটি আইটেমের জন্য কার্ড বানাবো
        // (Flipkart এ প্রতিটি আইটেম আলাদা আলাদা রো তে দেখায়)
        itemsList.forEach(item => {
            
            // স্ট্যাটাস লজিক (তোমার টেবিলে যদি স্ট্যাটাস না থাকে তবে ডিফল্ট 'On the way' দেখাবো)
            const status = order.status || "On the way"; 
            let statusClass = 'shipping';
            
            if(status === 'Delivered') statusClass = 'delivered';
            else if(status === 'Cancelled') statusClass = 'cancelled';

            const card = document.createElement('div');
            card.className = 'order-card';
            
            // কার্ডে ক্লিক করলে বিস্তারিত দেখাবে (অপশনাল)
            card.onclick = () => { 
                alert(`Order ID: ${order.id}\nItem: ${item.name}\nAmount: ₹${item.price}\nStatus: ${status}`); 
            };

            // ব্যাকআপ ইমেজ
            const productImg = item.image || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

            card.innerHTML = `
                <!-- ছবি -->
                <div class="order-img-box">
                    <img src="${productImg}" alt="${item.name}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'">
                </div>

                <!-- ডিটেইলস -->
                <div class="order-details">
                    <div class="order-title">${item.name}</div>
                    <div class="order-subtitle">Qty: ${item.quantity || 1}</div>
                </div>

                <!-- দাম -->
                <div class="order-price">₹${item.price}</div>

                <!-- স্ট্যাটাস -->
                <div class="order-status">
                    <div class="status-row">
                        <div class="status-dot ${statusClass}"></div>
                        <span>${status}</span>
                    </div>
                    <div class="status-subtext">Delivery expected by ${deliveryDate}</div>
                    <div style="font-size:10px; color:#999; margin-top:2px;">Ordered on ${dateString}</div>
                </div>
            `;

            container.appendChild(card);
        });
    });
}

// লগআউট
async function logoutUser() {
    if(confirm("Are you sure you want to logout?")) {
        await supabase.auth.signOut();
        window.location.href = "index.html";
    }
}