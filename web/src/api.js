// api.js - Frontend API functions for bread bakery
export const API_BASE_URL = "http://localhost:3001";

// ============================================
// PRODUCTS
// ============================================

// Fetch all products (baker view - includes unavailable)
export const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Fetch available products only (customer view)
export const fetchAvailableProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products/available`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Fetch single product by ID
export const fetchProduct = async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Fetch products by category
export const fetchProductsByCategory = async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Fetch products filtered by allergens
// Pass { dairy: false, eggs: false, nuts: false } to exclude those allergens
export const fetchAllergenFreeProducts = async (filters) => {
    const queryParams = new URLSearchParams();
    if (filters.dairy === false) queryParams.append('dairy', 'false');
    if (filters.eggs === false) queryParams.append('eggs', 'false');
    if (filters.nuts === false) queryParams.append('nuts', 'false');

    const response = await fetch(`${API_BASE_URL}/products/filter/allergens?${queryParams}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Create new product
export const createProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Create product with image upload
export const createProductWithImage = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData, // FormData for multipart/form-data
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Update product
export const updateProduct = async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Toggle product availability
export const toggleProductAvailability = async (id, isAvailable) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Delete product
export const deleteProduct = async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// ============================================
// CATEGORIES
// ============================================

// Fetch all categories
export const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Fetch single category by ID
export const fetchCategory = async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Fetch category by slug
export const fetchCategoryBySlug = async (slug) => {
    const response = await fetch(`${API_BASE_URL}/categories/slug/${slug}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Create new category
export const createCategory = async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Update category
export const updateCategory = async (id, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// Delete category
export const deleteCategory = async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

// ============================================
// HELPER: Image URL
// ============================================
export const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${API_BASE_URL}/images/${imageName}`;
};
