// Admin State
let adminState = {
    currentSection: 'dashboard',
    mediaLibrary: {
        images: [],
        videos: []
    }
};

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadProducts();
    loadOrders();
    loadCategories();
    loadMediaLibrary();
    setupEventListeners();
    initializeCharts();
});

// Navigation
function initializeDashboard() {
    // Update stats
    updateDashboardStats();
    
    // Show active section
    showSection(adminState.currentSection);
}

function showSection(sectionId) {
    // Update active section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    adminState.currentSection = sectionId;
}

// Products Management
function loadProducts() {
    const products = db.getProducts();
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-image-small">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.inStock ? 'In Stock' : 'Out of Stock'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new product
document.getElementById('addProductForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const productData = {
        id: Date.now(),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        inStock: true,
        image: URL.createObjectURL(formData.get('image')),
        videoPreview: formData.get('video') ? URL.createObjectURL(formData.get('video')) : null
    };
    
    // Add to database
    const products = db.getProducts();
    products.push(productData);
    localStorage.setItem('nolimitnoor_products', JSON.stringify(products));
    
    // Update UI
    loadProducts();
    showToast('Success', 'Product added successfully!');
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
});

// Orders Management
function loadOrders() {
    const orders = db.getOrders();
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customerName || 'Guest'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary view-order" data-id="${order.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success update-status" data-id="${order.id}">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

// Categories Management
function loadCategories() {
    const categories = [
        { id: 'women', name: "Women's Collection", image: 'images/collections/womens-collection.jpg' },
        { id: 'men', name: "Men's Collection", image: 'images/collections/mens-collection.jpg' },
        { id: 'accessories', name: 'Accessories', image: 'images/collections/accessories.jpg' }
    ];
    
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <img src="${category.image}" alt="${category.name}">
            <div class="category-info">
                <h3>${category.name}</h3>
                <div class="btn-group">
                    <button class="btn btn-sm btn-primary edit-category" data-id="${category.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-category" data-id="${category.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Media Library
function loadMediaLibrary() {
    // Load from media structure
    const mediaGrid = document.getElementById('mediaGrid');
    if (!mediaGrid) return;
    
    // Combine images and videos
    const mediaItems = [
        ...adminState.mediaLibrary.images.map(img => ({
            type: 'image',
            url: img,
            thumbnail: img
        })),
        ...adminState.mediaLibrary.videos.map(video => ({
            type: 'video',
            url: video,
            thumbnail: 'images/video-thumbnail.jpg'
        }))
    ];
    
    mediaGrid.innerHTML = '';
    mediaItems.forEach(item => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.innerHTML = `
            ${item.type === 'image' 
                ? `<img src="${item.thumbnail}" alt="Media item">`
                : `<video src="${item.url}" poster="${item.thumbnail}"></video>`
            }
            <div class="media-actions">
                <button class="btn btn-sm btn-light preview-media">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-media">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        mediaGrid.appendChild(mediaItem);
    });
}

// Charts
function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart')?.getContext('2d');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#2ecc71',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Products Chart
    const productsCtx = document.getElementById('productsChart')?.getContext('2d');
    if (productsCtx) {
        new Chart(productsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Women', 'Men', 'Accessories'],
                datasets: [{
                    data: [300, 250, 100],
                    backgroundColor: ['#2ecc71', '#f1c40f', '#3498db']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Update Dashboard Stats
function updateDashboardStats() {
    const orders = db.getOrders();
    const products = db.getProducts();
    
    // Update stats
    document.querySelector('.total-orders').textContent = orders.length;
    document.querySelector('.total-products').textContent = products.length;
    document.querySelector('.total-customers').textContent = '25'; // Example value
    document.querySelector('.total-revenue').textContent = 
        '$' + orders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });
    
    // Media Upload
    document.getElementById('uploadMediaBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                if (file.type.startsWith('image/')) {
                    adminState.mediaLibrary.images.push(url);
                } else if (file.type.startsWith('video/')) {
                    adminState.mediaLibrary.videos.push(url);
                }
            });
            
            loadMediaLibrary();
            showToast('Success', `${files.length} files uploaded successfully!`);
        };
        
        input.click();
    });
    
    // Settings Form
    document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Success', 'Settings saved successfully!');
    });
}

// Toast Notifications
function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'white';
    toast.style.padding = '1rem';
    toast.style.borderRadius = '5px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    toast.style.zIndex = '9999';
    
    toast.innerHTML = `
        <h4 style="margin: 0; color: ${type === 'success' ? '#2ecc71' : '#e74c3c'}">${title}</h4>
        <p style="margin: 5px 0 0; color: #666">${message}</p>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Admin Media Management
class AdminMediaManager {
    constructor() {
        this.mediaGallery = document.getElementById('admin-media-gallery');
        this.uploadForm = document.getElementById('media-upload-form');
        this.initializeEventListeners();
        this.loadMedia();
    }

    initializeEventListeners() {
        // Media Upload
        this.uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const imageInput = document.getElementById('image-upload');
            const videoInput = document.getElementById('video-upload');
            
            try {
                if (imageInput.files.length) {
                    await this.handleMediaUpload(imageInput.files[0], 'image');
                }
                if (videoInput.files.length) {
                    await this.handleMediaUpload(videoInput.files[0], 'video');
                }
                this.loadMedia();
                showToast('Media uploaded successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    async handleMediaUpload(file, type) {
        try {
            const media = await db.uploadMedia(file, type);
            return media;
        } catch (error) {
            throw new Error(`Failed to upload ${type}: ${error.message}`);
        }
    }

    loadMedia() {
        const media = db.getAllMedia();
        this.mediaGallery.innerHTML = '';
        
        media.forEach(item => {
            const mediaCard = this.createMediaCard(item);
            this.mediaGallery.appendChild(mediaCard);
        });
    }

    createMediaCard(media) {
        const card = document.createElement('div');
        card.className = 'media-card';
        
        card.innerHTML = `
            <div class="media-preview">
                ${media.type === 'image' ? 
                    `<img src="${media.url}" alt="${media.name}" loading="lazy">` :
                    `<video src="${media.url}" muted></video>`
                }
                <div class="media-overlay">
                    <button class="preview-btn" onclick="adminMedia.previewMedia('${media.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-btn" onclick="adminMedia.confirmDelete('${media.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="media-info">
                <h4>${media.name}</h4>
                <p>Type: ${media.type}</p>
                <p>Size: ${this.formatSize(media.size)}</p>
                <p>Uploaded: ${new Date(media.dateUploaded).toLocaleDateString()}</p>
            </div>
        `;

        // Initialize video preview on hover
        if (media.type === 'video') {
            const video = card.querySelector('video');
            card.addEventListener('mouseenter', () => video.play());
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }

        return card;
    }

    previewMedia(mediaId) {
        const media = db.getMediaById(mediaId);
        if (!media) return;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${media.name}</h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${media.type === 'image' ?
                            `<img src="${media.url}" class="img-fluid" alt="${media.name}">` :
                            `<div class="video-container">
                                <video src="${media.url}" controls class="w-100"></video>
                            </div>`
                        }
                        <div class="media-metadata mt-3">
                            <h6>Media Information</h6>
                            <p><strong>Type:</strong> ${media.metadata.mimeType}</p>
                            <p><strong>Size:</strong> ${this.formatSize(media.size)}</p>
                            <p><strong>Uploaded:</strong> ${new Date(media.dateUploaded).toLocaleString()}</p>
                            <p><strong>Last Modified:</strong> ${new Date(media.metadata.lastModified).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        $(modal).modal('show');
        
        $(modal).on('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    async confirmDelete(mediaId) {
        const confirmed = await showConfirmDialog(
            'Delete Media',
            'Are you sure you want to delete this media? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                await db.deleteMedia(mediaId);
                this.loadMedia();
                showToast('Media deleted successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    }

    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
}

// Admin Product Management
class AdminProductManager {
    constructor() {
        this.productList = document.getElementById('admin-product-list');
        this.productForm = document.getElementById('product-form');
        this.initializeEventListeners();
        this.loadProducts();
    }

    initializeEventListeners() {
        this.productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                images: Array.from(formData.getAll('images')),
                videoPreview: formData.get('videoPreview'),
                inStock: formData.get('inStock') === 'true',
                trending: formData.get('trending') === 'true',
                isNew: formData.get('isNew') === 'true',
                isBestSeller: formData.get('isBestSeller') === 'true'
            };

            try {
                const product = await this.saveProduct(productData);
                this.loadProducts();
                showToast('Product saved successfully', 'success');
                $('#product-modal').modal('hide');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    async saveProduct(productData) {
        if (productData.id) {
            return db.updateProduct(productData.id, productData);
        } else {
            return db.createProduct(productData);
        }
    }

    loadProducts() {
        const products = db.getProductsWithMedia();
        this.productList.innerHTML = '';
        
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            this.productList.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card admin-product-card';
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                ${product.videoPreview ? `
                    <button class="video-preview-btn" onclick="adminProducts.previewVideo('${product.videoPreview}')">
                        <i class="fas fa-play"></i>
                    </button>
                ` : ''}
                <div class="product-badges">
                    ${product.trending ? '<span class="badge badge-trending">Trending</span>' : ''}
                    ${product.isNew ? '<span class="badge badge-new">New</span>' : ''}
                    ${product.isBestSeller ? '<span class="badge badge-bestseller">Best Seller</span>' : ''}
                </div>
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="category">${product.category}</p>
                <div class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="adminProducts.editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="adminProducts.confirmDelete('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return card;
    }

    async editProduct(productId) {
        const product = db.getProductById(productId);
        if (!product) return;

        // Populate form with product data
        const form = this.productForm;
        form.elements['id'].value = product.id;
        form.elements['name'].value = product.name;
        form.elements['description'].value = product.description;
        form.elements['price'].value = product.price;
        form.elements['category'].value = product.category;
        form.elements['inStock'].value = product.inStock;
        form.elements['trending'].checked = product.trending;
        form.elements['isNew'].checked = product.isNew;
        form.elements['isBestSeller'].checked = product.isBestSeller;

        // Show current images
        const imageGallery = document.getElementById('product-images-preview');
        imageGallery.innerHTML = '';
        product.images.forEach(imageUrl => {
            const img = document.createElement('div');
            img.className = 'preview-image';
            img.innerHTML = `
                <img src="${imageUrl}" alt="Product Image">
                <button type="button" class="remove-image" onclick="adminProducts.removeImage(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            imageGallery.appendChild(img);
        });

        $('#product-modal').modal('show');
    }

    async confirmDelete(productId) {
        const confirmed = await showConfirmDialog(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                await db.deleteProduct(productId);
                this.loadProducts();
                showToast('Product deleted successfully', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    }

    previewVideo(videoUrl) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Video Preview</h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="video-container">
                            <video src="${videoUrl}" controls class="w-100"></video>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        $(modal).modal('show');
        
        $(modal).on('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    removeImage(button) {
        button.closest('.preview-image').remove();
    }
}

// Initialize Admin Managers
const adminMedia = new AdminMediaManager();
const adminProducts = new AdminProductManager();

// Helper Functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           'info-circle'}"></i>
            <strong class="mr-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
    `;

    const container = document.querySelector('.toast-container') || (() => {
        const cont = document.createElement('div');
        cont.className = 'toast-container';
        document.body.appendChild(cont);
        return cont;
    })();

    container.appendChild(toast);
    $(toast).toast({ delay: 3000 }).toast('show');
    
    $(toast).on('hidden.bs.toast', () => {
        toast.remove();
        if (!container.hasChildNodes()) {
            container.remove();
        }
    });
}

function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-backdrop';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog-header">
                    <h4>${title}</h4>
                </div>
                <div class="confirm-dialog-body">
                    ${message}
                </div>
                <div class="confirm-dialog-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.confirm-dialog-backdrop').remove(); resolve(false);">
                        Cancel
                    </button>
                    <button class="btn btn-danger" onclick="this.closest('.confirm-dialog-backdrop').remove(); resolve(true);">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        dialog.querySelector('.btn-secondary').onclick = () => {
            dialog.remove();
            resolve(false);
        };
        dialog.querySelector('.btn-danger').onclick = () => {
            dialog.remove();
            resolve(true);
        };
    });
}
