// Local Storage Keys
const STORAGE_KEYS = {
    PRODUCTS: 'nolimitnoor_products',
    CART: 'nolimitnoor_cart',
    USERS: 'nolimitnoor_users',
    ORDERS: 'nolimitnoor_orders',
    CURRENT_USER: 'nolimitnoor_current_user',
    ADMIN_SETTINGS: 'nolimitnoor_admin_settings',
    MEDIA: 'nolimitnoor_media',
    CATEGORIES: 'nolimitnoor_categories'
};

// Default Admin User
const DEFAULT_ADMIN = {
    id: 1,
    email: 'admin@nolimitnoor.com',
    password: 'admin123', // In production, use proper password hashing
    name: 'Admin User',
    role: 'admin',
    avatar: './my pics 4.jpg'
};

// Initial Product Categories
const productCategories = {
    ADULT_WEAR: 'Adult Wear',
    KIDS_WEAR: 'Kids Wear',
    FOOTWEAR: 'Footwear',
    UNDERGARMENTS: 'Undergarments'
};

// Initial Products
const initialProducts = [
    {
        id: '1',
        name: "Men's Classic Fit Shirt",
        description: "Premium cotton classic fit shirt for men",
        price: 49.99,
        category: productCategories.ADULT_WEAR,
        images: [],
        inStock: true,
        trending: true,
        type: "men",
        sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: '2',
        name: "Women's Summer Dress",
        description: "Elegant floral summer dress for women",
        price: 79.99,
        category: productCategories.ADULT_WEAR,
        images: [],
        inStock: true,
        isNew: true,
        type: "women",
        sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
        id: '3',
        name: "Kids Denim Jeans",
        description: "Comfortable denim jeans for children",
        price: 34.99,
        category: productCategories.KIDS_WEAR,
        images: [],
        inStock: true,
        type: "unisex",
        sizes: ['2Y', '3Y', '4Y', '5Y', '6Y']
    },
    {
        id: '4',
        name: "Sports Running Shoes",
        description: "High-performance running shoes",
        price: 89.99,
        category: productCategories.FOOTWEAR,
        images: [],
        inStock: true,
        trending: true,
        type: "unisex",
        sizes: ['6', '7', '8', '9', '10', '11']
    },
    {
        id: '5',
        name: "Women's Comfort Bra",
        description: "Seamless comfort bra with wide straps",
        price: 29.99,
        category: productCategories.UNDERGARMENTS,
        images: [],
        inStock: true,
        isBestSeller: true,
        type: "women",
        sizes: ['32B', '34B', '36B', '32C', '34C', '36C']
    },
    {
        id: '6',
        name: "Men's Cotton Boxers Pack",
        description: "Pack of 3 comfortable cotton boxers",
        price: 24.99,
        category: productCategories.UNDERGARMENTS,
        images: [],
        inStock: true,
        type: "men",
        sizes: ['S', 'M', 'L', 'XL']
    }
];

// Database Class
class Database {
    constructor() {
        this.mediaStore = 'nolimitnoor_media';
        this.productStore = 'nolimitnoor_products';
        this.categoryStore = 'nolimitnoor_categories';
        this.users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        this.cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
        this.orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
        this.media = JSON.parse(localStorage.getItem(this.mediaStore)) || [];
        this.products = JSON.parse(localStorage.getItem(this.productStore)) || [];
        this.categories = JSON.parse(localStorage.getItem(this.categoryStore)) || [];
        this.initializeStores();
    }

