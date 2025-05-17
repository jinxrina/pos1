// Sample product data
const products = [
    { id: 1, name: "Wireless Headphones", category: "electronics", price: 99.99, image: "https://via.placeholder.com/150?text=Headphones" },
    { id: 2, name: "Smartphone", category: "electronics", price: 599.99, image: "https://via.placeholder.com/150?text=Smartphone" },
    { id: 3, name: "Laptop", category: "electronics", price: 899.99, image: "https://via.placeholder.com/150?text=Laptop" },
    { id: 4, name: "T-Shirt", category: "clothing", price: 19.99, image: "https://via.placeholder.com/150?text=T-Shirt" },
    { id: 5, name: "Jeans", category: "clothing", price: 49.99, image: "https://via.placeholder.com/150?text=Jeans" },
    { id: 6, name: "Sneakers", category: "clothing", price: 79.99, image: "https://via.placeholder.com/150?text=Sneakers" },
    { id: 7, name: "Apples", category: "groceries", price: 2.99, image: "https://via.placeholder.com/150?text=Apples" },
    { id: 8, name: "Bread", category: "groceries", price: 3.49, image: "https://via.placeholder.com/150?text=Bread" },
    { id: 9, name: "Milk", category: "groceries", price: 2.49, image: "https://via.placeholder.com/150?text=Milk" },
    { id: 10, name: "Smart Watch", category: "electronics", price: 199.99, image: "https://via.placeholder.com/150?text=Smart+Watch" },
    { id: 11, name: "Jacket", category: "clothing", price: 89.99, image: "https://via.placeholder.com/150?text=Jacket" },
    { id: 12, name: "Eggs", category: "groceries", price: 4.99, image: "https://via.placeholder.com/150?text=Eggs" }
];

// Cart state
let cart = [];
let selectedPaymentMethod = null;

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartItems = document.getElementById('cart-items');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const productSearch = document.getElementById('product-search');
const searchBtn = document.getElementById('search-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentMethodBtns = document.querySelectorAll('.payment-method-btn');
const receiptModal = document.getElementById('receipt-modal');
const receiptBody = document.getElementById('receipt-body');
const closeReceiptBtn = document.querySelector('.close-receipt');
const printReceiptBtn = document.getElementById('print-receipt');
const newOrderBtn = document.getElementById('new-order');
const datetimeElement = document.getElementById('datetime');

// Initialize the app
function init() {
    renderProducts(products);
    updateCart();
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    productSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => handleCategoryFilter(btn));
    });
    
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', handleCheckout);
    
    paymentMethodBtns.forEach(btn => {
        btn.addEventListener('click', () => selectPaymentMethod(btn));
    });
    
    closeReceiptBtn.addEventListener('click', () => receiptModal.style.display = 'none');
    printReceiptBtn.addEventListener('click', printReceipt);
    newOrderBtn.addEventListener('click', startNewOrder);
}

// Render products to the grid
function renderProducts(productsToRender) {
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        `;
        productCard.addEventListener('click', () => addToCart(product));
        productsGrid.appendChild(productCard);
    });
}

// Add product to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
}

// Update cart UI
function updateCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
        subtotalElement.textContent = '$0.00';
        taxElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
            <div class="remove-item" data-id="${item.id}"><i class="fas fa-times"></i></div>
        `;
        
        cartItems.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeItem(btn.dataset.id));
    });
    
    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Adjust item quantity
function adjustQuantity(productId, change) {
    const item = cart.find(item => item.id === parseInt(productId));
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== parseInt(productId));
        }
        
        updateCart();
    }
}

// Remove item from cart
function removeItem(productId) {
    cart = cart.filter(item => item.id !== parseInt(productId));
    updateCart();
}

// Clear cart
function clearCart() {
    cart = [];
    selectedPaymentMethod = null;
    resetPaymentMethodButtons();
    updateCart();
}

// Handle product search
function handleSearch() {
    const searchTerm = productSearch.value.toLowerCase();
    
    if (!searchTerm) {
        renderProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );
    
    renderProducts(filteredProducts);
}

// Handle category filter
function handleCategoryFilter(btn) {
    const category = btn.dataset.category;
    
    // Update active button
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    btn.classList.add('active');
    
    if (category === 'all') {
        renderProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => product.category === category);
    renderProducts(filteredProducts);
}

// Select payment method
function selectPaymentMethod(btn) {
    selectedPaymentMethod = btn.dataset.method;
    
    // Update UI
    paymentMethodBtns.forEach(btn => btn.classList.remove('active'));
    btn.classList.add('active');
}

// Reset payment method buttons
function resetPaymentMethodButtons() {
    paymentMethodBtns.forEach(btn => btn.classList.remove('active'));
    selectedPaymentMethod = null;
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    if (!selectedPaymentMethod) {
        alert('Please select a payment method!');
        return;
    }
    
    generateReceipt();
    receiptModal.style.display = 'flex';
}

// Generate receipt
function generateReceipt() {
    const now = new Date();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    let receiptHTML = `
        <div class="receipt-store">My Store</div>
        <div class="receipt-address">123 Main St, Cityville</div>
        <div class="receipt-phone">(555) 123-4567</div>
        <div class="receipt-date">${now.toLocaleDateString()} ${now.toLocaleTimeString()}</div>
        <div class="receipt-payment">Payment: ${selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1)}</div>
        <hr>
        <div class="receipt-items">
    `;
    
    cart.forEach(item => {
        receiptHTML += `
            <div class="receipt-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    receiptHTML += `
        </div>
        <hr>
        <div class="receipt-totals">
            <div class="receipt-item">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="receipt-item">
                <span>Tax (10%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="receipt-item total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        <hr>
        <div class="receipt-thankyou">Thank you for your purchase!</div>
    `;
    
    receiptBody.innerHTML = receiptHTML;
}

// Print receipt
function printReceipt() {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .receipt-store { font-weight: bold; text-align: center; font-size: 18px; }
                    .receipt-address, .receipt-phone { text-align: center; font-size: 14px; }
                    .receipt-date { text-align: center; margin: 10px 0; }
                    .receipt-payment { text-align: center; margin-bottom: 15px; }
                    .receipt-item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .receipt-item.total { font-weight: bold; margin-top: 10px; }
                    .receipt-thankyou { text-align: center; margin-top: 20px; font-style: italic; }
                    hr { border: 0; border-top: 1px dashed #ccc; margin: 15px 0; }
                </style>
            </head>
            <body>
                ${receiptBody.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Start new order
function startNewOrder() {
    clearCart();
    receiptModal.style.display = 'none';
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    datetimeElement.textContent = now.toLocaleString();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);