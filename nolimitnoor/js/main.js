// Application State
const appState = {
    currentUser: null,
    currentProduct: null,
    arActive: false,
    tryOnActive: false,
    currentOutfit: {
        tops: null,
        bottoms: null,
        accessories: []
    },
    cart: []
};

// DOM Elements
const elements = {
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    
    // Cart Elements
    cartBadge: document.querySelector('.cart-badge'),
    cartItemsContainer: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    
    // Product Elements
    productsContainer: document.getElementById('featured-products'),
    
    // User Interface
    userMenuBtn: document.querySelector('.user-menu-btn'),
    adminLink: document.querySelector('.admin-link'),
    
    // Video Controls
    heroVideo: document.querySelector('.hero-video'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    muteBtn: document.getElementById('muteBtn')
};

// Database simulation (in a real app, this would be on a server)
let db = {
    users: [],
    products: [
        {
            id: 1,
            name: "Premium Denim Jeans",
            price: 59.99,
            category: "jeans",
            sizes: ["S", "M", "L", "XL"],
            images: ["jeans-1.jpg", "jeans-2.jpg", "jeans-3.jpg"],
            videos: ["jeans-preview.mp4"],
            description: "Premium quality denim jeans with perfect fit",
            rating: 4.5,
            reviews: 128,
            inStock: true,
            type: "trending"
        },
        {
            id: 2,
            name: "Casual Cotton T-Shirt",
            price: 24.99,
            category: "tops",
            sizes: ["S", "M", "L", "XL"],
            images: ["tshirt-1.jpg", "tshirt-2.jpg"],
            videos: ["tshirt-preview.mp4"],
            description: "Comfortable cotton t-shirt",
            rating: 4.8,
            reviews: 95,
            inStock: true,
            type: "best-sellers"
        },
        {
            id: 3,
            name: "Designer Perfume",
            price: 89.99,
            category: "perfumes",
            images: ["perfume-1.jpg", "perfume-2.jpg"],
            videos: ["perfume-preview.mp4"],
            description: "Luxurious designer perfume",
            rating: 4.9,
            reviews: 67,
            inStock: true,
            type: "new-arrivals"
        }
    ],
    cart: [],
    reviews: [],
    wishlist: [],
    outfits: [],
    rewards: {
        pointsPerDollar: 10,
        tiers: [
            { name: "Bronze", minPoints: 0 },
            { name: "Silver", minPoints: 1000 },
            { name: "Gold", minPoints: 5000 },
            { name: "Platinum", minPoints: 10000 }
        ]
    },
    categories: [
        {
            id: 1,
            name: "Women's Collection",
            video: "womens-collection.mp4",
            image: "womens-collection.jpg"
        },
        {
            id: 2,
            name: "Men's Collection",
            video: "mens-collection.mp4",
            image: "mens-collection.jpg"
        },
        {
            id: 3,
            name: "Accessories",
            video: "accessories.mp4",
            image: "accessories.jpg"
        }
    ],
    media: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize database
    initializeDatabase();
    
    // Get current user from database
    appState.currentUser = db.getCurrentUser();
    
    // Initialize UI
    loadProducts();
    updateCartBadge();
    updateUserInterface();
    setupEventListeners();
    
    // Initialize features
    initializeForms();
    initializeChat();
    startCountdown();
    initializeTooltips();
    setupFilterButtons();
    initializeOutfitBuilder();
    initializeVirtualTryOn();
    initializeARView();
    initializeLoyaltyProgram();
    loadProductGallery();
    initializeVideoControls();
    initializeHeroVideoControls();
    initializeCategoryVideoControls();
    updateMediaGallery();
});

// Event Listeners
function setupEventListeners() {
    // Login Form
    elements.loginForm?.addEventListener('submit', handleLogin);
    
    // Register Form
    elements.registerForm?.addEventListener('submit', handleRegister);
    
    // Checkout Button
    elements.checkoutBtn?.addEventListener('click', handleCheckout);
    
    // User Menu
    elements.userMenuBtn?.addEventListener('click', toggleUserMenu);
    
    // Video Controls
    if (elements.heroVideo && elements.playPauseBtn && elements.muteBtn) {
        setupVideoControls();
    }
}

