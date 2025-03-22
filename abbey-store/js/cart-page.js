// Cart page functionality
class CartPage {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        this.init();
    }

    init() {
        this.renderCart();
        this.renderRecentlyViewed();
        this.initEventListeners();
    }

    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        const cartGrid = document.querySelector('.cart-grid');

        if (this.cart.length === 0) {
            cartGrid.classList.add('hidden');
            emptyCart.classList.remove('hidden');
            return;
        }

        cartGrid.classList.remove('hidden');
        emptyCart.classList.add('hidden');

        cartItems.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="item-details">
                    <div>
                        <h3>${item.title}</h3>
                        <div class="item-badges">
                            ${item.badges ? item.badges.map(badge => `
                                <span class="badge ${badge}">${badge}</span>
                            `).join('') : ''}
                        </div>
                        <p class="item-price">${item.price}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity || 1}</span>
                        <button class="quantity-btn increase" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="move-to-wishlist" data-index="${index}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace('₦', '').replace(',', ''));
            return total + price * (item.quantity || 1);
        }, 0);

        const shipping = 2000; // Fixed shipping cost
        const total = subtotal + shipping;

        document.querySelector('.subtotal').textContent = `₦${subtotal.toLocaleString()}`;
        document.querySelector('.total-amount').textContent = `₦${total.toLocaleString()}`;
    }

    renderRecentlyViewed() {
        const recentlyViewedGrid = document.querySelector('.recently-viewed .product-grid');
        if (!recentlyViewedGrid || this.recentlyViewed.length === 0) return;

        recentlyViewedGrid.innerHTML = this.recentlyViewed.slice(0, 4).map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                    ${product.badges ? product.badges.map(badge => `
                        <span class="badge ${badge}">${badge}</span>
                    `).join('') : ''}
                    <div class="quick-actions">
                        <button class="wishlist-btn"><i class="fas fa-heart"></i></button>
                        <button class="quick-view-btn"><i class="fas fa-eye"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <div class="rating">${product.rating || ''}</div>
                    <p class="price">${product.price}</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }

    initEventListeners() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const item = this.cart[index];
                if (!item) return;

                if (btn.classList.contains('decrease')) {
                    if ((item.quantity || 1) > 1) {
                        item.quantity = (item.quantity || 1) - 1;
                    }
                } else {
                    item.quantity = (item.quantity || 1) + 1;
                }

                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.renderCart();
            });
        });

        // Remove item
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-item').dataset.index);
                this.cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.renderCart();
                this.updateCartCount();
            });
        });

        // Move to wishlist
        document.querySelectorAll('.move-to-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.move-to-wishlist').dataset.index);
                const item = this.cart[index];
                
                let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                if (!wishlist.find(i => i.id === item.id)) {
                    wishlist.push(item);
                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                }

                this.cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.renderCart();
                this.updateCartCount();
                this.showNotification('Item moved to wishlist!');
            });
        });

        // Continue shopping
        document.querySelector('.continue-shopping').addEventListener('click', () => {
            window.location.href = 'index.html#shop';
        });

        // Checkout
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            // Implement checkout functionality
            alert('Checkout functionality will be implemented soon!');
        });
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 100);
    }
}

// Initialize cart page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cartPage = new CartPage();
});
