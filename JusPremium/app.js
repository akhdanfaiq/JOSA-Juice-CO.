// ===== KONFIGURASI GOOGLE SHEETS =====
// Ganti URL ini dengan URL deployment Google Apps Script Anda
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGJRIGXfVtl91-PI6kQEmn2TN26cZlEyG0Elph18XqaebXsgBK1hOhCH0CK8hFkm1Ufg/exec';

// ===== DATA PRODUK =====
const products = [
  // Detoks
  { id: 1, name: "Jus Timun Lemon", category: "detox", emoji: "🥒🍋", price: 18000, desc: "Timun segar & lemon — kombinasi ringan untuk membuang racun dan menyegarkan tubuh.", badge: "bestseller", bg: "bg-detox" },
  { id: 2, name: "Jus Seledri Apel", category: "detox", emoji: "🌿🍎", price: 18000, desc: "Seledri & apel hijau — kaya serat dan klorofil untuk membersihkan sistem pencernaan.", badge: null, bg: "bg-detox" },
  { id: 3, name: "Jus Bayam Nanas", category: "detox", emoji: "🥬🍍", price: 18000, desc: "Bayam & nanas — bromelain alami yang membantu detoks dan meningkatkan metabolisme.", badge: null, bg: "bg-detox" },
  // Energi
  { id: 4, name: "Jus Pisang Kurma", category: "energy", emoji: "🍌🌴", price: 20000, desc: "Pisang & kurma — sumber energi alami yang cepat diserap, cocok sebelum aktivitas.", badge: "bestseller", bg: "bg-energy" },
  { id: 5, name: "Jus Alpukat Madu", category: "energy", emoji: "🥑🍯", price: 22000, desc: "Alpukat & madu — lemak sehat dan gula alami untuk stamina tahan lama.", badge: "new", bg: "bg-energy" },
  { id: 6, name: "Jus Mangga Jeruk", category: "energy", emoji: "🥭🍊", price: 18000, desc: "Mangga & jeruk — vitamin C tinggi dengan rasa manis segar yang membakar semangat.", badge: null, bg: "bg-energy" },
  // Imunitas
  { id: 7, name: "Jus Jeruk Wortel", category: "immunity", emoji: "🍊🥕", price: 18000, desc: "Jeruk & wortel — beta-karoten dan vitamin C untuk memperkuat daya tahan tubuh.", badge: "bestseller", bg: "bg-immunity" },
  { id: 8, name: "Jus Jambu Merah", category: "immunity", emoji: "🍎✨", price: 18000, desc: "Jambu biji merah — kandungan vitamin C 4x lebih tinggi dari jeruk, antioksidan kuat.", badge: null, bg: "bg-immunity" },
  { id: 9, name: "Jus Lemon Jahe", category: "immunity", emoji: "🍋🫚", price: 18000, desc: "Lemon & jahe — anti-inflamasi alami yang menghangatkan dan melindungi dari dalam.", badge: null, bg: "bg-immunity" },
  // Glow
  { id: 10, name: "Jus Semangka Stroberi", category: "glow", emoji: "🍉🍓", price: 20000, desc: "Semangka & stroberi — hidrasi maksimal dengan antioksidan untuk kulit bercahaya.", badge: "bestseller", bg: "bg-glow" },
  { id: 11, name: "Jus Pepaya Jeruk Nipis", category: "glow", emoji: "🥭🍋", price: 18000, desc: "Pepaya & jeruk nipis — enzim papain dan vitamin C untuk mencerahkan kulit secara alami.", badge: "new", bg: "bg-glow" },
  { id: 12, name: "Jus Mangga", category: "glow", emoji: "🥭", price: 18000, desc: "Mangga murni — kaya vitamin A dan E untuk regenerasi sel kulit dan tampilan glowing.", badge: null, bg: "bg-glow" },
];

// ===== FORMAT HARGA =====
function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('aurumCart') || '[]');