// Video Controls Setup
function setupVideoControls() {
    const playPauseIcon = elements.playPauseBtn.querySelector('i');
    const muteIcon = elements.muteBtn.querySelector('i');
    
    elements.playPauseBtn.addEventListener('click', () => {
        if (elements.heroVideo.paused) {
            elements.heroVideo.play();
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
        } else {
            elements.heroVideo.pause();
            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
        }
    });
    
    elements.muteBtn.addEventListener('click', () => {
        elements.heroVideo.muted = !elements.heroVideo.muted;
        if (elements.heroVideo.muted) {
            muteIcon.classList.remove('fa-volume-up');
            muteIcon.classList.add('fa-volume-mute');
        } else {
            muteIcon.classList.remove('fa-volume-mute');
            muteIcon.classList.add('fa-volume-up');
        }
    });
    
    elements.heroVideo.addEventListener('play', () => {
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
    });
    
    elements.heroVideo.addEventListener('pause', () => {
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
    });
    
    elements.heroVideo.addEventListener('loadstart', () => {
        elements.heroVideo.classList.add('loading');
    });
    
    elements.heroVideo.addEventListener('canplay', () => {
        elements.heroVideo.classList.remove('loading');
    });
    
    elements.heroVideo.addEventListener('error', () => {
        console.error('Error loading video:', elements.heroVideo.error);
        document.querySelector('.hero-section').style.backgroundImage = "url('../images/hero-bg.jpg')";
    });
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = db.login(email, password);
    if (user) {
        appState.currentUser = user;
        updateUserInterface();
        $('#loginModal').modal('hide');
        showToast('Success', 'Logged in successfully!');
    } else {
        showToast('Error', 'Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    
    const user = db.register({ email, password, name });
    if (user) {
        appState.currentUser = user;
        updateUserInterface();
        $('#registerModal').modal('hide');
        showToast('Success', 'Registered successfully!');
    } else {
        showToast('Error', 'Registration failed', 'error');
    }
}

function handleLogout() {
    db.logout();
    appState.currentUser = null;
    updateUserInterface();
    showToast('Success', 'Logged out successfully!');
}

// Cart Management
function updateCartBadge() {
    if (!elements.cartBadge) return;
    
    const cart = db.getCart();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    elements.cartBadge.textContent = itemCount;
}

function updateCartDisplay() {
    if (!elements.cartItemsContainer || !elements.cartTotal) return;
    
    const cart = db.getCart();
    elements.cartItemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const product = db.getProductById(item.productId);
        if (!product) return;
        
        total += product.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="item-details">
                <h4>${product.name}</h4>
                <p>$${product.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="item-actions">
                <button onclick="updateCartQuantity(${product.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${product.id}, ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        elements.cartItemsContainer.appendChild(cartItem);
    });
    
    elements.cartTotal.textContent = `$${total.toFixed(2)}`;
    elements.checkoutBtn.disabled = cart.length === 0;
}

// Products
function loadProducts() {
    if (!elements.productsContainer) return;
    
    const products = db.getProducts();
    elements.productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        elements.productsContainer.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = `product-card${!product.inStock ? ' out-of-stock' : ''}`;
    
    // Add badges based on product type
    const badges = [];
    if (product.trending) badges.push('<span class="product-badge badge-trending">Trending</span>');
    if (product.isNew) badges.push('<span class="product-badge badge-new">New Arrival</span>');
    if (product.isBestSeller) badges.push('<span class="product-badge badge-bestseller">Best Seller</span>');
    
    card.innerHTML = `
        <div class="product-image">
            <div class="loading-spinner"></div>
            <img src="${product.image}" alt="${product.name}" loading="lazy" 
                 onload="this.parentElement.querySelector('.loading-spinner').remove()">
            ${badges.join('')}
            ${product.videoPreview ? `
                <button class="video-preview-btn" onclick="showVideoPreview('${product.videoPreview}')">
                    <i class="fas fa-play"></i>
                </button>
            ` : ''}
            <div class="product-actions">
                <button class="action-btn" onclick="addToCart(${product.id})" 
                        ${!product.inStock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="action-btn" onclick="addToWishlist(${product.id})">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn" onclick="showProductDetails(${product.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${product.hasMultipleImages ? `
                    <button class="action-btn" onclick="showProductGallery(${product.id})">
                        <i class="fas fa-images"></i>
                    </button>
                ` : ''}
            </div>
            ${!product.inStock ? '<span class="out-of-stock">Out of Stock</span>' : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating">
                <div class="stars">
                    ${'★'.repeat(Math.floor(product.rating))}${
                        product.rating % 1 !== 0 ? '½' : ''}${
                        '☆'.repeat(5 - Math.ceil(product.rating))}
                </div>
                <span class="rating-count">(${product.reviews.length})</span>
            </div>
            <p class="product-price">$${product.price.toFixed(2)}</p>
        </div>
    `;

    // Add zoom effect on hover for product images
    const productImage = card.querySelector('.product-image img');
    productImage.addEventListener('mousemove', function(e) {
        const bounds = this.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        const xPercent = mouseX / bounds.width * 100;
        const yPercent = mouseY / bounds.height * 100;
        this.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    });

    return card;
}

function showVideoPreview(videoUrl) {
    const modal = document.getElementById('videoPreviewModal');
    const video = document.getElementById('previewVideo');
    
    video.src = videoUrl;
    video.onloadeddata = () => {
        $(modal).modal('show');
    };
    
    // Reset video when modal is closed
    $(modal).on('hidden.bs.modal', function () {
        video.pause();
        video.currentTime = 0;
        video.src = '';
    });
}

function showProductGallery(productId) {
    const product = db.getProductById(productId);
    if (!product || !product.images) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade product-gallery-modal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${product.name} Gallery</h5>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-gallery">
                        ${product.images.map(image => `
                            <div class="gallery-item">
                                <img src="${image}" alt="${product.name}" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    $(modal).modal('show');
    
    // Remove modal from DOM when hidden
    $(modal).on('hidden.bs.modal', function () {
        modal.remove();
    });
}

function showProductDetails(productId) {
    const product = db.getProductById(productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade product-details-modal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Product Details</h5>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="product-preview">
                                <img src="${product.image}" alt="${product.name}" class="img-fluid">
                                ${product.videoPreview ? `
                                    <button class="video-preview-btn" onclick="showVideoPreview('${product.videoPreview}')">
                                        <i class="fas fa-play"></i> Watch Preview
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h3>${product.name}</h3>
                            <div class="product-rating mb-3">
                                <div class="stars">
                                    ${'★'.repeat(Math.floor(product.rating))}${
                                        product.rating % 1 !== 0 ? '½' : ''}${
                                        '☆'.repeat(5 - Math.ceil(product.rating))}
                                </div>
                                <span class="rating-count">(${product.reviews.length} reviews)</span>
                            </div>
                            <p class="product-price h4">$${product.price.toFixed(2)}</p>
                            <p class="product-description">${product.description}</p>
                            <div class="product-meta">
                                <p><strong>Category:</strong> ${product.category}</p>
                                <p><strong>SKU:</strong> ${product.sku}</p>
                                <p><strong>Availability:</strong> 
                                    <span class="${product.inStock ? 'text-success' : 'text-danger'}">
                                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </p>
                            </div>
                            <div class="product-actions mt-4">
                                <button class="btn btn-primary btn-lg mr-2" 
                                        onclick="addToCart(${product.id})"
                                        ${!product.inStock ? 'disabled' : ''}>
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                                <button class="btn btn-outline-primary btn-lg" 
                                        onclick="addToWishlist(${product.id})">
                                    <i class="fas fa-heart"></i> Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    $(modal).modal('show');
    
    // Remove modal from DOM when hidden
    $(modal).on('hidden.bs.modal', function () {
        modal.remove();
    });
}

// UI Updates
function updateUserInterface() {
    // Update user menu
    if (elements.userMenuBtn) {
        if (appState.currentUser) {
            elements.userMenuBtn.innerHTML = `
                <img src="${appState.currentUser.avatar || 'images/default-avatar.jpg'}" alt="${appState.currentUser.name}">
                <span>${appState.currentUser.name}</span>
            `;
        } else {
            elements.userMenuBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Sign In</span>
            `;
        }
    }
    
    // Show/hide admin link
    if (elements.adminLink) {
        elements.adminLink.style.display = db.isAdmin() ? 'block' : 'none';
    }
    
    // Update cart
    updateCartDisplay();
}

// Toast Notifications
function showToast(title, message, type = 'success', persistent = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          'fa-info-circle'}"></i>
            <div class="toast-text">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            ${!persistent ? `
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </div>
        ${!persistent ? '<div class="toast-progress"></div>' : ''}
    `;

    document.body.appendChild(toast);

    if (!persistent) {
        const progressBar = toast.querySelector('.toast-progress');
        const closeBtn = toast.querySelector('.toast-close');
        
        closeBtn.onclick = () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        };

        setTimeout(() => {
            progressBar.style.width = '0%';
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 3000);
            }, 3000);
        }, 100);
    }

    return toast;
}

// Event Listeners
function setupEventListeners() {
    // Cart item quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const productId = parseInt(e.target.dataset.productId);
            const cart = db.getCart();
            const item = cart.find(i => i.productId === productId);
            
            if (e.target.classList.contains('plus')) {
                db.updateCartQuantity(productId, item.quantity + 1);
            } else if (e.target.classList.contains('minus') && item.quantity > 1) {
                db.updateCartQuantity(productId, item.quantity - 1);
            }
            
            updateCartDisplay();
        }
        
        if (e.target.classList.contains('remove-btn') || 
            e.target.closest('.remove-btn')) {
            const btn = e.target.classList.contains('remove-btn') ? 
                       e.target : e.target.closest('.remove-btn');
            const productId = parseInt(btn.dataset.productId);
            db.removeFromCart(productId);
            updateCartDisplay();
            showToast('Success', 'Item removed from cart');
        }
    });

    // Checkout button
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', function() {
            const cart = db.getCart();
            if (cart.length === 0) return;
            
            const order = db.createOrder({
                items: cart,
                total: parseFloat(elements.cartTotal.textContent.replace('$', '')),
                shipping: {
                    address: '',
                    city: '',
                    country: ''
                }
            });
            
            showToast('Success', 'Order placed successfully!');
            updateCartDisplay();
        });
    }
}

// Form Initialization
function initializeForms() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }

    // Search Form
    const searchForm = document.querySelector('form.d-flex');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

// Authentication Functions
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const address = document.getElementById('signupAddress').value;
    const profilePicture = document.getElementById('profilePicture').files[0];

    const newUser = {
        id: db.users.length + 1,
        name,
        email,
        phone,
        password,
        address,
        profilePicture: profilePicture ? URL.createObjectURL(profilePicture) : null,
        wishlist: [],
        orders: []
    };

    db.users.push(newUser);
    appState.currentUser = newUser;
    updateUserInterface();
    showToast('Success', 'Account created successfully!');
    $('#signupModal').modal('hide');
}

// Product Functions
function loadFeaturedProducts(filter = 'all') {
    const container = document.getElementById('featured-products');
    if (!container) return;

    container.innerHTML = '';
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    container.appendChild(loadingOverlay);

    setTimeout(() => {
        const products = filter === 'all' 
            ? db.products 
            : db.products.filter(p => p.type === filter);

        products.forEach(product => {
            container.appendChild(createProductCard(product));
        });
        loadingOverlay.remove();
    }, 500);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = `product-card${!product.inStock ? ' out-of-stock' : ''}`;
    
    // Add badges based on product type
    const badges = [];
    if (product.trending) badges.push('<span class="product-badge badge-trending">Trending</span>');
    if (product.isNew) badges.push('<span class="product-badge badge-new">New Arrival</span>');
    if (product.isBestSeller) badges.push('<span class="product-badge badge-bestseller">Best Seller</span>');
    
    card.innerHTML = `
        <div class="product-image">
            <div class="loading-spinner"></div>
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" 
                 onload="this.parentElement.querySelector('.loading-spinner').remove()">
            ${badges.join('')}
            ${product.videos ? `
                <button class="video-preview-btn" onclick="playProductVideo(${product.id})">
                    <i class="fas fa-play"></i>
                </button>
            ` : ''}
            <span class="product-type ${product.type}">${product.type}</span>
            <div class="card-img-overlay">
                <div class="product-actions">
                    <button class="btn btn-light btn-sm" onclick="addToWishlist(${product.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="btn btn-light btn-sm" onclick="quickView(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <div class="d-flex justify-content-between align-items-center">
                <p class="card-text mb-0">$${product.price}</p>
                <div class="rating">
                    <i class="fas fa-star text-warning"></i>
                    <span>${product.rating} (${product.reviews})</span>
                </div>
            </div>
        </div>
    `;
    return card;
}

function createGalleryItem(product, index) {
    const item = document.createElement('div');
    item.className = 'col-6 col-md-4 col-lg-3';
    item.innerHTML = `
        <div class="gallery-item">
            <img src="images/${product.images[index % product.images.length]}" 
                 alt="${product.name}" class="img-fluid">
            <div class="gallery-overlay">
                <div class="gallery-actions">
                    <button class="btn btn-light btn-sm" onclick="addToWishlist(${product.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="btn btn-light btn-sm" onclick="quickView(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    return item;
}

function loadProductGallery() {
    const container = document.getElementById('product-gallery');
    if (!container) return;

    const galleryGrid = container.querySelector('.row');
    if (!galleryGrid) return;

    db.products.forEach((product, index) => {
        product.images.forEach((_, imageIndex) => {
            galleryGrid.appendChild(createGalleryItem(product, imageIndex));
        });
    });
}

// Cart Functions
function addToCart(productId) {
    if (!appState.currentUser) {
        $('#loginModal').modal('show');
        return;
    }

    const product = db.products.find(p => p.id === productId);
    if (product) {
        db.cart.push({
            productId,
            quantity: 1,
            userId: appState.currentUser.id
        });
        updateCartBadge();
        showToast('Success', 'Product added to cart!');
    }
}

function addToWishlist(productId) {
    if (!appState.currentUser) {
        $('#loginModal').modal('show');
        return;
    }

    if (!appState.currentUser.wishlist.includes(productId)) {
        appState.currentUser.wishlist.push(productId);
        showToast('Success', 'Added to wishlist!', 'success');
    } else {
        showToast('Info', 'Already in wishlist', 'info');
    }
}

// UI Functions
function updateCartBadge() {
    const cartButton = document.querySelector('[href="#cart"]');
    if (cartButton) {
        const cartCount = db.cart.filter(item => item.userId === appState.currentUser?.id).length;
        cartButton.setAttribute('data-count', cartCount);
    }
}

function showToast(title, message, type) {
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed bottom-0 end-0 m-3 bg-${type === 'error' ? 'danger' : type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${title}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body text-white">
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Special Offer Countdown
function startCountdown() {
    const countdownElement = document.getElementById('offer-countdown');
    if (!countdownElement) return;

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    function updateCountdown() {
        const now = new Date();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            countdownElement.innerHTML = 'Offer ended!';
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${hours}h ${minutes}m ${seconds}s left!`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Chat Functions
function initializeChat() {
    const chatButton = document.createElement('div');
    chatButton.className = 'chat-widget';
    chatButton.innerHTML = `
        <div class="chat-button">
            <i class="fas fa-comments"></i>
        </div>
        <div class="chat-window">
            <div class="chat-header bg-success text-white p-3">
                <h5 class="mb-0">Customer Support</h5>
            </div>
            <div class="chat-messages p-3" style="height: 300px; overflow-y: auto;">
                <div class="system-message">
                    Welcome to NOLIMITNOOR! How can we help you today?
                </div>
            </div>
            <div class="chat-input p-3 border-top">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Type your message...">
                    <button class="btn btn-success">Send</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(chatButton);

    const button = chatButton.querySelector('.chat-button');
    const window = chatButton.querySelector('.chat-window');
    button.addEventListener('click', () => {
        window.style.display = window.style.display === 'none' ? 'block' : 'none';
    });
}

// Search Function
function handleSearch(e) {
    e.preventDefault();
    const searchQuery = e.target.querySelector('input').value.toLowerCase();
    const results = db.products.filter(product => 
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery)
    );
    
    // Update UI with search results
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) {
        featuredContainer.innerHTML = '';
        if (results.length > 0) {
            results.forEach(product => {
                featuredContainer.appendChild(createProductCard(product));
            });
        } else {
            featuredContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>No products found</h3>
                    <p>Try different keywords or browse our categories</p>
                </div>
            `;
        }
    }
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Product Filtering
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadFeaturedProducts(filter);
        });
    });
}

// Video Control Functions
function initializeVideoControls() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        controls.innerHTML = `
            <button class="video-control-btn" onclick="togglePlay(this)">
                <i class="fas fa-pause"></i>
            </button>
            <button class="video-control-btn" onclick="toggleMute(this)">
                <i class="fas fa-volume-mute"></i>
            </button>
        `;
        video.parentElement.appendChild(controls);
    });
}

function togglePlay(btn) {
    const video = btn.closest('.category-card, .hero-section').querySelector('video');
    if (video.paused) {
        video.play();
        btn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        video.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function toggleMute(btn) {
    const video = btn.closest('.category-card, .hero-section').querySelector('video');
    video.muted = !video.muted;
    btn.innerHTML = video.muted ? 
        '<i class="fas fa-volume-mute"></i>' : 
        '<i class="fas fa-volume-up"></i>';
}

function playProductVideo(productId) {
    const product = db.products.find(p => p.id === productId);
    if (!product || !product.videos) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${product.name} - Preview</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-0">
                    <video class="w-100" controls>
                        <source src="videos/${product.videos[0]}" type="video/mp4">
                    </video>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Outfit Builder Functions
function initializeOutfitBuilder() {
    loadOutfitItems('tops');
    loadOutfitItems('bottoms');
    loadOutfitItems('accessories');
}

function loadOutfitItems(category) {
    const container = document.getElementById(`${category}Items`);
    if (!container) return;

    const items = db.products.filter(product => product.category === category);
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'outfit-item mb-2';
        itemElement.innerHTML = `
            <img src="images/${item.images[0]}" class="img-thumbnail" alt="${item.name}">
            <button class="btn btn-sm btn-success mt-1" onclick="addToOutfit('${category}', ${item.id})">
                Add to Outfit
            </button>
        `;
        container.appendChild(itemElement);
    });
}

function addToOutfit(category, itemId) {
    const item = db.products.find(p => p.id === itemId);
    if (!item) return;

    if (category === 'accessories') {
        appState.currentOutfit.accessories.push(item);
    } else {
        appState.currentOutfit[category] = item;
    }
    updateOutfitPreview();
}

function updateOutfitPreview() {
    const preview = document.getElementById('outfitPreview');
    if (!preview) return;

    preview.innerHTML = `
        <div class="d-flex justify-content-center align-items-center h-100">
            ${appState.currentOutfit.tops ? `<img src="images/${appState.currentOutfit.tops.images[0]}" class="outfit-preview-item">` : ''}
            ${appState.currentOutfit.bottoms ? `<img src="images/${appState.currentOutfit.bottoms.images[0]}" class="outfit-preview-item">` : ''}
            ${appState.currentOutfit.accessories.map(acc => `<img src="images/${acc.images[0]}" class="outfit-preview-item">`).join('')}
        </div>
    `;
}

function saveOutfit() {
    if (!appState.currentUser) {
        $('#loginModal').modal('show');
        return;
    }

    const outfit = {
        id: db.outfits.length + 1,
        userId: appState.currentUser.id,
        items: { ...appState.currentOutfit },
        created: new Date()
    };

    db.outfits.push(outfit);
    showToast('Success', 'Outfit saved!', 'success');
}

// AR Functions
function toggleAR() {
    if (!appState.arActive) {
        startAR();
    } else {
        stopAR();
    }
}

function startAR() {
    const arView = document.getElementById('arView');
    if (!arView) return;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            arView.innerHTML = '';
            arView.appendChild(video);
            appState.arActive = true;
        })
        .catch(err => {
            showToast('Error', 'Unable to access camera for AR', 'error');
        });
}

function stopAR() {
    const arView = document.getElementById('arView');
    if (!arView) return;

    const video = arView.querySelector('video');
    if (video) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.remove();
    }
    arView.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100">
            <i class="fas fa-camera fa-3x text-muted"></i>
        </div>
    `;
    appState.arActive = false;
}

// Loyalty Program Functions
function initializeLoyaltyProgram() {
    if (!appState.currentUser) return;

    const points = calculateUserPoints();
    const tier = getCurrentTier(points);
    updateLoyaltyUI(points, tier);
}

function calculateUserPoints() {
    if (!appState.currentUser) return 0;
    
    // In a real app, this would be stored in the database
    const totalSpent = db.cart
        .filter(item => item.userId === appState.currentUser.id)
        .reduce((total, item) => {
            const product = db.products.find(p => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);

    return Math.floor(totalSpent * db.rewards.pointsPerDollar);
}

function getCurrentTier(points) {
    return db.rewards.tiers
        .slice()
        .reverse()
        .find(tier => points >= tier.minPoints);
}

function updateLoyaltyUI(points, tier) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const nextTier = db.rewards.tiers.find(t => t.minPoints > points);
        const progress = nextTier 
            ? ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
            : 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Category Video Controls
function initializeCategoryVideoControls() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        const video = card.querySelector('video');
        const playPauseBtn = card.querySelector('.play-pause-btn');
        const muteBtn = card.querySelector('.mute-btn');
        const playPauseIcon = playPauseBtn.querySelector('i');
        const muteIcon = muteBtn.querySelector('i');
        
        // Add loading state
        video.classList.add('loading');
        
        // Play/Pause functionality
        playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (video.paused) {
                video.play();
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            } else {
                video.pause();
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
        });
        
        // Mute/Unmute functionality
        muteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            video.muted = !video.muted;
            if (video.muted) {
                muteIcon.classList.remove('fa-volume-up');
                muteIcon.classList.add('fa-volume-mute');
            } else {
                muteIcon.classList.remove('fa-volume-mute');
                muteIcon.classList.add('fa-volume-up');
            }
        });
        
        // Handle video loading
        video.addEventListener('loadstart', () => {
            video.classList.add('loading');
            card.querySelector('.category-overlay').classList.add('loading');
        });
        
        video.addEventListener('canplay', () => {
            video.classList.remove('loading');
            card.querySelector('.category-overlay').classList.remove('loading');
        });
        
        // Handle video errors
        video.addEventListener('error', () => {
            console.error('Error loading video:', video.error);
            // Fallback to static image
            const categoryName = card.querySelector('h3').textContent.toLowerCase().replace("'s", '').replace(' ', '-');
            video.style.display = 'none';
            card.style.backgroundImage = `url('images/collections/${categoryName}.jpg')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            
            // Hide video controls
            card.querySelector('.video-controls').style.display = 'none';
        });
        
        // Pause video when out of view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && !video.paused) {
                    video.pause();
                    playPauseIcon.classList.remove('fa-pause');
                    playPauseIcon.classList.add('fa-play');
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(card);
    });
}

// Media Upload Handlers
async function handleMediaUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // Show loading state
        const loadingToast = showToast('Uploading', 'Please wait...', 'info', true);
        
        // Validate file
        if (type === 'image' && !file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }
        if (type === 'video' && !file.type.startsWith('video/')) {
            throw new Error('Please select a valid video file');
        }

        // Check file size (10MB limit for images, 50MB for videos)
        const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }

        // Upload media
        const mediaItem = await db.uploadMedia(file, type);
        
        // Hide loading toast
        loadingToast.remove();
        
        // Show success message
        showToast('Success', 'Media uploaded successfully!');
        
        // Update UI
        updateMediaGallery();
        
        return mediaItem;
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Error', error.message, 'error');
    }
}

// Media Gallery Management
function updateMediaGallery() {
    const galleryContainer = document.getElementById('media-gallery');
    if (!galleryContainer) return;

    const media = db.getMedia();
    galleryContainer.innerHTML = '';

    media.forEach(item => {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'media-item';
        
        if (item.type === 'image') {
            mediaElement.innerHTML = `
                <div class="media-preview">
                    <img src="${item.url}" alt="${item.filename}" loading="lazy">
                    <div class="media-overlay">
                        <button onclick="deleteMedia(${item.id})" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="viewMedia(${item.id})" class="view-btn">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <span class="media-name">${item.filename}</span>
                    <span class="media-size">${formatFileSize(item.size)}</span>
                </div>
            `;
        } else if (item.type === 'video') {
            mediaElement.innerHTML = `
                <div class="media-preview video">
                    <video src="${item.url}" muted></video>
                    <div class="media-overlay">
                        <button onclick="deleteMedia(${item.id})" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="playVideo(${item.id})" class="play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <span class="media-name">${item.filename}</span>
                    <span class="media-size">${formatFileSize(item.size)}</span>
                </div>
            `;
        }
        
        galleryContainer.appendChild(mediaElement);
    });
}

// Media Actions
async function deleteMedia(mediaId) {
    try {
        const confirmed = await showConfirmDialog('Delete Media', 'Are you sure you want to delete this media item?');
        if (!confirmed) return;

        const success = db.deleteMedia(mediaId);
        if (success) {
            showToast('Success', 'Media deleted successfully');
            updateMediaGallery();
        } else {
            throw new Error('Failed to delete media');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Error', error.message, 'error');
    }
}

function viewMedia(mediaId) {
    const media = db.getMedia().find(m => m.id === mediaId);
    if (!media) return;

    const modal = document.createElement('div');
    modal.className = 'media-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn">&times;</button>
            ${media.type === 'image' 
                ? `<img src="${media.url}" alt="${media.filename}">`
                : `<video src="${media.url}" controls></video>`
            }
        </div>
    `;

    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}

function playVideo(mediaId) {
    const media = db.getMedia().find(m => m.id === mediaId);
    if (!media || media.type !== 'video') return;

    viewMedia(mediaId);
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="dialog-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        dialog.querySelector('.cancel-btn').onclick = () => {
            dialog.remove();
            resolve(false);
        };

        dialog.querySelector('.confirm-btn').onclick = () => {
            dialog.remove();
            resolve(true);
        };

        dialog.onclick = (e) => {
            if (e.target === dialog) {
                dialog.remove();
                resolve(false);
            }
        };

        document.body.appendChild(dialog);
    });
}

// Enhanced Toast Notifications
function showToast(title, message, type = 'success', persistent = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          'fa-info-circle'}"></i>
            <div class="toast-text">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            ${!persistent ? `
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </div>
        ${!persistent ? '<div class="toast-progress"></div>' : ''}
    `;

    document.body.appendChild(toast);

    if (!persistent) {
        const progressBar = toast.querySelector('.toast-progress');
        const closeBtn = toast.querySelector('.toast-close');
        
        closeBtn.onclick = () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        };

        setTimeout(() => {
            progressBar.style.width = '0%';
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 3000);
            }, 3000);
        }, 100);
    }

    return toast;
}

// Custom Video Controls
function initializeVideoControls(videoContainer) {
    const video = videoContainer.querySelector('video');
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    
    controls.innerHTML = `
        <div class="video-progress">
            <div class="progress-bar"></div>
            <div class="progress-handle"></div>
        </div>
        <div class="video-buttons">
            <button class="video-control-btn play-pause">
                <i class="fas fa-play"></i>
                <i class="fas fa-pause"></i>
            </button>
            <div class="video-time">
                <span class="current-time">0:00</span>
                <span>/</span>
                <span class="total-time">0:00</span>
            </div>
            <button class="video-control-btn mute">
                <i class="fas fa-volume-up"></i>
            </button>
            <div class="volume-slider">
                <div class="volume-bar"></div>
                <div class="volume-handle"></div>
            </div>
            <button class="video-control-btn fullscreen">
                <i class="fas fa-expand"></i>
            </button>
        </div>
    `;
    
    videoContainer.appendChild(controls);
    
    // Play/Pause
    const playPauseBtn = controls.querySelector('.play-pause');
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    // Progress Bar
    const progressBar = controls.querySelector('.progress-bar');
    const progressHandle = controls.querySelector('.progress-handle');
    
    video.addEventListener('timeupdate', () => {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
        progressHandle.style.left = `${progress}%`;
        
        const currentTime = controls.querySelector('.current-time');
        currentTime.textContent = formatTime(video.currentTime);
    });
    
    video.addEventListener('loadedmetadata', () => {
        const totalTime = controls.querySelector('.total-time');
        totalTime.textContent = formatTime(video.duration);
    });
    
    // Click on progress bar to seek
    const videoProgress = controls.querySelector('.video-progress');
    videoProgress.addEventListener('click', (e) => {
        const rect = videoProgress.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });
    
    // Volume Control
    const muteBtn = controls.querySelector('.mute');
    const volumeBar = controls.querySelector('.volume-bar');
    const volumeHandle = controls.querySelector('.volume-handle');
    
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
        updateVolumeUI(video.muted ? 0 : video.volume);
    });
    
    const volumeSlider = controls.querySelector('.volume-slider');
    volumeSlider.addEventListener('click', (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        const volume = (e.clientX - rect.left) / rect.width;
        video.volume = Math.max(0, Math.min(1, volume));
        video.muted = false;
        updateVolumeUI(video.volume);
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    });
    
    function updateVolumeUI(volume) {
        volumeBar.style.width = `${volume * 100}%`;
        volumeHandle.style.left = `${volume * 100}%`;
    }
    
    // Fullscreen
    const fullscreenBtn = controls.querySelector('.fullscreen');
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
    
    // Hide controls when mouse is inactive
    let timeout;
    videoContainer.addEventListener('mousemove', () => {
        controls.style.opacity = '1';
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (!video.paused) {
                controls.style.opacity = '0';
            }
        }, 3000);
    });
    
    videoContainer.addEventListener('mouseenter', () => {
        controls.style.opacity = '1';
    });
    
    videoContainer.addEventListener('mouseleave', () => {
        if (!video.paused) {
            controls.style.opacity = '0';
        }
    });
    
    // Initialize volume UI
    updateVolumeUI(video.volume);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showVideoPreview(videoUrl) {
    const modal = document.getElementById('videoPreviewModal');
    const video = document.getElementById('previewVideo');
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    
    // Replace existing video element with new container
    video.parentElement.replaceChild(videoContainer, video);
    videoContainer.appendChild(video);
    
    video.src = videoUrl;
    video.onloadeddata = () => {
        initializeVideoControls(videoContainer);
        $(modal).modal('show');
    };
    
    // Reset video and remove custom controls when modal is closed
    $(modal).on('hidden.bs.modal', function () {
        video.pause();
        video.currentTime = 0;
        video.src = '';
        const controls = videoContainer.querySelector('.video-controls');
        if (controls) controls.remove();
    });
}

