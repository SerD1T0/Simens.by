// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let allProducts = [];
let currentCategory = 'all';

// ==================== ЗАГРУЗКА ТОВАРОВ ====================
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    allProducts = data.products;
    displayProducts(allProducts);
    setupCategoryFilter();
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    document.getElementById('products-container').innerHTML = 
      '<p class="error">Ошибка загрузки товаров. Пожалуйста, обновите страницу.</p>';
  }
}

// ==================== ОТОБРАЖЕНИЕ ТОВАРОВ ====================
function displayProducts(products) {
  const container = document.getElementById('products-container');
  
  if (!container) {
    console.error('Контейнер для товаров не найден!');
    return;
  }
  
  if (products.length === 0) {
    container.innerHTML = '<p class="no-products">Товары не найдены</p>';
    return;
  }
  
  container.innerHTML = '';
  
  products.forEach(product => {
    const productHTML = createProductCard(product);
    container.innerHTML += productHTML;
  });
  
  // Добавляем обработчики для кнопок "В корзину"
  addCartEventListeners();
}

// ==================== СОЗДАНИЕ КАРТОЧКИ ТОВАРА ====================
function createProductCard(product) {
  const saleBadge = product.isSale ? 
    '<div class="sale-badge">АКЦИЯ</div>' : '';
  
  const oldPrice = product.oldPrice ? 
    `<span class="product-old-price">${product.oldPrice} руб.</span>` : '';
  
  const stockBadge = !product.inStock ? 
    '<div class="out-of-stock">Нет в наличии</div>' : '';
  
  const ratingStars = createRatingStars(product.rating);
  
  return `
    <div class="product-card" data-category="${product.category}" data-id="${product.id}">
      ${stockBadge}
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" 
             onerror="this.src='https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop'">
        ${saleBadge}
        <button class="quick-view" data-id="${product.id}">Быстрый просмотр</button>
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">
          ${ratingStars}
          <span class="rating-value">${product.rating}</span>
        </div>
        <p class="product-description">${product.description}</p>
        
        <div class="product-features">
          ${Object.entries(product.features || {})
            .slice(0, 2)
            .map(([key, value]) => `
              <div class="feature">
                <span class="feature-key">${key}:</span>
                <span class="feature-value">${value}</span>
              </div>
            `).join('')}
        </div>
        
        <div class="product-price">
          ${oldPrice}
          <span class="product-current-price">${product.price} руб.</span>
        </div>
        
        <div class="product-actions">
          <button class="add-to-cart-btn ${!product.inStock ? 'disabled' : ''}" 
                  data-id="${product.id}" 
                  ${!product.inStock ? 'disabled' : ''}>
            ${product.inStock ? 'В корзину' : 'Нет в наличии'}
          </button>
          <button class="buy-now-btn ${!product.inStock ? 'disabled' : ''}" 
                  data-id="${product.id}"
                  ${!product.inStock ? 'disabled' : ''}>
            Купить сейчас
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==================== СОЗДАНИЕ ЗВЁЗД РЕЙТИНГА ====================
function createRatingStars(rating) {
  let stars = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars += '<span class="star full">★</span>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars += '<span class="star half">★</span>';
    } else {
      stars += '<span class="star empty">★</span>';
    }
  }
  
  return stars;
}

// ==================== ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ ====================
function setupCategoryFilter() {
  const filterButtons = document.querySelectorAll('.category-filter');
  
  if (filterButtons.length === 0) {
    console.warn('Кнопки фильтрации не найдены');
    return;
  }
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Убираем активный класс у всех кнопок
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Добавляем активный класс текущей кнопке
      this.classList.add('active');
      
      // Получаем категорию для фильтрации
      currentCategory = this.getAttribute('data-category');
      
      // Фильтруем товары
      filterProductsByCategory();
    });
  });
}

function filterProductsByCategory() {
  let filteredProducts;
  
  if (currentCategory === 'all') {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(
      product => product.category === currentCategory
    );
  }
  
  displayProducts(filteredProducts);
  
  // Обновляем счетчик товаров
  updateProductCounter(filteredProducts.length);
}

function updateProductCounter(count) {
  const counter = document.getElementById('product-counter');
  if (counter) {
    counter.textContent = `Найдено товаров: ${count}`;
  }
}

// ==================== КОРЗИНА ====================
function addCartEventListeners() {
  // Кнопки "В корзину"
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      addToCart(productId);
    });
  });
  
  // Кнопки "Купить сейчас"
  document.querySelectorAll('.buy-now-btn').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      addToCart(productId);
      alert('Товар добавлен в корзину! Перейдите в корзину для оформления заказа.');
    });
  });
  
  // Кнопки "Быстрый просмотр"
  document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      quickViewProduct(productId);
    });
  });
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id == productId);
  
  if (!product) {
    console.error('Товар не найден:', productId);
    return;
  }
  
  if (!product.inStock) {
    alert('Этот товар временно отсутствует на складе');
    return;
  }
  
  // Получаем текущую корзину из localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Проверяем, есть ли товар уже в корзине
  const existingItem = cart.find(item => item.id == productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    });
  }
  
  // Сохраняем корзину в localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Показываем уведомление
  showNotification(`"${product.name}" добавлен в корзину!`);
  
  // Обновляем счетчик корзины
  updateCartCounter();
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartCounter = document.getElementById('cart-counter');
  if (cartCounter) {
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

function showNotification(message) {
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  // Добавляем в тело документа
  document.body.appendChild(notification);
  
  // Показываем уведомление
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
  
  // Закрытие по клику на крестик
  notification.querySelector('.notification-close').addEventListener('click', function() {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });
}

function quickViewProduct(productId) {
  const product = allProducts.find(p => p.id == productId);
  
  if (!product) return;
  
  const modalHTML = `
    <div class="quick-view-modal">
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-body">
          <div class="modal-image">
            <img src="${product.images[0]}" alt="${product.name}">
          </div>
          <div class="modal-info">
            <h2>${product.name}</h2>
            <div class="modal-price">${product.price} руб.</div>
            <p>${product.description}</p>
            <div class="modal-features">
              <h3>Характеристики:</h3>
              ${Object.entries(product.features || {})
                .map(([key, value]) => `
                  <div class="modal-feature">
                    <strong>${key}:</strong> ${value}
                  </div>
                `).join('')}
            </div>
            <button class="modal-add-to-cart" data-id="${product.id}">
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Добавляем модальное окно в body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Добавляем обработчики событий
  const modal = document.querySelector('.quick-view-modal');
  const closeBtn = modal.querySelector('.modal-close');
  const addToCartBtn = modal.querySelector('.modal-add-to-cart');
  
  // Закрытие модального окна
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Закрытие при клике вне контента
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Добавление в корзину
  addToCartBtn.addEventListener('click', () => {
    addToCart(product.id);
    modal.remove();
  });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
  // Загружаем товары
  loadProducts();
  
  // Инициализируем счетчик корзины
  updateCartCounter();
  
  // Добавляем кнопки фильтрации, если их нет в HTML
  addCategoryFilterIfMissing();
});

function addCategoryFilterIfMissing() {
  const filtersContainer = document.querySelector('.category-filters');
  
  if (!filtersContainer) {
    const recommendedSection = document.querySelector('h2:contains("Рекомендуемые товары")');
    
    if (recommendedSection) {
      const filtersHTML = `
        <div class="category-filters">
          <div class="filter-buttons">
            <button class="category-filter active" data-category="all">Все товары</button>
            <button class="category-filter" data-category="Для кухни">Для кухни</button>
            <button class="category-filter" data-category="Для дома">Для дома</button>
            <button class="category-filter" data-category="Мобильность">Мобильность</button>
          </div>
          <div id="product-counter" class="product-counter">Найдено товаров: 8</div>
        </div>
      `;
      
      recommendedSection.insertAdjacentHTML('afterend', filtersHTML);
    }
  }
}

// Полифил для contains для текстовых узлов
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.contains) {
  Element.prototype.contains = function contains(node) {
    if (!(0 in arguments)) {
      throw new TypeError('1 argument is required');
    }
    
    do {
      if (this === node) {
        return true;
      }
    } while (node = node && node.parentNode);
    
    return false;
  };
}
