// Secret Weapon DSP Shopify Theme JavaScript

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
  });
}

// Cart count update
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(data => {
      document.getElementById('cart-count').textContent = data.item_count;
    });
}

// Add to cart AJAX
document.addEventListener('submit', function(e) {
  if (e.target.matches('form[action="/cart/add"]')) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Update button state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitButton.disabled = true;
    
    fetch('/cart/add.js', {
      method: 'POST',
      body: new FormData(form)
    })
    .then(response => response.json())
    .then(data => {
      // Success animation
      submitButton.innerHTML = '<i class="fas fa-check"></i> Added!';
      updateCartCount();
      
      // Reset button after delay
      setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }, 2000);
      
      // Optional: Show cart drawer or notification
      showCartNotification(data);
    })
    .catch(error => {
      console.error('Error:', error);
      submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
      setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }, 2000);
    });
  }
});

// Cart notification
function showCartNotification(product) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div class="cart-notification-content">
      <i class="fas fa-check-circle"></i>
      <p>${product.title} added to cart!</p>
      <a href="/cart" class="btn btn-primary btn-small">View Cart</a>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Product variant selector
const variantSelects = document.querySelectorAll('.variant-select');
if (variantSelects.length > 0) {
  variantSelects.forEach(select => {
    select.addEventListener('change', function() {
      // Here you would typically update the product price and availability
      // based on the selected variant
      console.log('Variant changed:', this.value);
    });
  });
}

// Smooth scroll for anchor links
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

// Add CSS for cart notification
const style = document.createElement('style');
style.textContent = `
  .cart-notification {
    position: fixed;
    top: 100px;
    right: -400px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    transition: right 0.3s ease;
    z-index: 9999;
    backdrop-filter: blur(10px);
  }
  
  .cart-notification.show {
    right: 20px;
  }
  
  .cart-notification-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .cart-notification i {
    font-size: 1.5rem;
    color: #38f9d7;
  }
  
  .cart-notification p {
    margin: 0;
    font-weight: 500;
  }
  
  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .nav-links.mobile-active {
    display: flex !important;
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: var(--dark-bg);
    flex-direction: column;
    padding: 2rem;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    .cart-notification {
      left: 20px;
      right: 20px;
      transform: translateX(0);
    }
    
    .cart-notification.show {
      right: 20px;
    }
  }
`;
document.head.appendChild(style);