// Product Display and Filtering
class ProductManager {
    constructor() {
        this.initializeEventListeners();
        this.loadProducts();
    }

    initializeEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.product-section');
                const category = e.target.dataset.category;
                this.filterProductsByCategory(section.id, category);
                
                // Update active tab
                section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Quick view
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-view-btn')) {
                const productId = e.target.closest('.product-card').dataset.productId;
                this.showQuickView(productId);
            }
        });

        // Modal quantity controls
        document.querySelector('.qty-btn.minus').addEventListener('click', () => {
            const input = document.getElementById('modalQuantity');
            if (input.value > 1) input.value = parseInt(input.value) - 1;
        });

        document.querySelector('.qty-btn.plus').addEventListener('click', () => {
            const input = document.getElementById('modalQuantity');
            input.value = parseInt(input.value) + 1;
        });

        // Cart sidebar
        document.getElementById('cart-icon').addEventListener('click', () => {
            document.getElementById('cartSidebar').classList.add('active');
        });

        document.querySelector('.close-cart').addEventListener('click', () => {
            document.getElementById('cartSidebar').classList.remove('active');
        });
    }

    loadProducts() {
        const products = db.getProductsWithMedia();
        
        // Load products for each section
        this.loadAdultWearProducts(products.filter(p => p.category === 'Adult Wear'));
        this.loadKidsWearProducts(products.filter(p => p.category === 'Kids Wear'));
        this.loadFootwearProducts(products.filter(p => p.category === 'Footwear'));
        this.loadUndergarmentProducts(products.filter(p => p.category === 'Undergarments'));
    }

    loadAdultWearProducts(products) {
        const container = document.getElementById('adult-wear-products');
        container.innerHTML = '';
        
        products.forEach(product => {
            container.appendChild(this.createProductCard(product));
        });
    }

    loadKidsWearProducts(products) {
        const container = document.getElementById('kids-wear-products');
        container.innerHTML = '';
        
        products.forEach(product => {
            container.appendChild(this.createProductCard(product));
        });
    }

    loadFootwearProducts(products) {
        const container = document.getElementById('footwear-products');
        container.innerHTML = '';
        
        products.forEach(product => {
            container.appendChild(this.createProductCard(product));
        });
    }

    loadUndergarmentProducts(products) {
        const container = document.getElementById('undergarments-products');
        container.innerHTML = '';
        
        products.forEach(product => {
            container.appendChild(this.createProductCard(product));
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                ${product.videoPreview ? `
                    <button class="video-preview-btn">
                        <i class="fas fa-play"></i>
                    </button>
                ` : ''}
                <div class="product-badges">
                    ${product.trending ? '<span class="badge badge-trending">Trending</span>' : ''}
                    ${product.isNew ? '<span class="badge badge-new">New</span>' : ''}
                    ${product.isBestSeller ? '<span class="badge badge-bestseller">Best Seller</span>' : ''}
                </div>
                <div class="product-actions">
                    <button class="quick-view-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="wishlist-btn">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <div class="size-options">
                    ${product.sizes.map(size => `
                        <button class="size-btn">${size}</button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addToCart(product.id);
        });

        card.querySelector('.wishlist-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWishlist(product.id);
        });

        if (product.videoPreview) {
            card.querySelector('.video-preview-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showVideoPreview(product.videoPreview);
            });
        }

        return card;
    }

    showQuickView(productId) {
        const product = db.getProductById(productId);
        if (!product) return;

        // Populate modal
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modalProductDescription').textContent = product.description;
        document.getElementById('modalMainImage').src = product.images[0];

        // Load thumbnails
        const thumbnailsContainer = document.getElementById('modalThumbnails');
        thumbnailsContainer.innerHTML = product.images.map(img => `
            <div class="thumbnail">
                <img src="${img}" alt="${product.name}">
            </div>
        `).join('');

        // Load size options
        const sizeOptions = document.getElementById('modalSizeOptions');
        sizeOptions.innerHTML = product.sizes.map(size => `
            <button class="size-btn">${size}</button>
        `).join('');

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        modal.show();
    }

    showVideoPreview(videoUrl) {
        const modal = document.createElement('div');
        modal.className = 'modal fade video-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <button type="button" class="btn-close" data-bs-dismiss="modal">×</button>
                    <div class="modal-body p-0">
                        <div class="video-container">
                            <video src="${videoUrl}" controls autoplay></video>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    filterProductsByCategory(sectionId, category) {
        const products = db.getProductsWithMedia().filter(p => {
            if (sectionId === 'adult-wear') {
                return p.category === 'Adult Wear' && p.type === category;
            } else if (sectionId === 'kids-wear') {
                return p.category === 'Kids Wear' && p.type === category;
            } else if (sectionId === 'footwear') {
                return p.category === 'Footwear' && p.type === category;
            } else if (sectionId === 'undergarments') {
                return p.category === 'Undergarments' && p.type === category;
            }
            return false;
        });

        const container = document.getElementById(`${sectionId}-products`);
        container.innerHTML = '';
        products.forEach(product => {
            container.appendChild(this.createProductCard(product));
        });
    }

    addToCart(productId) {
        try {
            const product = db.getProductById(productId);
            if (!product) throw new Error('Product not found');

            const cartItem = {
                productId,
                quantity: 1,
                size: null // Size should be selected before adding to cart
            };

            db.addToCart(cartItem);
            this.updateCartUI();
            showToast('Product added to cart', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    toggleWishlist(productId) {
        try {
            const product = db.getProductById(productId);
            if (!product) throw new Error('Product not found');

            const isInWishlist = db.toggleWishlistItem(productId);
            showToast(
                isInWishlist ? 'Added to wishlist' : 'Removed from wishlist',
                'success'
            );
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    updateCartUI() {
        const cartItems = db.getCartItems();
        const cartCount = document.querySelector('.cart-count');
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        // Update cart count
        cartCount.textContent = cartItems.length;

        // Update cart items
        cartItemsContainer.innerHTML = cartItems.map(item => {
            const product = db.getProductById(item.productId);
            return `
                <div class="cart-item" data-id="${item.productId}">
                    <img src="${product.images[0]}" alt="${product.name}">
                    <div class="item-details">
                        <h4>${product.name}</h4>
                        <p>Size: ${item.size || 'Not selected'}</p>
                        <p>$${product.price.toFixed(2)} × ${item.quantity}</p>
                    </div>
                    <div class="item-actions">
                        <button class="remove-item">×</button>
                    </div>
                </div>
            `;
        }).join('');

        // Update total
        const total = cartItems.reduce((sum, item) => {
            const product = db.getProductById(item.productId);
            return sum + (product.price * item.quantity);
        }, 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
});

// Premium Animation System
const luxuryAnimations = {
    fadeUp: (element, delay = 0) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    },
    
    scaleIn: (element, delay = 0) => {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        setTimeout(() => {
            element.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, delay);
    },
    
    parallax: (element) => {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            element.style.transform = `translate3d(0, ${rate}px, 0)`;
        });
    }
};

// Luxury Scroll Animations
document.addEventListener('DOMContentLoaded', () => {
    // Hero Section Animations
    const heroContent = document.querySelector('.hero-content');
    const heroElements = heroContent.children;
    Array.from(heroElements).forEach((element, index) => {
        luxuryAnimations.fadeUp(element, index * 200);
    });

    // Category Cards Animation
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        luxuryAnimations.scaleIn(card, index * 100);
    });

    // Product Cards Animation
    const productCards = document.querySelectorAll('.product-card');
    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                luxuryAnimations.scaleIn(entry.target);
                productObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    productCards.forEach(card => productObserver.observe(card));

    // Parallax Effects
    const heroVideo = document.querySelector('.hero-video');
    luxuryAnimations.parallax(heroVideo);
});

// Premium Navigation
class LuxuryNavigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.setupMegaMenus();
        this.setupSearchOverlay();
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            this.navbar.classList.add('navbar-scrolled');
        } else {
            this.navbar.classList.remove('navbar-scrolled');
        }

        if (currentScroll > this.lastScroll && currentScroll > 500) {
            this.navbar.classList.add('navbar-hidden');
        } else {
            this.navbar.classList.remove('navbar-hidden');
        }

        this.lastScroll = currentScroll;
    }

    setupMegaMenus() {
        const megaMenus = document.querySelectorAll('.mega-menu');
        megaMenus.forEach(menu => {
            menu.addEventListener('mouseenter', () => {
                menu.style.transform = 'translateY(0)';
                menu.style.opacity = '1';
            });

            menu.addEventListener('mouseleave', () => {
                menu.style.transform = 'translateY(10px)';
                menu.style.opacity = '0';
            });
        });
    }

    setupSearchOverlay() {
        const searchToggle = document.getElementById('searchToggle');
        const searchOverlay = document.querySelector('.search-overlay');
        const searchInput = searchOverlay.querySelector('input');

        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => searchInput.focus(), 300);
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }
}

// Premium Product Interactions
class LuxuryProductCard {
    constructor(card) {
        this.card = card;
        this.media = card.querySelector('.product-media');
        this.init();
    }

    setupMagneticEffect() {
        this.card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = this.card.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            
            const tiltX = (y - 0.5) * 10;
            const tiltY = (x - 0.5) * -10;
            
            this.card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        this.card.addEventListener('mouseleave', () => {
            this.card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }

    setupParallax() {
        if (this.media) {
            this.card.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = this.card.getBoundingClientRect();
                const x = (e.clientX - left) / width;
                const y = (e.clientY - top) / height;
                
                const moveX = (x - 0.5) * 20;
                const moveY = (y - 0.5) * 20;
                
                this.media.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
            });

            this.card.addEventListener('mouseleave', () => {
                this.media.style.transform = 'translateX(0) translateY(0)';
            });
        }
    }

    setupVideoPreview() {
        const videoPreview = this.card.querySelector('.video-preview');
        if (videoPreview) {
            videoPreview.addEventListener('click', () => {
                const videoUrl = videoPreview.dataset.video;
                if (videoUrl) {
                    this.openVideoModal(videoUrl);
                }
            });
        }
    }

    setupQuickView() {
        const quickViewBtn = this.card.querySelector('.quick-view-btn');
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', () => {
                this.openQuickViewModal();
            });
        }
    }

    openVideoModal(videoUrl) {
        const modal = document.createElement('div');
        modal.className = 'modal fade video-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <button type="button" class="close-modal" data-bs-dismiss="modal">×</button>
                    <div class="modal-body">
                        <div class="video-container">
                            <video src="${videoUrl}" controls autoplay></video>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    openQuickViewModal() {
        const productData = {
            title: this.card.dataset.title,
            price: this.card.dataset.price,
            description: this.card.dataset.description,
            images: JSON.parse(this.card.dataset.images || '[]')
        };

        const modal = document.createElement('div');
        modal.className = 'modal fade quick-view-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <button type="button" class="close-modal" data-bs-dismiss="modal">×</button>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="quick-view-gallery">
                                    <div class="main-image">
                                        <img src="${productData.images[0]}" alt="${productData.title}">
                                    </div>
                                    <div class="thumbnail-images">
                                        ${productData.images.map(img => `
                                            <div class="thumbnail">
                                                <img src="${img}" alt="${productData.title}">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="quick-view-details">
                                    <h3>${productData.title}</h3>
                                    <div class="quick-view-price">${productData.price}</div>
                                    <div class="quick-view-description">${productData.description}</div>
                                    <div class="size-options">
                                        ${['XS', 'S', 'M', 'L', 'XL'].map(size => `
                                            <div class="size-option">${size}</div>
                                        `).join('')}
                                    </div>
                                    <button class="btn btn-dark btn-lg mt-4">Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });

        // Setup thumbnail clicks
        const thumbnails = modal.querySelectorAll('.thumbnail');
        const mainImage = modal.querySelector('.main-image img');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                mainImage.src = thumb.querySelector('img').src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        // Setup size selection
        const sizeOptions = modal.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    init() {
        this.setupMagneticEffect();
        this.setupParallax();
        this.setupVideoPreview();
        this.setupQuickView();
    }
}

// Initialize Product Cards
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => new LuxuryProductCard(card));

    // Initialize smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize text reveal animation
    const textRevealElements = document.querySelectorAll('.text-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('span').forEach((span, index) => {
                    span.style.animationDelay = `${index * 0.1}s`;
                });
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    textRevealElements.forEach(el => observer.observe(el));

    // Initialize masonry layout
    const masonryGrids = document.querySelectorAll('.masonry-grid');
    masonryGrids.forEach(grid => {
        const resizeObserver = new ResizeObserver(() => {
            const items = grid.children;
            for (let item of items) {
                const height = item.getBoundingClientRect().height;
                const span = Math.ceil(height / 20);
                item.style.gridRowEnd = `span ${span}`;
            }
        });
        resizeObserver.observe(grid);
    });
});

