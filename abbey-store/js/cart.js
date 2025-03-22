// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.initEventListeners();
    }

    initEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const product = this.getProductData(productCard);
                this.addToCart(product);
            });
        });

        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const product = this.getProductData(productCard);
                this.toggleWishlist(product);
                button.classList.toggle('active');
            });
        });

        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const product = this.getProductData(productCard);
                this.showQuickView(product);
            });
        });
    }

    getProductData(productCard) {
        return {
            id: productCard.dataset.id || Date.now(),
            title: productCard.querySelector('h3').textContent,
            price: productCard.querySelector('.price').textContent,
            image: productCard.querySelector('.product-image img').dataset.src,
            rating: productCard.querySelector('.rating').innerHTML,
            badges: Array.from(productCard.querySelectorAll('.badge')).map(badge => badge.className.split(' ')[1])
        };
    }

    addToCart(product) {
        this.items.push(product);
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.showNotification('Product added to cart!');
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.showNotification('Product removed from cart!');
    }

    toggleWishlist(product) {
        const index = this.wishlist.findIndex(item => item.id === product.id);
        if (index === -1) {
            this.wishlist.push(product);
            this.showNotification('Added to wishlist!');
        } else {
            this.wishlist.splice(index, 1);
            this.showNotification('Removed from wishlist!');
        }
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.length;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
            // Hide and remove notification
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 100);
    }

    showQuickView(product) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="quick-view-content">
                <span class="close-modal">&times;</span>
                <div class="product-details">
                    <div class="product-images">
                        <img src="${product.image}" alt="${product.title}" class="main-image">
                        <div class="thumbnail-images"></div>
                    </div>
                    <div class="product-info">
                        <h2>${product.title}</h2>
                        <div class="rating">${product.rating}</div>
                        <p class="price">${product.price}</p>
                        <div class="badges">
                            ${product.badges.map(badge => `<span class="badge ${badge}">${badge}</span>`).join('')}
                        </div>
                        <div class="product-size">
                            <h3>Size:</h3>
                            <div class="size-options">
                                <button>S</button>
                                <button>M</button>
                                <button>L</button>
                                <button>XL</button>
                            </div>
                        </div>
                        <div class="product-quantity">
                            <h3>Quantity:</h3>
                            <div class="quantity-selector">
                                <button class="decrease">-</button>
                                <input type="number" value="1" min="1">
                                <button class="increase">+</button>
                            </div>
                        </div>
                        <button class="add-to-cart-btn">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // Handle close button
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Handle quantity selector
        const quantitySelector = modal.querySelector('.quantity-selector');
        const quantityInput = quantitySelector.querySelector('input');

        quantitySelector.querySelector('.decrease').addEventListener('click', () => {
            if (quantityInput.value > 1) {
                quantityInput.value--;
            }
        });

        quantitySelector.querySelector('.increase').addEventListener('click', () => {
            quantityInput.value++;
        });

        // Handle add to cart from quick view
        modal.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            for (let i = 0; i < quantity; i++) {
                this.addToCart(product);
            }
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Handle size selection
        modal.querySelectorAll('.size-options button').forEach(button => {
            button.addEventListener('click', () => {
                modal.querySelectorAll('.size-options button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cart = new Cart();
});
