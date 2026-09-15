/* ============================================================
   THÔNG TIN NGÂN HÀNG NHẬN TIỀN - BẠN BẮT BUỘC PHẢI SỬA 3 DÒNG NÀY
   Xem danh sách mã ngân hàng hợp lệ tại: https://vietqr.io/danh-sach-ngan-hang
   ============================================================ */
const BANK_ID = "TCB";              // Mã ngân hàng, ví dụ: VCB, TCB, MB, ACB...
const ACCOUNT_NO = "8854448888";     // Số tài khoản ngân hàng của bạn
const ACCOUNT_NAME = "TRAN THI MY HANH"; // Tên chủ tài khoản, KHÔNG DẤU, viết hoa

/* ===== Lấy các phần tử dùng chung ===== */
const productImages = document.querySelectorAll('.product-card img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('.product-card');

const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartSubtotal = document.getElementById('cartSubtotal');

const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutTotal = document.getElementById('checkoutTotal');
const orderForm = document.getElementById('orderForm');
const checkoutQR = document.getElementById('checkoutQR');
const qrImage = document.getElementById('qrImage');
const orderCodeEl = document.getElementById('orderCode');
const confirmPaidBtn = document.getElementById('confirmPaidBtn');
const checkoutSuccess = document.getElementById('checkoutSuccess');
const successOrderCode = document.getElementById('successOrderCode');
const closeSuccessBtn = document.getElementById('closeSuccessBtn');

/* ===== Định dạng tiền kiểu Việt Nam: 850000 -> "850.000đ" ===== */
function formatMoney(number) {
  return number.toLocaleString('vi-VN') + 'đ';
}

/* ================= 1. LIGHTBOX - ZOOM ẢNH ================= */
productImages.forEach(function (img) {
  img.addEventListener('click', function () {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
  });
});

lightboxImg.addEventListener('click', function () {
  lightboxImg.classList.toggle('zoomed');
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', function (event) {
  if (event.target === lightbox) closeLightbox();
});

function closeLightbox() {
  lightbox.classList.remove('active');
  lightboxImg.classList.remove('zoomed');
}

/* ================= 2. BỘ LỌC VÁY / ÁO DÀI ================= */
filterTabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    filterTabs.forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    productCards.forEach(function (card) {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* ================= 3. GIỎ HÀNG ================= */
// Giỏ hàng là 1 mảng object, mỗi object là 1 sản phẩm: {name, price, image, qty}
// Lưu vào localStorage để khách quay lại trang không bị mất giỏ hàng
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const existing = cart.find(function (item) { return item.name === product.name; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(Object.assign({}, product, { qty: 1 }));
  }
  saveCart();
  renderCart();
}

function changeQty(name, delta) {
  const item = cart.find(function (item) { return item.name === name; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(function (i) { return i.name !== name; });
  }
  saveCart();
  renderCart();
}

function removeFromCart(name) {
  cart = cart.filter(function (item) { return item.name !== name; });
  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
}

function renderCart() {
  // Cập nhật số lượng trên icon giỏ hàng
  const totalQty = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  cartCount.textContent = totalQty;

  // Vẽ lại danh sách sản phẩm trong giỏ
  cartItemsEl.innerHTML = '';

  if (cart.length === 0) {
    cartItemsEl.appendChild(cartEmpty);
    cartEmpty.classList.remove('hidden');
  } else {
    cart.forEach(function (item) {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML =
        '<img src="' + item.image + '" alt="' + item.name + '">' +
        '<div class="cart-item-info">' +
          '<h4>' + item.name + '</h4>' +
          '<p class="cart-item-price">' + formatMoney(item.price) + '</p>' +
          '<div class="cart-item-qty">' +
            '<button class="qty-minus">-</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="qty-plus">+</button>' +
          '</div>' +
          '<button class="cart-item-remove">Xóa</button>' +
        '</div>';

      el.querySelector('.qty-minus').addEventListener('click', function () {
        changeQty(item.name, -1);
      });
      el.querySelector('.qty-plus').addEventListener('click', function () {
        changeQty(item.name, 1);
      });
      el.querySelector('.cart-item-remove').addEventListener('click', function () {
        removeFromCart(item.name);
      });

      cartItemsEl.appendChild(el);
    });
  }

  cartSubtotal.textContent = formatMoney(getCartTotal());
}

// Gắn sự kiện cho từng nút "Thêm vào giỏ"
document.querySelectorAll('.add-to-cart').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const card = btn.closest('.product-card');
    addToCart({
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.querySelector('img').src
    });
  });
});

// Mở / đóng giỏ hàng
cartBtn.addEventListener('click', function () {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
});

function closeCart() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
}
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/* ================= 4. THANH TOÁN (CHECKOUT) ================= */
checkoutBtn.addEventListener('click', function () {
  if (cart.length === 0) return;

  // Hiện lại đúng màn hình nhập thông tin mỗi lần mở
  checkoutForm.classList.remove('hidden');
  checkoutQR.classList.add('hidden');
  checkoutSuccess.classList.add('hidden');

  // Đổ danh sách sản phẩm + tổng tiền vào khung thanh toán
  checkoutSummary.innerHTML = cart.map(function (item) {
    return '<div><span>' + item.name + ' x' + item.qty + '</span><span>' +
      formatMoney(item.price * item.qty) + '</span></div>';
  }).join('');
  checkoutTotal.textContent = formatMoney(getCartTotal());

  checkoutModal.classList.add('active');
  checkoutOverlay.classList.add('active');
  closeCart();
});

function closeCheckout() {
  checkoutModal.classList.remove('active');
  checkoutOverlay.classList.remove('active');
}
checkoutClose.addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', closeCheckout);

// Khi khách bấm "Xem mã QR thanh toán"
orderForm.addEventListener('submit', function (event) {
  event.preventDefault(); // chặn hành vi mặc định là reload trang

  const total = getCartTotal();
  const orderCode = 'DH' + Date.now().toString().slice(-6); // mã đơn tự sinh, ví dụ DH482913

  // Tạo link ảnh QR động từ VietQR - QR sẽ tự điền đúng số tiền và nội dung
  const qrUrl =
    'https://img.vietqr.io/image/' + BANK_ID + '-' + ACCOUNT_NO + '-compact2.png' +
    '?amount=' + total +
    '&addInfo=' + encodeURIComponent(orderCode) +
    '&accountName=' + encodeURIComponent(ACCOUNT_NAME);

  qrImage.src = qrUrl;
  orderCodeEl.textContent = orderCode;
  successOrderCode.textContent = orderCode;

  checkoutForm.classList.add('hidden');
  checkoutQR.classList.remove('hidden');
});

// Khi khách xác nhận đã chuyển khoản
confirmPaidBtn.addEventListener('click', function () {
  checkoutQR.classList.add('hidden');
  checkoutSuccess.classList.remove('hidden');

  // Xóa giỏ hàng vì đơn đã hoàn tất
  cart = [];
  saveCart();
  renderCart();
  orderForm.reset();
});

closeSuccessBtn.addEventListener('click', closeCheckout);

/* ================= 5. KHỞI TẠO KHI TẢI TRANG ================= */
renderCart();
