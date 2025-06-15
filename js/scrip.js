const avatar = document.querySelector('.user-menu .avatar');
const menu = document.querySelector('.user-menu .menu');

avatar.addEventListener('click', () => {
  if (menu.style.display === 'block') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'block';
  }
});

document.addEventListener('click', (e) => {
  if (!avatar.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});
