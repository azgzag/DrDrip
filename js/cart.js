// js/cart.js

function addToCart(name, price) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${name} ajouté au panier !`);
}

function getCartItems() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function clearCart() {
  localStorage.removeItem('cart');
}

// Exemple basique : récupérer les articles dans le localStorage
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElem = document.getElementById('cart-count');
  if (cartCountElem) {
    cartCountElem.textContent = totalCount;
  }
}

// Appelle ça au chargement de la page
window.addEventListener('DOMContentLoaded', updateCartCount);
