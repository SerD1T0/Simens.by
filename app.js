// Функция для отображения товаров
function displayProducts(category = 'all') {
    const productsGrid = document.getElementById('productsGrid');
    const totalProductsEl = document.getElementById('totalProducts');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    let totalProducts = 0;
    
    // Собираем все товары
    let productsToShow = [];
    
    if (category === 'all') {
        // Показываем все товары из всех категорий
        for (const categoryKey in productsDatabase) {
            productsToShow = productsToShow.concat(productsDatabase[categoryKey]);
        }
    } else {
        // Показываем товары только выбранной категории
        productsToShow = productsDatabase[category] || [];
    }
    
    totalProducts = productsToShow.length;
    
    // Отображаем каждый товар
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Создаем HTML для товара
        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-box"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-brand">Бренд: ${product.brand}</div>
                <div class="product-price">
                    <span class="current-price">${product.price} руб.</span>
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice} руб.</span>` : ''}
                </div>
                <div class="product-features">
                    ${product.features.map(feature => `<span>${feature}</span>`).join('')}
                </div>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    <span>${product.rating}</span>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> В корзину
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Обновляем счетчик товаров
    if (totalProductsEl) {
        totalProductsEl.textContent = totalProducts;
    }
}

// Функция для фильтрации по категориям
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс нажатой кнопке
            this.classList.add('active');
            
            // Получаем категорию из data-атрибута
            const category = this.getAttribute('data-category');
            
            // Отображаем товары выбранной категории
            displayProducts(category);
        });
    });
}

// Функция добавления в корзину (базовая версия)
function addToCart(productId) {
    // Находим товар во всей базе данных
    let foundProduct = null;
    
    for (const categoryKey in productsDatabase) {
        foundProduct = productsDatabase[categoryKey].find(p => p.id === productId);
        if (foundProduct) break;
    }
    
    if (foundProduct) {
        alert(`Товар "${foundProduct.name}" добавлен в корзину!`);
        // Здесь можно добавить логику для реальной корзины
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Отображаем все товары при загрузке
    displayProducts('all');
    
    // Настраиваем фильтры
    setupCategoryFilters();
    
    // Остальной ваш код...
});
