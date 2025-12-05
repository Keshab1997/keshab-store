// লোড হওয়ার সাথে সাথে কার্ট চেক করবে
window.addEventListener('DOMContentLoaded', loadCart);

function loadCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCartMsg');
    const priceDetails = document.getElementById('priceDetails');
    const bottomBar = document.getElementById('bottomBar');

    container.innerHTML = "";

    if (cart.length === 0) {
        emptyMsg.style.display = 'block';
        priceDetails.style.display = 'none';
        bottomBar.style.display = 'none';
        return;
    }

    // কার্ট খালি না থাকলে
    emptyMsg.style.display = 'none';
    priceDetails.style.display = 'block';
    bottomBar.style.display = 'flex';

    let totalAmount = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        totalAmount += item.price * item.quantity;
        totalItems += item.quantity;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4 class="item-title">${item.name}</h4>
                <span class="item-price">₹${item.price}</span>
                
                <div class="qty-control">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    <span class="remove-btn" onclick="removeItem(${index})">REMOVE</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // বিল আপডেট
    document.getElementById('totalItems').innerText = totalItems;
    document.getElementById('totalPrice').innerText = '₹' + totalAmount;
    document.getElementById('finalAmount').innerText = '₹' + totalAmount;
    document.getElementById('bottomTotal').innerText = '₹' + totalAmount;
}

// সংখ্যা বাড়ানো কমানো
function changeQty(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    
    cart[index].quantity += change;

    if (cart[index].quantity < 1) {
        cart[index].quantity = 1; // ১ এর নিচে নামবে না
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

// ডিলিট করা
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1); // লিস্ট থেকে বাদ দেওয়া
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

// --- Checkout Logic ---

function openCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

async function placeOrder() {
    const name = document.getElementById('cName').value;
    const phone = document.getElementById('cPhone').value;
    const address = document.getElementById('cAddress').value;

    if (!name || !phone || !address) {
        alert("Please fill all details!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart'));
    let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // অর্ডার লিস্ট টেক্সট আকারে বানানো
    let itemsSummary = cart.map(i => `${i.name} (x${i.quantity})`).join(", ");

    // বাটন লোডিং দেখানো
    const confirmBtn = document.querySelector('.confirm-btn');
    confirmBtn.innerText = "Processing...";
    confirmBtn.disabled = true;

    // Supabase এ পাঠানো
    const { data, error } = await supabase
        .from('orders')
        .insert([
            {
                customer_name: name,
                phone: phone,
                address: address,
                total_amount: totalAmount,
                items: itemsSummary
            }
        ]);

    if (error) {
        alert("Order Failed: " + error.message);
        confirmBtn.innerText = "Confirm Order";
        confirmBtn.disabled = false;
    } else {
        alert("Order Placed Successfully! 🎉");
        localStorage.removeItem('cart'); // কার্ট খালি করা
        window.location.href = 'index.html'; // হোম পেজে ফেরত যাওয়া
    }
}