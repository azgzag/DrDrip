const cartItems = getCartItems();
const cartTable = document.getElementById('cart-items');
const totalDisplay = document.getElementById('total');
let total = 0;

cartTable.innerHTML = ''; // Vide avant de remplir

cartItems.forEach(item => {
  const itemTotal = item.price * item.quantity;
  total += itemTotal;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${item.name}</td>
    <td>${item.color}</td>
    <td>${item.size}</td>
    <td>${item.price.toFixed(2)} €</td>
    <td>${item.quantity}</td>
    <td>${itemTotal.toFixed(2)} €</td>
  `;
  cartTable.appendChild(row);
});

totalDisplay.textContent = `Total : ${total.toFixed(2)} €`;

document.getElementById('clear-cart-btn').addEventListener('click', () => {
  if (confirm('Es-tu sûr de vouloir vider ton panier ?')) {
    clearCart();
    location.reload();
  }
});

function addToCart(item) {
  const cart = getCartItems();
  const index = cart.findIndex(i => i.id === item.id && i.color === item.color && i.size === item.size);
  if (index > -1) {
    cart[index].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}
