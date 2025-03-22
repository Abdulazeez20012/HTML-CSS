// Sample product data
const products = [
    {
        id: 1,
        name: 'Elegant Evening Gown',
        price: '₦45,000',
        images: ['images/products/dresses/evening-gown-1.jpg'],
        video: 'videos/products/evening-gown-1.mp4',
        badges: ['trending', 'new-arrival'],
        rating: 4.5,
        reviews: 42,
        category: 'formal'
    },
    {
        id: 2,
        name: 'Premium Denim Jeans',
        price: '₦25,000',
        images: ['images/products/jeans/premium-jeans-1.jpg'],
        video: 'videos/products/premium-jeans-1.mp4',
        badges: ['best-seller'],
        rating: 5,
        reviews: 128,
        category: 'casual'
    },
    {
        id: 3,
        name: 'Classic Business Suit',
        price: '₦65,000',
        images: ['images/products/suits/business-suit-1.jpg'],
        video: 'videos/products/business-suit-1.mp4',
        badges: ['limited'],
        rating: 4,
        reviews: 86,
        category: 'formal'
    }
];

class ProductManager {
    constructor() {
        this.init();
    }

    init() {
        this.renderFeaturedProducts();
        this.renderNewArrivals();
        this.initRecentlyViewed();
    }

    renderFeaturedProducts() {
        const featuredGrid = document.querySelector('#featured .product-grid');
        if (!featuredGrid) return;

        // Filter featured products (those with badges)
        const featuredProducts = products.filter(product => product.badges.length > 0);
        this.renderProducts(featuredGrid, featuredProducts);
    }

    renderNewArrivals() {
        const newArrivalsGrid = document.querySelector('#new-arrivals .product-grid');
        if (!newArrivalsGrid) return;

        // Filter new arrivals
        const newArrivals = products.filter(product => 
            product.badges.includes('new-arrival')
        );
        this.renderProducts(newArrivalsGrid, newArrivals);
    }

    renderProducts(container, products) {
        container.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img class="lazy" 
                         data-src="${product.images[0]}" 
                         alt="${product.name}"
                         src="images/thumbnails/placeholder.jpg">
                    ${product.badges.map(badge => `
                        <span class="badge ${badge}">${this.formatBadgeText(badge)}</span>
                    `).join('')}
                    ${product.video ? `
                        <button class="video-preview" data-video="${product.video}">
                            <i class="fas fa-play"></i>
                        </button>
                    ` : ''}
                    <div class="quick-actions">
                        <button class="wishlist-btn" title="Add to Wishlist">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="quick-view-btn" title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="rating">
                        ${this.generateRatingStars(product.rating)}
                        <span class="review-count">(${product.reviews} reviews)</span>
                    </div>
                    <p class="price">${product.price}</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    formatBadgeText(badge) {
        return badge.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    initRecentlyViewed() {
        // Add product to recently viewed when quick view is opened
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-view-btn')) {
                const productCard = e.target.closest('.product-card');
                if (!productCard) return;

                const productId = parseInt(productCard.dataset.id);
                const product = products.find(p => p.id === productId);
                if (!product) return;

                let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
                
                // Remove if already exists
                recentlyViewed = recentlyViewed.filter(p => p.id !== product.id);
                
                // Add to front of array
                recentlyViewed.unshift(product);
                
                // Keep only last 8 items
                recentlyViewed = recentlyViewed.slice(0, 8);
                
                localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
            }
        });
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
});

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Add to cart
function addToCart(product) {
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
}

// Add to wishlist
function toggleWishlist(product) {
    const index = wishlist.findIndex(item => item.id === product.id);
    if (index === -1) {
        wishlist.push(product);
        showNotification('Added to wishlist!');
    } else {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist!');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Show notification
function showNotification(message) {
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

// Video preview functionality
function initVideoPreview() {
    const previewButtons = document.querySelectorAll('.video-preview');
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <span class="close-modal">&times;</span>
            <video controls>
                <source src="" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
    `;
    document.body.appendChild(modal);

    previewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const videoSrc = button.dataset.video;
            const modalVideo = modal.querySelector('video');
            modalVideo.src = videoSrc;
            modal.classList.add('show');
            modalVideo.play();
        });
    });

    modal.querySelector('.close-modal').addEventListener('click', () => {
        const modalVideo = modal.querySelector('video');
        modalVideo.pause();
        modalVideo.src = '';
        modal.classList.remove('show');
    });
}

// Quick view functionality
function initQuickView() {
    const quickViewButtons = document.querySelectorAll('.quick-view-btn');
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-content">
            <span class="close-modal">&times;</span>
            <div class="product-details">
                <div class="product-images">
                    <img src="" alt="Product Image" class="main-image">
                    <div class="thumbnail-images"></div>
                </div>
                <div class="product-info">
                    <h2 class="product-title"></h2>
                    <div class="product-rating"></div>
                    <p class="product-price"></p>
                    <p class="product-description"></p>
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

    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const product = button.closest('.product-card');
            const productData = {
                title: product.querySelector('h3').textContent,
                price: product.querySelector('.price').textContent,
                rating: product.querySelector('.rating').innerHTML,
                image: product.querySelector('.product-image img').dataset.src
            };
            
            modal.querySelector('.product-title').textContent = productData.title;
            modal.querySelector('.product-price').textContent = productData.price;
            modal.querySelector('.product-rating').innerHTML = productData.rating;
            modal.querySelector('.main-image').src = productData.image;
            
            modal.classList.add('show');
        });
    });

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('show');
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
}

// Initialize all functionalities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initVideoPreview();
    initQuickView();
    updateCartCount();

    // Handle add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.product-card');
            const productData = {
                id: Date.now(), // Temporary ID
                title: product.querySelector('h3').textContent,
                price: product.querySelector('.price').textContent,
                image: product.querySelector('.product-image img').dataset.src
            };
            addToCart(productData);
        });
    });

    // Handle wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.product-card');
            const productData = {
                id: Date.now(), // Temporary ID
                title: product.querySelector('h3').textContent,
                price: product.querySelector('.price').textContent,
                image: product.querySelector('.product-image img').dataset.src
            };
            toggleWishlist(productData);
            button.classList.toggle('active');
        });
    });
});
