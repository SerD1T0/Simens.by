// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    window.allProducts = data.products;
    displayProducts(window.allProducts);
    setupNavigation();
    updateProductCounter(window.allProducts.length);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  }
}

function displayProducts(products) {
  const container = document.getElementById('products-container');
  const noProducts = document.getElementById('no-products');
  
  if (!container) return;
  
  if (products.length === 0) {
    container.innerHTML = '';
    noProducts.style.display = 'block';
    return;
  }
  
  noProducts.style.display = 'none';
  container.innerHTML = '';
  
  products.forEach(product => {
    container.innerHTML += createProductCard(product);
  });
  
  setupProductInteractions();
}

function createProductCard(product) {
  const saleBadge = product.isSale ? '<div class="sale-badge">АКЦИЯ</div>' : '';
  const oldPrice = product.oldPrice ? `<span class="product-old-price">${product.oldPrice} руб.</span>` : '';
  const stockBadge = !product.inStock ? '<div class="out-of-stock">Нет в наличии</div>' : '';
  
  return `
    <div class="product-card" data-category="${product.category}" data-id="${product.id}">
      ${stockBadge}
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}">
        ${saleBadge}
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        
        <div class="product-price">
          ${oldPrice}
          <span class="product-current-price">${product.price} руб.</span>
        </div>
        
        <button class="add-to-cart-btn" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
          ${product.inStock ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    </div>
  `;
}

// ==================== НАВИГАЦИЯ И ФИЛЬТРАЦИЯ ====================

function setupNavigation() {
  // Фильтры в каталоге
  document.querySelectorAll('.catalog-filter').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.catalog-filter').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.category;
      filterProducts(category);
    });
  });
  
  // Клики по категориям в навигации
  document.querySelectorAll('.category-item a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();
      filterBySubcategory(text);
      
      // Прокрутка к каталогу
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function filterProducts(category) {
  let filtered = category === 'all' 
    ? window.allProducts 
    : window.allProducts.filter(p => p.category === category);
  
  displayProducts(filtered);
  updateProductCounter(filtered.length);
}

function filterBySubcategory(subcategoryName) {
  // Активируем соответствующую категорию
  let targetCategory = '';
  
  if (subcategoryName.includes('Холодильник') || subcategoryName.includes('Стиральная') || 
      subcategoryName.includes('Посудомоечная') || subcategoryName.includes('Варочная') ||
      subcategoryName.includes('Микроволновая') || subcategoryName.includes('Кофемашина')) {
    targetCategory = 'Для кухни';
  } else if (subcategoryName.includes('Телевизор') || subcategoryName.includes('Кондиционер') ||
             subcategoryName.includes('Пылесос') || subcategoryName.includes('Акустика') ||
             subcategoryName.includes('Обогреватель') || subcategoryName.includes('Водонагреватель')) {
    targetCategory = 'Для дома';
  } else if (subcategoryName.includes('Электросамокат') || subcategoryName.includes('Электровелосипед') ||
             subcategoryName.includes('Электроскутер')) {
    targetCategory = 'Мобильность';
  }
  
  // Активируем кнопку категории
  document.querySelectorAll('.catalog-filter').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.catalog-filter[data-category="${targetCategory}"]`).classList.add('active');
  
  // Фильтруем товары
  const filtered = window.allProducts.filter(p => 
    p.category === targetCategory && 
    (p.subcategory === subcategoryName || p.name.includes(subcategoryName.split(' ')[0]))
  );
  
  displayProducts(filtered.length > 0 ? filtered : window.allProducts.filter(p => p.category === targetCategory));
  updateProductCounter(filtered.length);
}

// ==================== КОРЗИНА ====================

function setupProductInteractions() {
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.dataset.id;
      const product = window.allProducts.find(p => p.id == productId);
      
      if (product && product.inStock) {
        addToCart(product);
        this.textContent = 'Добавлено!';
        this.disabled = true;
        setTimeout(() => {
          this.textContent = 'В корзину';
          this.disabled = false;
        }, 2000);
      }
    });
  });
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === product.id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  showNotification(`${product.name} добавлен в корзину!`);
  updateCartCounter();
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById('cart-counter');
  if (counter) {
    counter.textContent = total;
  }
}

function updateProductCounter(count) {
  const counter = document.getElementById('product-counter');
  if (counter) {
    counter.textContent = `Найдено товаров: ${count}`;
  }
}

// ==================== ЗАГРУЗКА СТРАНИЦЫ ====================

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCounter();
});