// Advanced Loading States
class LoadingState {
    static add(element) {
        element.classList.add('loading');
        element.classList.add('loading-shimmer');
    }

    static remove(element) {
        element.classList.remove('loading');
        element.classList.remove('loading-shimmer');
    }
}

// Handle video loading
document.querySelectorAll('video').forEach(video => {
    LoadingState.add(video.parentElement);
    video.addEventListener('loadeddata', () => {
        LoadingState.remove(video.parentElement);
    });
});

// Handle image loading
document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
        LoadingState.add(img.parentElement);
        img.addEventListener('load', () => {
            LoadingState.remove(img.parentElement);
        });
    }
});

// Advanced Product Card Interactions
class ProductCard {
    constructor(element) {
        this.element = element;
        this.media = element.querySelector('.product-media');
        this.actions = element.querySelector('.product-actions');
        this.init();
    }

    init() {
        this.setupMagneticEffect();
        this.setupParallax();
        this.setupVideoPreview();
        this.setupQuickView();
    }

    setupMagneticEffect() {
        this.element.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = this.element.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            
            const tiltX = (y - 0.5) * 10;
            const tiltY = (x - 0.5) * -10;
            
            this.element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        this.element.addEventListener('mouseleave', () => {
            this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }

    setupParallax() {
        if (this.media) {
            this.element.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = this.element.getBoundingClientRect();
                const x = (e.clientX - left) / width;
                const y = (e.clientY - top) / height;
                
                const moveX = (x - 0.5) * 20;
                const moveY = (y - 0.5) * 20;
                
                this.media.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
            });

            this.element.addEventListener('mouseleave', () => {
                this.media.style.transform = 'translateX(0) translateY(0)';
            });
        }
    }

