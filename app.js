// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let allProducts = [];
let currentCategory = 'all';

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
async function loadProducts() {
  try {
    console.log('Загрузка товаров...');
    const response = await fetch('products.json');
    const data = await response.json();
    allProducts = data.products;
    console.log('Загружено товаров:', allProducts.length);
    
    // Показываем все товары при загрузке
    displayProducts(allProducts);
    updateProductCounter(allProducts.length);
    
    // Убираем сообщение о загрузке
    document.querySelector('.loading')?.remove();
    
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    document.getElementById('products-container').innerHTML = 
      '<p class="error">Ошибка загрузки товаров. Проверьте файл products.json</p>';
  }
}

// ==================== ФИЛЬТРАЦИЯ ====================
function filterProducts(category) {
  console.log('Фильтрация по категории:', category);
  
  // Обновляем активную кнопку
  document.querySelectorAll('.catalog-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Активируем нужную кнопку
  const activeBtn = document.querySelector(`.catalog-filter[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  currentCategory = category;
  
  let filteredProducts;
  if (category === 'all') {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(product => product.category === category);
  }
  
  console.log('Найдено товаров:', filteredProducts.length);
  displayProducts(filteredProducts);
  updateProductCounter(filteredProducts.length);
  
  // Прокрутка к каталогу
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

function filterBySubcategory(subcategory) {
  console.log('Фильтрация по подкатегории:', subcategory);
  
  // Определяем основную категорию
  let mainCategory = 'all';
  if (subcategory.includes('Холодильник') || subcategory.includes('Стиральная') || 
      subcategory.includes('Посудомоечная') || subcategory.includes('Варочная') ||
      subcategory.includes('Микроволновая') || subcategory.includes('Кофемашина') ||
      subcategory.includes('Электроплит') || subcategory.includes('Духовка')) {
    mainCategory = 'Для кухни';
  } else if (subcategory.includes('Телевизор') || subcategory.includes('Кондиционер') ||
             subcategory.includes('Пылесос') || subcategory.includes('Акустика') ||
             subcategory.includes('Обогреватель') || subcategory.includes('Водонагреватель') ||
             subcategory.includes('Очиститель')) {
    mainCategory = 'Для дома';
  } else if (subcategory.includes('Электросамокат') || subcategory.includes('Электровелосипед') ||
             subcategory.includes('Электроскутер') || subcategory.includes('Аксессуар')) {
    mainCategory = 'Мобильность';
  }
  
  // Устанавливаем активную категорию
  filterProducts(mainCategory);
  
  // Если нужна точная фильтрация по подкатегории
  setTimeout(() => {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
      const productSubcat = product.getAttribute('data-subcategory') || 
                           product.querySelector('.product-title')?.textContent || '';
      if (productSubcat.includes(subcategory.split(' ')[0])) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
    
    // Пересчитываем видимые товары
    const visibleCount = document.querySelectorAll('.product-card[style="display: block"]').length;
    updateProductCounter(visibleCount);
  }, 100);
}

// ==================== ОТОБРАЖЕНИЕ ТОВАРОВ ====================
function displayProducts(products) {
  const container = document.getElementById('products-container');
  const noProducts = document.getElementById('no-products');
  
  if (!container) {
    console.error('Контейнер products-container не найден!');
    return;
  }
  
  if (!products || products.length === 0) {
    container.innerHTML = '';
    if (noProducts) noProducts.style.display = 'block';
    return;
  }
  
  if (noProducts) noProducts.style.display = 'none';
  
  let html = '';
  products.forEach(product => {
    html += createProductCard(product);
  });
  
  container.innerHTML = html;
  
  // Добавляем обработчики для кнопок
  addCartEventListeners();
}

function createProductCard(product) {
  // Бейдж акции
  const saleBadge = product.isSale ? 
    '<div class="sale-badge">АКЦИЯ</div>' : '';
  
  // Старая цена (если есть)
  const oldPrice = product.oldPrice ? 
    `<span class="product-old-price">${product.oldPrice} руб.</span>` : '';
  
  // Бейдж "Нет в наличии"
  const stockBadge = !product.inStock ? 
    '<div class="out-of-stock">Нет в наличии</div>' : '';
  
  // Кнопка (активная или нет)
  const buttonText = product.inStock ? 'В корзину' : 'Нет в наличии';
  const buttonClass = product.inStock ? 'add-to-cart-btn' : 'add-to-cart-btn disabled';
  
  return `
    <div class="product-card" data-category="${product.category}" data-subcategory="${product.subcategory}" data-id="${product.id}">
      ${stockBadge}
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" 
             onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'">
        ${saleBadge}
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-title">${product.name}</h3>
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
        
        <button class="${buttonClass}" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
          ${buttonText}
        </button>
      </div>
    </div>
  `;
}

// ==================== КОРЗИНА ====================
function addCartEventListeners() {
  document.querySelectorAll('.add-to-cart-btn:not(.disabled)').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      addToCart(productId);
      
      // Визуальный фидбэк
      const originalText = this.textContent;
      this.textContent = 'Добавлено!';
      this.style.background = '#28a745';
      
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = '';
      }, 1500);
    });
  });
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;
  
  // Получаем текущую корзину
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
  
  // Сохраняем в localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Показываем уведомление
  showNotification(`"${product.name}" добавлен в корзину!`);
  
  // Обновляем счетчик в шапке
  updateCartCounter();
}

function showNotification(message) {
  // Удаляем старое уведомление
  const oldNotification = document.querySelector('.notification');
  if (oldNotification) oldNotification.remove();
  
  // Создаем новое
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  document.body.appendChild(notification);
  
  // Показываем
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Закрытие по клику
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
  
  // Автоматическое скрытие через 3 секунды
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Обновляем счетчик в шапке (если есть)
  const cartCounter = document.querySelector('.cart-counter');
  if (cartCounter) {
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
}

function updateProductCounter(count) {
  const counter = document.getElementById('product-counter');
  if (counter) {
    counter.textContent = `Найдено товаров: ${count}`;
  }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Документ загружен');
  
  // Добавляем счетчик корзины в шапку (если его нет)
  addCartCounterToHeader();
  
  // Загружаем товары
  loadProducts();
  
  // Инициализируем счетчик корзины
  updateCartCounter();
});

function addCartCounterToHeader() {
  // Ищем существующий счетчик
  let cartCounter = document.querySelector('.cart-counter');
  
  // Если нет - создаем
  if (!cartCounter) {
    // Ищем контакты или телефон в шапке
    const header = document.querySelector('header') || document.body;
    
    // Создаем иконку корзины
    const cartIcon = document.createElement('div');
    cartIcon.className = 'cart-icon';
    cartIcon.innerHTML = `
      <a href="#cart" style="display: flex; align-items: center; gap: 5px;">
        🛒 Корзина <span class="cart-counter" style="background: #ff4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: none; text-align: center; line-height: 20px; font-size: 12px;">0</span>
      </a>
    `;
    
    // Добавляем в удобное место
    const phoneElement = document.querySelector('p:contains("+375")') || 
                         document.querySelector('header') || 
                         document.body;
    phoneElement.insertAdjacentElement('afterend', cartIcon);
  }
}
