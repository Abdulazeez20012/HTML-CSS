// Store data in localStorage for demo purposes
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active link
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(targetId).classList.remove('hidden');
    });
});

// Product Management
const productModal = document.querySelector('.product-modal');
const addProductBtn = document.querySelector('.add-product-btn');
const productForm = document.getElementById('product-form');
const productGrid = document.querySelector('.product-grid');

// Show product modal
addProductBtn.addEventListener('click', () => {
    productModal.classList.add('show');
    productForm.reset();
    document.querySelector('.image-preview').innerHTML = '';
});

// Close modal
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').classList.remove('show');
    });
});

// Handle image preview
document.getElementById('product-images').addEventListener('change', (e) => {
    const preview = document.querySelector('.image-preview');
    preview.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Handle form submission
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const product = {
        id: Date.now(),
        name: formData.get('product-name'),
        category: formData.get('product-category'),
        price: parseFloat(formData.get('product-price')),
        stock: parseInt(formData.get('product-stock')),
        description: formData.get('product-description'),
        badges: Array.from(document.querySelectorAll('.badge-options input:checked')).map(input => input.value)
    };
    
    // Handle image uploads
    const imageFiles = formData.getAll('product-images');
    const videoFile = formData.get('product-video');
    
    // In a real application, you would upload these files to a server
    // For demo purposes, we'll just store the file names
    product.images = Array.from(imageFiles).map(file => file.name);
    product.video = videoFile ? videoFile.name : null;
    
    // Add product to array and save to localStorage
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update product grid
    renderProducts();
    
    // Close modal
    productModal.classList.remove('show');
    productForm.reset();
});

// Render products
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0] || 'placeholder.jpg'}" alt="${product.name}">
                ${product.badges.map(badge => `<span class="badge ${badge}">${badge}</span>`).join('')}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">₦${product.price.toLocaleString()}</p>
                <p class="stock">Stock: ${product.stock}</p>
                <div class="product-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.product-card').dataset.id);
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.product-card').dataset.id);
            deleteProduct(productId);
        });
    });
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Fill form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-description').value = product.description;
    
    // Check badges
    product.badges.forEach(badge => {
        document.querySelector(`.badge-options input[value="${badge}"]`).checked = true;
    });
    
    // Show modal
    productModal.classList.add('show');
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
    }
}

// Search and filter products
document.querySelector('.search-input').addEventListener('input', filterProducts);
document.querySelector('.category-filter').addEventListener('change', filterProducts);

function filterProducts() {
    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    const category = document.querySelector('.category-filter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0] || 'placeholder.jpg'}" alt="${product.name}">
                ${product.badges.map(badge => `<span class="badge ${badge}">${badge}</span>`).join('')}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">₦${product.price.toLocaleString()}</p>
                <p class="stock">Stock: ${product.stock}</p>
                <div class="product-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize product grid
renderProducts();

// Sample data for orders table
const sampleOrders = [
    {
        id: 'ORD001',
        customer: 'John Doe',
        products: ['Evening Gown', 'Premium Jeans'],
        total: 70000,
        status: 'pending'
    },
    {
        id: 'ORD002',
        customer: 'Jane Smith',
        products: ['Business Suit'],
        total: 65000,
        status: 'shipped'
    }
];

// Render orders table
function renderOrders() {
    const ordersTable = document.querySelector('.orders-table tbody');
    ordersTable.innerHTML = sampleOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.products.join(', ')}</td>
            <td>₦${order.total.toLocaleString()}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>
                <button class="view-btn"><i class="fas fa-eye"></i></button>
                <button class="update-status-btn"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

// Sample data for customers table
const sampleCustomers = [
    {
        id: 'CUST001',
        name: 'John Doe',
        email: 'john@example.com',
        orders: 3,
        totalSpent: 135000
    },
    {
        id: 'CUST002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        orders: 1,
        totalSpent: 65000
    }
];

// Render customers table
function renderCustomers() {
    const customersTable = document.querySelector('.customers-table tbody');
    customersTable.innerHTML = sampleCustomers.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.orders}</td>
            <td>₦${customer.totalSpent.toLocaleString()}</td>
            <td>
                <button class="view-btn"><i class="fas fa-eye"></i></button>
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

// Initialize tables
renderOrders();
renderCustomers();