function saveCart() {
  localStorage.setItem('aurumCart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ===== RENDER PRODUK =====
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  const filtered = filter === 'all'
    ? products
    : filter === 'bestseller'
    ? products.filter(p => p.badge === 'bestseller')
    : products.filter(p => p.category === filter);

  const badgeLabel = { bestseller: 'Terlaris', new: 'Baru', limited: 'Terbatas' };

  grid.innerHTML = filtered.map(p => `
    <div class="product-card fade-in" data-id="${p.id}">
      <div class="product-img ${p.bg}">
        ${p.badge ? `<span class="product-badge badge-${p.badge}">${badgeLabel[p.badge]}</span>` : ''}
        <span style="font-size:4.5rem;filter:drop-shadow(0 10px 20px rgba(0,0,0,0.4))">${p.emoji}</span>
      </div>
      <div class="product-body">
        <p class="product-category">${p.category}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          <div class="product-price">${formatRupiah(p.price)}<small>/ 500ml</small></div>
          <button class="add-to-cart" onclick="addToCart(${p.id})" aria-label="Tambah ${p.name} ke keranjang">+</button>
        </div>
      </div>
    </div>
  `).join('');

  observeFadeIns();
}

// ===== KERANJANG =====
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.emoji} ${product.name} ditambahkan ke keranjang`);
  bumpBadge();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = getCartCount();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🧃</span>
        <p>Ritual Anda menanti.</p>
        <a href="#collection" class="btn-primary mt-4 inline-flex" onclick="closeCart()">Mulai Belanja</a>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  totalEl.textContent = formatRupiah(getCartTotal());

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <span class="cart-item-emoji">${item.emoji}</span>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatRupiah(item.price * item.qty)}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Kurangi">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Tambah">+</button>
          <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Hapus">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');

  // Delegasi event — satu listener, tidak ada inline onclick
  container.onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'inc') updateQty(id, 1);
    else if (action === 'dec') updateQty(id, -1);
    else if (action === 'remove') removeFromCart(id);
  };
}

function openCart() {
  renderCartItems();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function bumpBadge() {
  const badge = document.getElementById('cartCount');
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

// ===== CHECKOUT =====
function openCheckout() {
  if (cart.length === 0) {
    showToast('Keranjang Anda masih kosong!');
    return;
  }
  closeCart();

  // Render ringkasan pesanan
  const summary = document.getElementById('checkoutSummary');
  summary.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <span>${item.emoji} ${item.name} ×${item.qty}</span>
      <span>${formatRupiah(item.price * item.qty)}</span>
    </div>
  `).join('');

  document.getElementById('checkoutTotalDisplay').textContent = formatRupiah(getCartTotal());

  // Reset form & views
  document.getElementById('checkoutForm').reset();
  document.getElementById('checkoutFormView').style.display = 'block';
  document.getElementById('checkoutSuccessView').style.display = 'none';
  document.getElementById('submitOrderBtn').disabled = false;
  document.getElementById('submitOrderBtn').textContent = 'Konfirmasi Pesanan';

  const modal = document.getElementById('checkoutModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AUR-${ts}-${rand}`;
}

async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Memproses...';

  const orderId = generateOrderId();
  const nama = document.getElementById('fieldNama').value.trim();
  const wa = document.getElementById('fieldWa').value.trim();
  const email = document.getElementById('fieldEmail').value.trim();
  const alamat = document.getElementById('fieldAlamat').value.trim();
  const catatan = document.getElementById('fieldCatatan').value.trim();
  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const itemsText = cart.map(i => `${i.name} x${i.qty} (${formatRupiah(i.price * i.qty)})`).join(' | ');
  const total = getCartTotal();

  const payload = {
    orderId,
    waktu,
    nama,
    wa,
    email,
    alamat,
    catatan,
    items: itemsText,
    total: formatRupiah(total),
    totalAngka: total,
    status: 'Baru'
  };

  try {
    // Kirim ke Google Apps Script
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script memerlukan no-cors
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Tampilkan sukses (no-cors tidak bisa baca response, anggap sukses jika tidak error)
    onOrderSuccess(orderId, nama);
  } catch (err) {
    console.error('Gagal mengirim pesanan:', err);
    // Jika URL belum dikonfigurasi, tetap tampilkan sukses untuk demo
    if (APPS_SCRIPT_URL === 'GANTI_DENGAN_URL_APPS_SCRIPT_ANDA') {
      onOrderSuccess(orderId, nama);
    } else {
      btn.disabled = false;
      btn.textContent = 'Konfirmasi Pesanan';
      showToast('❌ Gagal mengirim pesanan. Coba lagi.');
    }
  }
}

function onOrderSuccess(orderId, nama) {
  // Kosongkan keranjang
  cart = [];
  saveCart();
  updateCartUI();

  // Tampilkan view sukses
  document.getElementById('checkoutFormView').style.display = 'none';
  document.getElementById('checkoutSuccessView').style.display = 'flex';
  document.getElementById('successName').textContent = nama;
  document.getElementById('successOrderId').textContent = `ID Pesanan: ${orderId}`;
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== NEWSLETTER =====
function handleNewsletter(e) {
  e.preventDefault();
  e.target.querySelector('input').value = '';
  showToast('✉️ Anda sudah bergabung dalam ritual. Selamat datang!');
}

// ===== FILTER TABS =====
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.dataset.filter);
    });
  });
}

// ===== CATEGORY CARDS =====
function initCategoryCards() {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const btn = document.querySelector(`.filter-btn[data-filter="${card.dataset.filter}"]`);
        if (btn) btn.click();
      }, 600);
    });
  });
}

// ===== NAVBAR SCROLL =====
function initNavbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('mobileMenu');
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.classList.add('hidden')));
}

// ===== FADE-IN OBSERVER =====
function observeFadeIns() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}

// ===== VIDEO MODAL =====
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const video = document.getElementById('processVideo');

  document.getElementById('watchProcessBtn').addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });

  function closeVideo() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    video.pause();
  }

  document.getElementById('modalClose').addEventListener('click', closeVideo);
  modal.addEventListener('click', e => { if (e.target === modal) closeVideo(); });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initFilters();
  initCategoryCards();
  initNavbar();
  initMobileMenu();
  initVideoModal();

  // Cart events
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  // cartShopLink di-render dinamis, pakai onclick langsung
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('checkoutModalClose').addEventListener('click', closeCheckout);

  updateCartUI();
  observeFadeIns();
});

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCart();
    closeCheckout();
    document.getElementById('videoModal').classList.remove('open');
    document.body.style.overflow = '';
  }
});