    initializeStores() {
        // Initialize users if not exists
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]));
        }
        
        // Initialize products if not exists
        if (!localStorage.getItem(this.productStore)) {
            localStorage.setItem(this.productStore, JSON.stringify(initialProducts));
        }
        
        // Initialize cart if not exists
        if (!localStorage.getItem(STORAGE_KEYS.CART)) {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        }
        
        // Initialize orders if not exists
        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        }

        // Initialize admin settings if not exists
        if (!localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify({
                storeName: 'NOLIMITNOOR',
                currency: 'USD',
                primaryColor: '#2ecc71',
                secondaryColor: '#f1c40f'
            }));
        }
    }

    // Media Management
    async uploadMedia(file, type) {
        return new Promise((resolve, reject) => {
            // Validate file type
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const allowedVideoTypes = ['video/mp4', 'video/webm'];
            
            if (type === 'image' && !allowedImageTypes.includes(file.type)) {
                reject(new Error('Invalid image type. Please upload JPEG, PNG, or WebP files.'));
                return;
            }
            
            if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
                reject(new Error('Invalid video type. Please upload MP4 or WebM files.'));
                return;
            }

            // Validate file size
            const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
            if (file.size > maxSize) {
                reject(new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`));
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    if (type === 'image') {
                        // Validate image dimensions
                        const img = new Image();
                        img.src = e.target.result;
                        await new Promise((resolve) => {
                            img.onload = resolve;
                        });
                        
                        if (img.width < 1200 || img.height < 1200) {
                            reject(new Error('Image resolution too low. Minimum dimensions are 1200x1200px.'));
                            return;
                        }
                    }

                    const media = {
                        id: Date.now().toString(),
                        type: type,
                        name: file.name,
                        size: file.size,
                        dateUploaded: new Date().toISOString(),
                        url: e.target.result,
                        metadata: {
                            mimeType: file.type,
                            lastModified: new Date(file.lastModified).toISOString()
                        }
                    };

                    this.media.push(media);
                    this.saveToLocalStorage(this.mediaStore);
                    resolve(media);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    deleteMedia(mediaId) {
        const mediaIndex = this.media.findIndex(media => media.id === mediaId);
        
        if (mediaIndex === -1) {
            throw new Error('Media not found');
        }

        // Check if media is used in any products or categories
        const products = this.products;
        const categories = this.categories;

        const isUsedInProduct = products.some(product => 
            product.images.includes(mediaId) || product.videoPreview === mediaId
        );

        const isUsedInCategory = categories.some(category => 
            category.backgroundVideo === mediaId || category.backgroundImage === mediaId
        );

        if (isUsedInProduct || isUsedInCategory) {
            throw new Error('Cannot delete media that is currently in use');
        }

        this.media.splice(mediaIndex, 1);
        this.saveToLocalStorage(this.mediaStore);
        return true;
    }

    getAllMedia() {
        return this.media;
    }

    getMediaById(mediaId) {
        return this.media.find(media => media.id === mediaId);
    }

    // Product Management with Media
    createProduct(productData) {
        // Validate media references
        if (productData.images) {
            productData.images.forEach(imageId => {
                if (!this.getMediaById(imageId)) {
                    throw new Error(`Invalid image reference: ${imageId}`);
                }
            });
        }
        
        if (productData.videoPreview) {
            if (!this.getMediaById(productData.videoPreview)) {
                throw new Error('Invalid video preview reference');
            }
        }

        const product = {
            id: Date.now().toString(),
            ...productData,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        this.products.push(product);
        this.saveToLocalStorage(this.productStore);
        return product;
    }

    updateProduct(productId, updates) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            throw new Error('Product not found');
        }

        // Validate media references in updates
        if (updates.images) {
            updates.images.forEach(imageId => {
                if (!this.getMediaById(imageId)) {
                    throw new Error(`Invalid image reference: ${imageId}`);
                }
            });
        }
        
        if (updates.videoPreview) {
            if (!this.getMediaById(updates.videoPreview)) {
                throw new Error('Invalid video preview reference');
            }
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            ...updates,
            dateModified: new Date().toISOString()
        };

        this.saveToLocalStorage(this.productStore);
        return this.products[productIndex];
    }

    // Category Management with Media
    createCategory(categoryData) {
        // Validate media references
        if (categoryData.backgroundImage) {
            if (!this.getMediaById(categoryData.backgroundImage)) {
                throw new Error('Invalid background image reference');
            }
        }
        
        if (categoryData.backgroundVideo) {
            if (!this.getMediaById(categoryData.backgroundVideo)) {
                throw new Error('Invalid background video reference');
            }
        }

        const category = {
            id: Date.now().toString(),
            ...categoryData,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        this.categories.push(category);
        this.saveToLocalStorage(this.categoryStore);
        return category;
    }

    updateCategory(categoryId, updates) {
        const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
        
        if (categoryIndex === -1) {
            throw new Error('Category not found');
        }

        // Validate media references in updates
        if (updates.backgroundImage) {
            if (!this.getMediaById(updates.backgroundImage)) {
                throw new Error('Invalid background image reference');
            }
        }
        
        if (updates.backgroundVideo) {
            if (!this.getMediaById(updates.backgroundVideo)) {
                throw new Error('Invalid background video reference');
            }
        }

        this.categories[categoryIndex] = {
            ...this.categories[categoryIndex],
            ...updates,
            dateModified: new Date().toISOString()
        };

        this.saveToLocalStorage(this.categoryStore);
        return this.categories[categoryIndex];
    }

    // Helper Methods
    getProductsWithMedia() {
        const media = this.media;
        
        return this.products.map(product => ({
            ...product,
            images: product.images.map(imageId => 
                media.find(m => m.id === imageId)?.url || null
            ),
            videoPreview: product.videoPreview ? 
                media.find(m => m.id === product.videoPreview)?.url || null : null
        }));
    }

    getCategoriesWithMedia() {
        const media = this.media;
        
        return this.categories.map(category => ({
            ...category,
            backgroundImage: category.backgroundImage ? 
                media.find(m => m.id === category.backgroundImage)?.url || null : null,
            backgroundVideo: category.backgroundVideo ? 
                media.find(m => m.id === category.backgroundVideo)?.url || null : null
        }));
    }

    // Search and Filter Methods
    searchProducts(query) {
        const products = this.getProductsWithMedia();
        const searchTerm = query.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    filterProducts(filters) {
        let products = this.getProductsWithMedia();
        
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        
        if (filters.priceRange) {
            products = products.filter(p => 
                p.price >= filters.priceRange.min && 
                p.price <= filters.priceRange.max
            );
        }
        
        if (filters.inStock !== undefined) {
            products = products.filter(p => p.inStock === filters.inStock);
        }
        
        if (filters.hasVideo !== undefined) {
            products = products.filter(p => 
                filters.hasVideo ? p.videoPreview !== null : p.videoPreview === null
            );
        }
        
        return products;
    }

    // Cart Management with Response Handling
    addToCart(productId, userId) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) throw new Error('Product not found');
            if (!userId) throw new Error('User not authenticated');

            const cartItem = {
                id: Date.now().toString(),
                productId,
                userId,
                quantity: 1,
                addedAt: new Date().toISOString()
            };

            this.cart.push(cartItem);
            this.saveToLocalStorage(STORAGE_KEYS.CART);
            return { success: true, cartItem };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    }

    removeFromCart(cartItemId, userId) {
        try {
            const index = this.cart.findIndex(item => item.id === cartItemId && item.userId === userId);
            if (index === -1) throw new Error('Cart item not found');

            this.cart.splice(index, 1);
            this.saveToLocalStorage(STORAGE_KEYS.CART);
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.message };
        }
    }

    // User Management with Response Handling
    async register(userData) {
        try {
            if (!userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            const existingUser = this.users.find(u => u.email === userData.email);
            if (existingUser) {
                throw new Error('Email already registered');
            }

            const user = {
                id: Date.now().toString(),
                ...userData,
                role: 'customer',
                createdAt: new Date().toISOString()
            };

            this.users.push(user);
            this.saveToLocalStorage(STORAGE_KEYS.USERS);
            return { success: true, user };
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility Functions
    saveToLocalStorage(key) {
        try {
            localStorage.setItem(key, JSON.stringify(this[key]));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            return false;
        }
    }

    getMedia() {
        return this.media;
    }

    getProducts() {
        return this.products;
    }

    getCart(userId) {
        return this.cart.filter(item => item.userId === userId);
    }

    // User Methods
    login(email, password) {
        const users = this.users;
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
        return null;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    }

    logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser?.role === 'admin';
    }

    // Order Methods
    createOrder(orderData) {
        const currentUser = this.getCurrentUser();
        const orders = this.orders;
        const newOrder = {
            id: Date.now().toString(),
            userId: currentUser?.id,
            customerName: currentUser?.name || orderData.customerName || 'Guest',
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        this.saveToLocalStorage(STORAGE_KEYS.ORDERS);
        this.clearCart();
        
        return newOrder;
    }

    getOrders() {
        return this.orders;
    }

    getUserOrders(userId) {
        const orders = this.orders;
        return orders.filter(order => order.userId === userId);
    }

    updateOrderStatus(orderId, status) {
        if (!this.isAdmin()) return null;
        
        const orders = this.orders;
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = status;
            this.saveToLocalStorage(STORAGE_KEYS.ORDERS);
            return order;
        }
        return null;
    }

    // Admin Settings Methods
    getAdminSettings() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS));
    }

    updateAdminSettings(settings) {
        if (!this.isAdmin()) return null;
        
        const currentSettings = this.getAdminSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(updatedSettings));
        return updatedSettings;
    }

    // Review Methods
    addReview(productId, reviewData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;
        
        const products = this.products;
        const product = products.find(p => p.id === productId);
        
        if (product) {
            const review = {
                id: Date.now().toString(),
                userId: currentUser.id,
                userName: currentUser.name,
                ...reviewData,
                createdAt: new Date().toISOString()
            };
            
            product.reviews.push(review);
            product.rating = this.calculateAverageRating(product.reviews);
            this.saveToLocalStorage(this.productStore);
            return review;
        }
        return null;
    }

    calculateAverageRating(reviews) {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((total, review) => total + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }

    clearCart() {
        this.cart = [];
        this.saveToLocalStorage(STORAGE_KEYS.CART);
    }
}

// Initialize database
const db = new Database();

// Export for use in other files
window.db = db;