    setupVideoPreview() {
        const videoPreview = this.element.querySelector('.video-preview');
        if (videoPreview) {
            videoPreview.addEventListener('click', () => {
                const videoUrl = videoPreview.dataset.video;
                if (videoUrl) {
                    this.openVideoModal(videoUrl);
                }
            });
        }
    }

    setupQuickView() {
        const quickViewBtn = this.element.querySelector('.quick-view-btn');
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', () => {
                this.openQuickViewModal();
            });
        }
    }

    openVideoModal(videoUrl) {
        const modal = document.createElement('div');
        modal.className = 'modal fade video-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <button type="button" class="close-modal" data-bs-dismiss="modal">×</button>
                    <div class="modal-body">
                        <div class="video-container">
                            <video src="${videoUrl}" controls autoplay></video>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    openQuickViewModal() {
        const productData = {
            title: this.element.dataset.title,
            price: this.element.dataset.price,
            description: this.element.dataset.description,
            images: JSON.parse(this.element.dataset.images || '[]')
        };

        const modal = document.createElement('div');
        modal.className = 'modal fade quick-view-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <button type="button" class="close-modal" data-bs-dismiss="modal">×</button>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="quick-view-gallery">
                                    <div class="main-image">
                                        <img src="${productData.images[0]}" alt="${productData.title}">
                                    </div>
                                    <div class="thumbnail-images">
                                        ${productData.images.map(img => `
                                            <div class="thumbnail">
                                                <img src="${img}" alt="${productData.title}">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="quick-view-details">
                                    <h3>${productData.title}</h3>
                                    <div class="quick-view-price">${productData.price}</div>
                                    <div class="quick-view-description">${productData.description}</div>
                                    <div class="size-options">
                                        ${['XS', 'S', 'M', 'L', 'XL'].map(size => `
                                            <div class="size-option">${size}</div>
                                        `).join('')}
                                    </div>
                                    <button class="btn btn-dark btn-lg mt-4">Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });

        // Setup thumbnail clicks
        const thumbnails = modal.querySelectorAll('.thumbnail');
        const mainImage = modal.querySelector('.main-image img');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                mainImage.src = thumb.querySelector('img').src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        // Setup size selection
        const sizeOptions = modal.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }
}

// Initialize Product Cards
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => new ProductCard(card));

    // Initialize smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize text reveal animation
    const textRevealElements = document.querySelectorAll('.text-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('span').forEach((span, index) => {
                    span.style.animationDelay = `${index * 0.1}s`;
                });
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    textRevealElements.forEach(el => observer.observe(el));

    // Initialize masonry layout
    const masonryGrids = document.querySelectorAll('.masonry-grid');
    masonryGrids.forEach(grid => {
        const resizeObserver = new ResizeObserver(() => {
            const items = grid.children;
            for (let item of items) {
                const height = item.getBoundingClientRect().height;
                const span = Math.ceil(height / 20);
                item.style.gridRowEnd = `span ${span}`;
            }
        });
        resizeObserver.observe(grid);
    });
});

// Mobile-specific test suite
const mobileTests = {
    testGestures: () => {
        const gestureTest = document.createElement('div');
        gestureTest.className = 'gesture-test-area';
        gestureTest.style.cssText = 'position: fixed; top: -100%; left: -100%; width: 50px; height: 50px;';
        document.body.appendChild(gestureTest);

        let gesturesSupported = {
            swipe: false,
            pinch: false,
            tap: false,
            doubleTap: false
        };

        // Test swipe
        let touchStartX, touchEndX;
        gestureTest.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        gestureTest.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            if (Math.abs(touchEndX - touchStartX) > 50) {
                gesturesSupported.swipe = true;
            }
        });

        // Test tap and double tap
        let lastTap = 0;
        gestureTest.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            gesturesSupported.tap = true;
            
            if (tapLength < 500 && tapLength > 0) {
                gesturesSupported.doubleTap = true;
            }
            lastTap = currentTime;
        });

        // Simulate touch events
        const touchStart = new TouchEvent('touchstart', {
            bubbles: true,
            touches: [{ clientX: 0, clientY: 0 }]
        });
        const touchEnd = new TouchEvent('touchend', {
            bubbles: true,
            changedTouches: [{ clientX: 100, clientY: 0 }]
        });

        gestureTest.dispatchEvent(touchStart);
        gestureTest.dispatchEvent(touchEnd);

        document.body.removeChild(gestureTest);
        console.log('Gesture support:', gesturesSupported);
        return Object.values(gesturesSupported).some(v => v);
    },

    testPerformance: () => {
        const metrics = {
            fps: 0,
            loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
            resourceCount: performance.getEntriesByType('resource').length,
            memoryUsage: window.performance.memory ? window.performance.memory.usedJSHeapSize : 'Not available'
        };

        // Test FPS
        let frame = 0;
        const startTime = performance.now();
        const measureFPS = () => {
            frame++;
            const currentTime = performance.now();
            if (currentTime - startTime >= 1000) {
                metrics.fps = frame;
                console.log('Performance metrics:', metrics);
                return metrics;
            }
            requestAnimationFrame(measureFPS);
        };
        measureFPS();

        return metrics.loadTime < 3000 && metrics.fps >= 30;
    },

    testOfflineStorage: async () => {
        const testData = { test: 'data' };
        
        // Test LocalStorage
        try {
            // Show loading state
            const loadingToast = showToast('Uploading', 'Please wait...', 'info', true);
            
            // Validate file
            if (type === 'image' && !file.type.startsWith('image/')) {
                throw new Error('Please select a valid image file');
            }
            if (type === 'video' && !file.type.startsWith('video/')) {
                throw new Error('Please select a valid video file');
            }

            // Check file size (10MB limit for images, 50MB for videos)
            const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
            }

            // Upload media
            const mediaItem = await db.uploadMedia(file, type);
            
            // Hide loading toast
            loadingToast.remove();
            
            // Show success message
            showToast('Success', 'Media uploaded successfully!');
            
            // Update UI
            updateMediaGallery();
            
            return mediaItem;
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Error', error.message, 'error');
        }

        // Test IndexedDB
        const dbName = 'pwaTestDB';
        const storeName = 'testStore';
        
        try {
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (e) => {
                    e.target.result.createObjectStore(storeName);
                };
            });

            await new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(testData, 'testKey');
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            console.log('IndexedDB working');
            return true;
        } catch (e) {
            console.error('IndexedDB test failed:', e);
            return false;
        }
    },

    testNetworkResilience: async () => {
        const results = {
            cacheHit: false,
            offlineAccess: false,
            backgroundSync: false
        };

        // Test cache hit
        try {
            const cache = await caches.open('nolimitnoor-v1');
            await cache.put('/test-cache', new Response('test'));
            const response = await cache.match('/test-cache');
            results.cacheHit = response !== undefined;
        } catch (e) {
            console.error('Cache test failed:', e);
        }

        // Test offline access
        try {
            const reg = await navigator.serviceWorker.ready;
            if (reg.sync) {
                results.backgroundSync = true;
            }
        } catch (e) {
            console.error('Background sync test failed:', e);
        }

        console.log('Network resilience results:', results);
        return Object.values(results).some(v => v);
    },

    testAppShell: () => {
        const requiredElements = [
            '.mobile-nav',
            '.app-shell',
            '.mobile-search',
            '.offline-indicator'
        ];

        const results = requiredElements.map(selector => {
            const element = document.querySelector(selector);
            return {
                element: selector,
                present: !!element,
                visible: element ? window.getComputedStyle(element).display !== 'none' : false
            };
        });

        console.log('App shell test results:', results);
        return results.every(r => r.present);
    },

    runAllMobileTests: async () => {
        const results = {
            gestures: mobileTests.testGestures(),
            performance: mobileTests.testPerformance(),
            offlineStorage: await mobileTests.testOfflineStorage(),
            networkResilience: await mobileTests.testNetworkResilience(),
            appShell: mobileTests.testAppShell()
        };

        // Update the test report UI
        const existingReport = document.querySelector('.pwa-test-report');
        if (existingReport) {
            const mobileSection = document.createElement('div');
            mobileSection.innerHTML = `
                <h3>Mobile-Specific Tests</h3>
                ${Object.entries(results).map(([test, passed]) => `
                    <div class="test-item">
                        <span>${test}:</span>
                        <span class="${passed ? 'success' : 'failure'}">
                            ${passed ? '✓' : '✗'}
                        </span>
                    </div>
                `).join('')}
            `;
            existingReport.appendChild(mobileSection);
        }

        console.table(results);
        return results;
    }
};

// Run mobile-specific tests in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        mobileTests.runAllMobileTests();
    });
}

// Mobile-specific features
const mobileFeatures = {
    // Pull to refresh implementation
    setupPullToRefresh() {
        let touchStart = 0;
        let touchMove = 0;
        let isRefreshing = false;
        const threshold = 150;
        const content = document.querySelector('.app-shell');

        content.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                touchStart = e.touches[0].clientY;
            }
        });

        content.addEventListener('touchmove', (e) => {
            if (touchStart > 0 && !isRefreshing) {
                touchMove = e.touches[0].clientY;
                const distance = touchMove - touchStart;
                
                if (distance > 0) {
                    e.preventDefault();
                    content.style.transform = `translateY(${Math.min(distance / 2, threshold)}px)`;
                }
            }
        });

        content.addEventListener('touchend', () => {
            if (touchMove - touchStart > threshold && !isRefreshing) {
                isRefreshing = true;
                this.refreshContent();
            }
            touchStart = 0;
            touchMove = 0;
            content.style.transform = '';
        });
    },

    // Refresh content implementation
    async refreshContent() {
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'refresh-indicator';
        refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
        document.body.appendChild(refreshIndicator);

        try {
            // Simulate content refresh
            await new Promise(resolve => setTimeout(resolve, 1500));
            window.location.reload();
        } finally {
            refreshIndicator.remove();
        }
    },

    // Bottom sheet implementation
    setupBottomSheet() {
        const sheet = document.querySelector('.filter-sheet');
        if (!sheet) return;

        let startY = 0;
        let currentY = 0;
        let initialHeight = 0;

        sheet.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            initialHeight = sheet.getBoundingClientRect().height;
            sheet.style.transition = 'none';
        });

        sheet.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            const newHeight = Math.max(initialHeight - deltaY, 100);
            sheet.style.height = `${newHeight}px`;
        });

        sheet.addEventListener('touchend', () => {
            sheet.style.transition = 'height 0.3s ease';
            if (currentY - startY > 100) {
                sheet.style.height = '0';
                setTimeout(() => sheet.classList.remove('open'), 300);
            } else {
                sheet.style.height = `${initialHeight}px`;
            }
        });
    },

    // Image gallery with swipe
    setupImageGallery() {
        const galleries = document.querySelectorAll('.product-gallery');
        galleries.forEach(gallery => {
            let startX = 0;
            let currentIndex = 0;
            const images = gallery.querySelectorAll('img');
            
            gallery.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            gallery.addEventListener('touchend', (e) => {
                const deltaX = e.changedTouches[0].clientX - startX;
                if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0 && currentIndex > 0) {
                        currentIndex--;
                    } else if (deltaX < 0 && currentIndex < images.length - 1) {
                        currentIndex++;
                    }
                    this.updateGallery(gallery, currentIndex);
                }
            });
        });
    },

    updateGallery(gallery, index) {
        const container = gallery.querySelector('.gallery-container');
        container.style.transform = `translateX(-${index * 100}%)`;
        
        // Update dots
        const dots = gallery.querySelectorAll('.gallery-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },

    // Share functionality
    setupSharing() {
        const shareButtons = document.querySelectorAll('.share-button');
        shareButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const data = {
                    title: button.dataset.title,
                    text: button.dataset.description,
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(data);
                        console.log('Shared successfully');
                    } catch (err) {
                        console.log('Share failed:', err);
                        this.showShareFallback(data);
                    }
                } else {
                    this.showShareFallback(data);
                }
            });
        });
    },

    showShareFallback(data) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-options">
                <button onclick="window.open('https://wa.me/?text=${encodeURIComponent(data.text + ' ' + data.url)}')">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button onclick="window.open('https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}')">
                    <i class="fab fa-telegram"></i> Telegram
                </button>
                <button onclick="window.open('mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.text + ' ' + data.url)}')">
                    <i class="fas fa-envelope"></i> Email
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    // Initialize all mobile features
    init() {
        this.setupPullToRefresh();
        this.setupBottomSheet();
        this.setupImageGallery();
        this.setupSharing();
        
        // Add offline detection
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
        });
        
        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
        });
    }
};

// Initialize mobile features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    mobileFeatures.init();
});
