/* ============================================================
   CHICK BUCK — ADMIN JS
   Preserves: Auth, Orders, Products, Analytics
   Adds: Banners, Homepage Builder, Theme, Website Settings
   ============================================================ */

// ─── 1. SUPABASE ─────────────────────────────────────────────
const SB_URL = 'https://fnqzyjwtkhvswczppbqu.supabase.co';
const SB_KEY = 'sb_publishable_rhDvNmXvmdHKVkYH1TumLA_VasvU1Uh';
const sbAdmin = window.supabase.createClient(SB_URL, SB_KEY);

// ─── 2. STATE ────────────────────────────────────────────────
let adminState = {
  currentView: 'dashboard',
  editingProduct: null,
  editingBanner:  null,
  settings:       null,
  homepageSections: [],
  charts: {}
};

// ─── 3. AUTH GUARD ───────────────────────────────────────────
sbAdmin.auth.getSession().then(({ data: { session } }) => {
  if (!session) { window.location.href = '/admin/login.html'; return; }
  initAdmin();
});

sbAdmin.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') window.location.href = '/admin/login.html';
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await sbAdmin.auth.signOut();
});

// ─── 4. INIT ─────────────────────────────────────────────────
async function initAdmin() {
  setupNavigation();
  loadDashboard();
  loadRealtimeOrders();
}

// ─── 5. NAVIGATION ───────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      if (!view) return;
      switchView(view);
      closeMobileMenu();
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) viewEl.style.display = 'block';

  const navLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
  if (navLink) navLink.classList.add('active');

  const titles = {
    'dashboard': 'Dashboard', 'orders': 'Orders',
    'products-manage': 'Products', 'banners': 'Offers & Banners',
    'homepage-builder': 'Homepage Builder', 'theme': 'Theme & Colors',
    'website-settings': 'Website Settings', 'products': 'Product Analytics',
    'reports': 'Reports'
  };
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = titles[viewName] || viewName;

  adminState.currentView = viewName;

  // Lazy load data
  switch(viewName) {
    case 'dashboard':       loadDashboard(); break;
    case 'orders':          loadAllOrders(); break;
    case 'products-manage': loadProductsAdmin(); break;
    case 'banners':         loadBannersAdmin(); break;
    case 'homepage-builder':loadHomepageBuilder(); break;
    case 'theme':           loadThemeSettings(); break;
    case 'website-settings':loadWebsiteSettings(); break;
    case 'products':        loadProductAnalytics(); break;
    case 'reports':         loadReports(); break;
  }
}

// ─── 6. MOBILE SIDEBAR ───────────────────────────────────────
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}
window.toggleMobileMenu = toggleMobileMenu;

// ─── 7. DASHBOARD ────────────────────────────────────────────
async function loadDashboard() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString();

  const { data: orders } = await sbAdmin.from('orders').select('*');
  const allOrders = orders || [];
  const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today);

  const totalRevenue = allOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const todayRevenue = todayOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const newOrders    = allOrders.filter(o => o.status === 'New').length;

  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid) {
    statsGrid.innerHTML = [
      { label: "Today's Revenue", value: `${todayRevenue.toFixed(2)} SR`, sub: `${todayOrders.length} orders today`, icon: '💰' },
      { label: "Total Revenue",   value: `${totalRevenue.toFixed(2)} SR`, sub: `All time`,                        icon: '📈' },
      { label: "Total Orders",    value: allOrders.length,                sub: `${newOrders} new / pending`,      icon: '📋' },
      { label: "New Orders",      value: newOrders,                       sub: 'Awaiting confirmation',           icon: '🔔' }
    ].map(s => `
      <div class="stat-card">
        <p class="stat-label">${s.label}</p>
        <div class="stat-value">${s.value}</div>
        <div class="stat-sub">${s.sub}</div>
      </div>
    `).join('');
  }

  // Recent orders
  const recentOrders = [...allOrders].sort((a,b) => new Date(b.created_at)-new Date(a.created_at)).slice(0, 10);
  const tbody = document.getElementById('recentOrdersTable');
  if (tbody) {
    tbody.innerHTML = recentOrders.map(o => `
      <tr>
        <td><strong>${o.order_number || o.id?.slice(0,8)}</strong></td>
        <td>${o.branch_name || o.branch_id || '—'}</td>
        <td>${o.customer_name || '—'}<br><small style="color:#94A3B8">${o.customer_phone || ''}</small></td>
        <td><strong>${parseFloat(o.total||0).toFixed(2)} SR</strong></td>
        <td><span class="badge badge-${(o.status||'new').toLowerCase()}">${o.status||'New'}</span></td>
        <td>${formatDate(o.created_at)}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;color:#94A3B8;padding:30px">No orders yet</td></tr>';
  }
}

// ─── 8. ORDERS ───────────────────────────────────────────────
async function loadAllOrders() {
  const branch   = document.getElementById('filterBranch')?.value   || 'all';
  const status   = document.getElementById('filterStatus')?.value   || 'all';
  const searchVal = document.getElementById('searchOrder')?.value?.toLowerCase() || '';

  let query = sbAdmin.from('orders').select('*').order('created_at', { ascending: false });
  if (branch !== 'all') query = query.eq('branch_id', branch);
  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  const orders = (data || []).filter(o => {
    if (!searchVal) return true;
    return (o.order_number || '').toLowerCase().includes(searchVal) ||
           (o.customer_name || '').toLowerCase().includes(searchVal) ||
           (o.customer_phone || '').includes(searchVal);
  });

  const tbody = document.getElementById('allOrdersTable');
  if (!tbody) return;
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.order_number || o.id?.slice(0,8)}</strong></td>
      <td>${formatDate(o.created_at)}</td>
      <td>${o.branch_name || o.branch_id}</td>
      <td>${o.customer_name || '—'}<br><small style="color:#94A3B8">${o.customer_phone || ''}</small></td>
      <td><span class="badge badge-${o.order_type === 'delivery' ? 'info' : 'new'}">${o.order_type === 'delivery' ? '🛵 Delivery' : '🛍️ Parcel'}</span></td>
      <td><strong>${parseFloat(o.total||0).toFixed(2)} SR</strong></td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['New','Confirmed','Preparing','Ready','Completed','Cancelled'].map(s =>
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn-icon edit" onclick="viewOrderDetail('${o.id}')" title="View">👁</button>
          <button class="btn-icon del" onclick="deleteOrder('${o.id}')" title="Delete">✕</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:30px">No orders found</td></tr>';
}

async function updateOrderStatus(orderId, status) {
  const { error } = await sbAdmin.from('orders').update({ status }).eq('id', orderId);
  if (error) alert('Failed to update status: ' + error.message);
}

async function deleteOrder(orderId) {
  if (!confirm('Delete this order? This cannot be undone.')) return;
  await sbAdmin.from('order_items').delete().eq('order_id', orderId);
  await sbAdmin.from('orders').delete().eq('id', orderId);
  loadAllOrders();
}

async function viewOrderDetail(orderId) {
  const { data: order } = await sbAdmin.from('orders').select('*').eq('id', orderId).single();
  const { data: items  } = await sbAdmin.from('order_items').select('*').eq('order_id', orderId);
  if (!order) return;
  alert([
    `Order #${order.order_number || orderId}`,
    `Branch: ${order.branch_name}`,
    `Customer: ${order.customer_name} — ${order.customer_phone}`,
    `Type: ${order.order_type}`,
    `\nItems:`,
    ...(items||[]).map(i => `  ${i.product_name} x${i.quantity} = ${parseFloat(i.item_total).toFixed(2)} SR`),
    `\nTotal: ${parseFloat(order.total).toFixed(2)} SR`,
    order.notes ? `Notes: ${order.notes}` : ''
  ].filter(Boolean).join('\n'));
}

// Filters
['searchOrder','filterBranch','filterStatus'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', loadAllOrders);
  if (el && id === 'searchOrder') el.addEventListener('input', loadAllOrders);
});

// ─── 9. PRODUCTS ─────────────────────────────────────────────
function showAddProductForm() { adminState.editingProduct = null; openProductForm(); }
function closeProductForm()   { document.getElementById('productFormModal').style.display = 'none'; }
function toggleSizeFields()   {
  const hasSizes = document.getElementById('prodHasSizes').value === 'yes';
  document.getElementById('sizeFields').style.display = hasSizes ? 'block' : 'none';
  document.getElementById('prodPrice').disabled = hasSizes;
}
window.showAddProductForm = showAddProductForm;
window.closeProductForm   = closeProductForm;
window.toggleSizeFields   = toggleSizeFields;

function openProductForm(productData) {
  const modal = document.getElementById('productFormModal');
  const title = document.getElementById('productFormTitle');

  if (productData) {
    title.textContent = 'Edit Product';
    adminState.editingProduct = productData;
    document.getElementById('prodBranch').value    = productData.branch_id || 'branch1';
    document.getElementById('prodCategory').value  = productData.cat || '';
    document.getElementById('prodName').value      = productData.name || '';
    document.getElementById('prodNameAr').value    = productData.name_ar || '';
    document.getElementById('prodDesc').value      = productData.description || '';
    document.getElementById('prodDescAr').value    = productData.description_ar || '';
    document.getElementById('prodPrice').value     = productData.price || '';
    document.getElementById('prodCalories').value  = productData.calories || '';
    document.getElementById('prodBadge').value     = productData.badge || '';
    const hasSizes = productData.prices && Object.keys(productData.prices).length > 0;
    document.getElementById('prodHasSizes').value  = hasSizes ? 'yes' : 'no';
    if (hasSizes) {
      document.getElementById('prodSizes').value = Object.entries(productData.prices).map(([k,v]) => `${k}:${v}`).join(', ');
      document.getElementById('sizeFields').style.display = 'block';
    }
    const preview = document.getElementById('imagePreview');
    if (preview && productData.img) preview.innerHTML = `<img src="${productData.img}" alt="preview">`;
  } else {
    title.textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('sizeFields').style.display = 'none';
    document.getElementById('imagePreview').innerHTML = '';
  }

  modal.style.display = 'flex';
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Saving...'; btn.disabled = true;

  const branch   = document.getElementById('prodBranch').value;
  const hasSizes = document.getElementById('prodHasSizes').value === 'yes';
  const sizesStr = document.getElementById('prodSizes').value;

  let prices = null;
  if (hasSizes && sizesStr) {
    prices = {};
    sizesStr.split(',').forEach(pair => {
      const [k, v] = pair.split(':').map(x => x.trim());
      if (k && v) prices[k] = parseFloat(v);
    });
  }

  const productData = {
    branch_id:      branch,
    cat:            document.getElementById('prodCategory').value,
    name:           document.getElementById('prodName').value,
    name_ar:        document.getElementById('prodNameAr').value,
    description:    document.getElementById('prodDesc').value,
    description_ar: document.getElementById('prodDescAr').value,
    price:          hasSizes ? null : parseFloat(document.getElementById('prodPrice').value) || null,
    prices:         prices,
    calories:       parseInt(document.getElementById('prodCalories').value) || null,
    badge:          document.getElementById('prodBadge').value || null,
    rating:         4.5,
    updated_at:     new Date().toISOString()
  };

  // Handle image upload
  const imgFile = document.getElementById('prodImage').files[0];
  if (imgFile) {
    const ext = imgFile.name.split('.').pop();
    const fileName = `products/${Date.now()}.${ext}`;
    const { data: uploadData, error: uploadError } = await sbAdmin.storage.from('products').upload(fileName, imgFile, { upsert: true });
    if (!uploadError) {
      const { data: { publicUrl } } = sbAdmin.storage.from('products').getPublicUrl(fileName);
      productData.img = publicUrl;
    }
  }

  let error;
  if (adminState.editingProduct) {
    ({ error } = await sbAdmin.from('products').update(productData).eq('id', adminState.editingProduct.id));
  } else {
    ({ error } = await sbAdmin.from('products').insert(productData));
  }

  // Update local cache
  const cachedProds = JSON.parse(localStorage.getItem('cb_custom_products') || '[]');
  if (adminState.editingProduct) {
    const idx = cachedProds.findIndex(p => p.id === adminState.editingProduct.id);
    if (idx >= 0) cachedProds[idx] = { ...cachedProds[idx], ...productData };
  } else {
    productData.id = productData.id || 'p_' + Date.now();
    cachedProds.unshift(productData);
  }
  localStorage.setItem('cb_custom_products', JSON.stringify(cachedProds));

  btn.textContent = 'Save Product'; btn.disabled = false;

  if (error) console.warn('Supabase product save notice:', error.message);
  closeProductForm();
  loadProductsAdmin();
});

async function loadProductsAdmin() {
  const branchFilter = document.getElementById('filterProductBranch')?.value || 'all';
  const catFilter    = document.getElementById('filterProductCategory')?.value || 'all';

  let products = [];
  try {
    let query = sbAdmin.from('products').select('*');
    if (branchFilter !== 'all') query = query.eq('branch_id', branchFilter);
    if (catFilter    !== 'all') query = query.eq('cat', catFilter);
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      products = data;
      localStorage.setItem('cb_custom_products', JSON.stringify(data));
    }
  } catch(e) {
    console.warn('Products load notice:', e.message);
  }

  if (products.length === 0) {
    const cached = localStorage.getItem('cb_custom_products');
    if (cached) try { products = JSON.parse(cached); } catch(e){}
  }

  const container = document.getElementById('productsList');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:#94A3B8;padding:40px;grid-column:1/-1">No products in database. Default menu items are shown to customers.</div>`;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="product-admin-card">
      <img src="${p.img || ''}" alt="${p.name}" class="pac-img" onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'><text y=\'.9em\' font-size=\'40\'>🍗</text></svg>'">
      <div class="pac-body">
        <div class="pac-name">${p.name || '—'}</div>
        <div class="pac-cat">${p.cat || '—'} · ${p.branch_id || '—'}</div>
        <div class="pac-price">${p.price ? parseFloat(p.price).toFixed(2) + ' SR' : 'Multiple sizes'}</div>
        <div class="pac-actions">
          <button class="btn-icon edit" onclick="openProductForm(${JSON.stringify(p).replace(/"/g,'&quot;')})">✏️</button>
          <button class="btn-icon del" onclick="deleteProduct('${p.id}')">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  const cachedProds = JSON.parse(localStorage.getItem('cb_custom_products') || '[]').filter(p => p.id !== id);
  localStorage.setItem('cb_custom_products', JSON.stringify(cachedProds));
  await sbAdmin.from('products').delete().eq('id', id);
  loadProductsAdmin();
}
window.openProductForm  = openProductForm;
window.deleteProduct    = deleteProduct;
window.loadProductsAdmin = loadProductsAdmin;

['filterProductBranch','filterProductCategory'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', loadProductsAdmin);
});

// ─── 10. BANNERS ─────────────────────────────────────────────
function showBannerForm(bannerData) {
  adminState.editingBanner = bannerData || null;
  const modal = document.getElementById('bannerFormModal');
  const title = document.getElementById('bannerFormTitle');
  if (bannerData) {
    title.textContent = 'Edit Banner';
    document.getElementById('b_title').value         = bannerData.title || '';
    document.getElementById('b_subtitle').value      = bannerData.subtitle || '';
    document.getElementById('b_description').value   = bannerData.description || '';
    document.getElementById('b_discount').value      = bannerData.discount || '';
    document.getElementById('b_coupon_code').value   = bannerData.coupon_code || '';
    document.getElementById('b_cta_text').value      = bannerData.cta_text || 'ORDER NOW';
    document.getElementById('b_cta_action').value    = bannerData.cta_action || 'menu';
    document.getElementById('b_link_value').value    = bannerData.link_value || '';
    document.getElementById('b_desktop_img').value   = bannerData.desktop_img || '';
    document.getElementById('b_mobile_img').value    = bannerData.mobile_img || '';
    document.getElementById('b_bg_color').value      = bannerData.bg_color || '#250506';
    document.getElementById('b_text_color').value    = bannerData.text_color || '#F5EBD9';
    document.getElementById('b_display_order').value = bannerData.display_order || 1;
    document.getElementById('b_is_active').checked   = bannerData.is_active !== false;
    if (bannerData.start_date) document.getElementById('b_start_date').value = bannerData.start_date.slice(0,16);
    if (bannerData.end_date)   document.getElementById('b_end_date').value   = bannerData.end_date.slice(0,16);
  } else {
    title.textContent = 'Add Banner';
    document.getElementById('bannerForm').reset();
    document.getElementById('b_is_active').checked = true;
  }
  modal.style.display = 'flex';
}

function closeBannerForm() { document.getElementById('bannerFormModal').style.display = 'none'; }
window.showBannerForm = showBannerForm;
window.closeBannerForm = closeBannerForm;

document.getElementById('bannerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Saving...'; btn.disabled = true;

  const bannerData = {
    title:         document.getElementById('b_title').value,
    subtitle:      document.getElementById('b_subtitle').value,
    description:   document.getElementById('b_description').value,
    discount:      document.getElementById('b_discount').value,
    coupon_code:   document.getElementById('b_coupon_code').value,
    cta_text:      document.getElementById('b_cta_text').value,
    cta_action:    document.getElementById('b_cta_action').value,
    link_value:    document.getElementById('b_link_value').value,
    desktop_img:   document.getElementById('b_desktop_img').value,
    mobile_img:    document.getElementById('b_mobile_img').value,
    bg_color:      document.getElementById('b_bg_color').value,
    text_color:    document.getElementById('b_text_color').value,
    display_order: parseInt(document.getElementById('b_display_order').value) || 1,
    is_active:     document.getElementById('b_is_active').checked,
    start_date:    document.getElementById('b_start_date').value || null,
    end_date:      document.getElementById('b_end_date').value || null,
    updated_at:    new Date().toISOString()
  };

  let error;
  if (adminState.editingBanner) {
    ({ error } = await sbAdmin.from('banners').update(bannerData).eq('id', adminState.editingBanner.id));
  } else {
    ({ error } = await sbAdmin.from('banners').insert(bannerData));
  }

  // Update local cache
  const cachedBanners = JSON.parse(localStorage.getItem('cb_banners') || '[]');
  if (adminState.editingBanner) {
    const idx = cachedBanners.findIndex(b => b.id === adminState.editingBanner.id);
    if (idx >= 0) cachedBanners[idx] = { ...cachedBanners[idx], ...bannerData };
  } else {
    bannerData.id = bannerData.id || 'b_' + Date.now();
    cachedBanners.unshift(bannerData);
  }
  localStorage.setItem('cb_banners', JSON.stringify(cachedBanners));

  btn.textContent = 'Save Banner'; btn.disabled = false;
  if (error) console.warn('Supabase banner save notice:', error.message);
  closeBannerForm();
  loadBannersAdmin();
});

async function loadBannersAdmin() {
  let banners = [];
  try {
    const { data, error } = await sbAdmin.from('banners').select('*').order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      banners = data;
      localStorage.setItem('cb_banners', JSON.stringify(data));
    }
  } catch(e) {
    console.warn('Banners load notice:', e.message);
  }

  if (banners.length === 0) {
    const cached = localStorage.getItem('cb_banners');
    if (cached) try { banners = JSON.parse(cached); } catch(e){}
  }

  const container = document.getElementById('bannersList');
  if (!container) return;

  if (banners.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:#94A3B8;padding:40px;background:#fff;border-radius:12px;border:1px solid #E2E8F0">No banners yet. Click "Add Banner" to create your first offer banner.</div>`;
    return;
  }

  container.innerHTML = banners.map(b => `
    <div class="banner-item">
      <div class="banner-item-color" style="background:${b.bg_color||'#250506'}">
        ${b.discount ? `<span style="font-size:12px;font-weight:800;">${b.discount}</span>` : '🖼'}
      </div>
      <div class="banner-item-info">
        <div class="banner-item-title">${b.title || 'Untitled Banner'}</div>
        <div class="banner-item-subtitle">
          ${b.subtitle || ''}
          ${b.is_active ? '<span style="color:#10B981;margin-left:8px;font-weight:600">● Active</span>' : '<span style="color:#94A3B8;margin-left:8px">○ Inactive</span>'}
          ${b.start_date ? ` · From ${formatDate(b.start_date)}` : ''}
          ${b.end_date ? ` to ${formatDate(b.end_date)}` : ''}
        </div>
      </div>
      <div class="banner-item-actions">
        <button class="btn-icon edit" onclick="showBannerForm(${JSON.stringify(b).replace(/"/g,'&quot;')})">✏️</button>
        <button class="btn-icon del" onclick="deleteBanner('${b.id}')">🗑</button>
      </div>
    </div>
  `).join('');
}

async function deleteBanner(id) {
  if (!confirm('Delete this banner?')) return;
  const cachedBanners = JSON.parse(localStorage.getItem('cb_banners') || '[]').filter(b => b.id !== id);
  localStorage.setItem('cb_banners', JSON.stringify(cachedBanners));
  await sbAdmin.from('banners').delete().eq('id', id);
  loadBannersAdmin();
}
window.deleteBanner    = deleteBanner;
window.loadBannersAdmin = loadBannersAdmin;

// ─── 11. HOMEPAGE BUILDER ────────────────────────────────────
const SECTION_DESCRIPTIONS = {
  hero:        'Full-screen hero with title, logo, and CTA',
  announcement:'Configurable bar above the header',
  banners:     'Offer banner carousel',
  categories:  'Food category tiles (Broasted, Burgers, etc.)',
  bestsellers: 'Products with highest ratings',
  offers:      'Special promotional products',
  combos:      'Meal combo products',
  featured:    'Handpicked chef favourites',
  promo:       '"Why Chick Buck?" feature block',
  reviews:     'Customer reviews section',
  branches:    'Branch locations & order buttons',
  cta:         'WhatsApp order call-to-action',
  footer:      'Footer with links & social media'
};

// Fetch from DB then render
async function loadHomepageBuilder() {
  const { data, error } = await sbAdmin
    .from('homepage_sections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) console.warn('Could not load homepage sections:', error.message);
  adminState.homepageSections = (data && data.length > 0) ? data : getDefaultSectionsAdmin();
  renderHomepageBuilder();
}

// Render from local state only — no DB call
function renderHomepageBuilder() {
  const container = document.getElementById('homepageSectionsList');
  if (!container) return;

  container.innerHTML = adminState.homepageSections.map((s, i) => `
    <div class="section-item"
         data-index="${i}"
         data-id="${s.id}"
         draggable="true">
      <span class="section-drag-handle" style="cursor:grab;">⠿</span>
      <div style="width:32px;height:32px;background:var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;pointer-events:none;">
        ${getSectionEmoji(s.id)}
      </div>
      <div class="section-info" style="pointer-events:none;">
        <div class="section-name">${s.label || s.id}</div>
        <div class="section-desc">${SECTION_DESCRIPTIONS[s.id] || ''}</div>
      </div>
      <label class="toggle-label" style="flex-shrink:0;">
        <input type="checkbox" ${s.is_enabled ? 'checked' : ''}
               onchange="toggleSection('${s.id}', this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');

  // Attach drag events via JS (more reliable than inline attributes)
  container.querySelectorAll('.section-item').forEach((el) => {
    const index = parseInt(el.dataset.index, 10);
    el.addEventListener('dragstart', (e) => onDragStart(e, index));
    el.addEventListener('dragend',   (e) => onDragEnd(e));
    el.addEventListener('dragover',  (e) => onDragOver(e, index));
    el.addEventListener('dragleave', (e) => onDragLeave(e));
    el.addEventListener('drop',      (e) => onDrop(e, index));
  });
}

function getSectionEmoji(id) {
  const map = { hero:'🏆', announcement:'📢', banners:'🖼', categories:'📂', bestsellers:'⭐', offers:'🔥', combos:'🍱', featured:'👨‍🍳', promo:'💡', reviews:'⭐', branches:'📍', cta:'💬', footer:'🦶' };
  return map[id] || '📄';
}

function getDefaultSectionsAdmin() {
  return [
    { id: 'hero',         label: 'Hero Section',       is_enabled: true, display_order: 1  },
    { id: 'banners',      label: 'Offer Banners',       is_enabled: true, display_order: 2  },
    { id: 'categories',   label: 'Food Categories',     is_enabled: true, display_order: 3  },
    { id: 'bestsellers',  label: 'Best Sellers',        is_enabled: true, display_order: 4  },
    { id: 'offers',       label: 'Special Offers',      is_enabled: true, display_order: 5  },
    { id: 'combos',       label: 'Popular Combos',      is_enabled: true, display_order: 6  },
    { id: 'promo',        label: 'Promotional Section', is_enabled: true, display_order: 7  },
    { id: 'reviews',      label: 'Customer Reviews',    is_enabled: true, display_order: 8  },
    { id: 'branches',     label: 'Our Branches',        is_enabled: true, display_order: 9  },
    { id: 'cta',          label: 'WhatsApp CTA',        is_enabled: true, display_order: 10 },
    { id: 'footer',       label: 'Footer',              is_enabled: true, display_order: 11 }
  ];
}

async function toggleSection(id, enabled) {
  const idx = adminState.homepageSections.findIndex(s => s.id === id);
  if (idx >= 0) adminState.homepageSections[idx].is_enabled = enabled;
  localStorage.setItem('cb_homepage_sections', JSON.stringify(adminState.homepageSections));
  await sbAdmin.from('homepage_sections').upsert({ id, is_enabled: enabled, updated_at: new Date().toISOString() });
}

async function saveHomepageOrder() {
  const sections = adminState.homepageSections;
  const updates = sections.map((s, i) => ({ id: s.id, label: s.label, is_enabled: s.is_enabled, display_order: i + 1, config: s.config || {}, updated_at: new Date().toISOString() }));
  localStorage.setItem('cb_homepage_sections', JSON.stringify(updates));
  const { error } = await sbAdmin.from('homepage_sections').upsert(updates);
  if (error) console.warn('Supabase save notice:', error.message);
  showToast('Homepage order saved!');
}
window.saveHomepageOrder = saveHomepageOrder;
window.toggleSection = toggleSection;

// ── Drag and Drop ───────────────────────────────────────────
let dragIndex = null;

function onDragStart(e, index) {
  dragIndex = index;
  // Always find the closest .section-item to add the class
  const item = e.currentTarget || e.target.closest('.section-item');
  if (item) item.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index); // required for Firefox
}

function onDragEnd(e) {
  document.querySelectorAll('.section-item').forEach(el =>
    el.classList.remove('dragging', 'drag-over')
  );
}

function onDragOver(e, index) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  // Highlight only the current target
  document.querySelectorAll('.section-item').forEach(el => el.classList.remove('drag-over'));
  const item = e.currentTarget || e.target.closest('.section-item');
  if (item) item.classList.add('drag-over');
}

function onDragLeave(e) {
  const item = e.currentTarget || e.target.closest('.section-item');
  if (item) item.classList.remove('drag-over');
}

function onDrop(e, index) {
  e.preventDefault();
  document.querySelectorAll('.section-item').forEach(el =>
    el.classList.remove('drag-over', 'dragging')
  );
  if (dragIndex === null || dragIndex === index) {
    dragIndex = null;
    return;
  }
  // Reorder in local state
  const arr = [...adminState.homepageSections];
  const [moved] = arr.splice(dragIndex, 1);
  arr.splice(index, 0, moved);
  adminState.homepageSections = arr;
  dragIndex = null;
  // Re-render from local state only — do NOT call loadHomepageBuilder()
  renderHomepageBuilder();
}

// ─── 12. THEME ───────────────────────────────────────────────
const THEME_PRESETS = {
  'chick-buck-classic': { primary:'#C4323A', secondary:'#250506', accent:'#B8935A', background:'#F5EBD9', surface:'#FAF4E8', text:'#1A1A1A', heading:'#250506', button:'#C4323A', button_text:'#F5EBD9', header:'#250506', footer:'#0E0503', border:'#E8DCC4' },
  'premium-red':        { primary:'#E53E3E', secondary:'#742A2A', accent:'#F6AD55', background:'#FFF5F5', surface:'#FFFBFB', text:'#1A202C', heading:'#742A2A', button:'#E53E3E', button_text:'#FFFFFF', header:'#742A2A', footer:'#4A0C0C', border:'#FED7D7' },
  'dark-premium':       { primary:'#63B3ED', secondary:'#2D3748', accent:'#F6AD55', background:'#1A202C', surface:'#2D3748', text:'#E2E8F0', heading:'#F7FAFC', button:'#63B3ED', button_text:'#1A202C', header:'#171923', footer:'#0D1117', border:'#4A5568' },
  'black-gold':         { primary:'#B8935A', secondary:'#1A1A1A', accent:'#D4AF70', background:'#F5F0E8', surface:'#FBF8F2', text:'#1A1A1A', heading:'#1A1A1A', button:'#B8935A', button_text:'#FFFFFF', header:'#1A1A1A', footer:'#0D0D0D', border:'#E5DCC8' },
  'modern-orange':      { primary:'#ED8936', secondary:'#C05621', accent:'#ECC94B', background:'#FFFAF0', surface:'#FFF8EE', text:'#1A202C', heading:'#C05621', button:'#ED8936', button_text:'#FFFFFF', header:'#C05621', footer:'#7B341E', border:'#FEEBC8' }
};

function applyPreset(presetName) {
  const preset = THEME_PRESETS[presetName];
  if (!preset) return;
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.preset === presetName));
  Object.entries(preset).forEach(([key, val]) => {
    const input = document.getElementById(`tc_${key}`);
    const hex   = document.getElementById(`tc_${key}_hex`);
    if (input) input.value = val;
    if (hex)   hex.textContent = val;
  });
}

function loadThemeSettings() {
  if (adminState.settings) {
    const s = adminState.settings;
    const map = { primary: s.theme_primary, secondary: s.theme_secondary, accent: s.theme_accent, background: s.theme_background, surface: s.theme_surface, text: s.theme_text, heading: s.theme_heading, button: s.theme_button, button_text: s.theme_button_text, header: s.theme_header, footer: s.theme_footer, border: s.theme_border };
    Object.entries(map).forEach(([key, val]) => {
      if (!val) return;
      const input = document.getElementById(`tc_${key}`);
      const hex   = document.getElementById(`tc_${key}_hex`);
      if (input) input.value = val;
      if (hex)   hex.textContent = val;
    });
    const preset = s.theme_preset || 'chick-buck-classic';
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.preset === preset));
  }

  document.querySelectorAll('input[type="color"]').forEach(input => {
    input.addEventListener('input', () => {
      const hexEl = document.getElementById(`${input.id}_hex`);
      if (hexEl) hexEl.textContent = input.value;
    });
  });
}

async function saveTheme() {
  const preset = document.querySelector('.preset-btn.active')?.dataset.preset || 'custom';
  const themeData = {
    theme_primary:      document.getElementById('tc_primary')?.value,
    theme_secondary:    document.getElementById('tc_secondary')?.value,
    theme_accent:       document.getElementById('tc_accent')?.value,
    theme_background:   document.getElementById('tc_background')?.value,
    theme_surface:      document.getElementById('tc_surface')?.value,
    theme_text:         document.getElementById('tc_text')?.value,
    theme_heading:      document.getElementById('tc_heading')?.value,
    theme_button:       document.getElementById('tc_button')?.value,
    theme_button_text:  document.getElementById('tc_button_text')?.value,
    theme_header:       document.getElementById('tc_header')?.value,
    theme_footer:       document.getElementById('tc_footer')?.value,
    theme_border:       document.getElementById('tc_border')?.value,
    theme_preset:       preset,
    updated_at:         new Date().toISOString()
  };

  adminState.settings = { ...(adminState.settings || {}), ...themeData };
  localStorage.setItem('cb_site_settings', JSON.stringify(adminState.settings));
  const { error } = await sbAdmin.from('site_settings').upsert({ id: 'global', ...themeData });
  if (error) console.warn('Supabase save notice:', error.message);
  showToast('Theme saved! Customers will see the new colors immediately.');
}

function resetTheme() { applyPreset('chick-buck-classic'); }

window.saveTheme   = saveTheme;
window.resetTheme  = resetTheme;
window.applyPreset = applyPreset;

// ─── 13. WEBSITE SETTINGS ────────────────────────────────────
async function loadWebsiteSettings() {
  try {
    const { data, error } = await sbAdmin.from('site_settings').select('*').eq('id', 'global').single();
    if (!error && data) {
      adminState.settings = data;
      localStorage.setItem('cb_site_settings', JSON.stringify(data));
      fillSettingsForm(data);
      return;
    }
  } catch(e) {
    console.warn('Settings not loaded from DB:', e.message);
  }

  const cached = localStorage.getItem('cb_site_settings');
  if (cached) try { fillSettingsForm(JSON.parse(cached)); } catch(e){}
}

function fillSettingsForm(s) {
  const set = (id, val) => { const el = document.getElementById(id); if(el && val !== null && val !== undefined) { if(el.type === 'checkbox') el.checked = val; else el.value = val; } };
  set('ws_site_name',   s.site_name);
  set('ws_brand_desc',  s.brand_desc);
  set('ws_logo_url',    s.logo_url);
  set('ws_favicon_url', s.favicon_url);
  set('ws_phone',       s.phone);
  set('ws_whatsapp',    s.whatsapp);
  set('ws_email',       s.email);
  set('ws_address',     s.address);
  set('ws_instagram',   s.instagram);
  set('ws_facebook',    s.facebook);
  set('ws_tiktok',      s.tiktok);
  set('ws_snapchat',    s.snapchat);
  set('ws_youtube',     s.youtube);
  set('ws_business_hours', s.business_hours);
  set('ws_currency',    s.currency);
  set('ws_delivery_info', s.delivery_info);
  set('ws_footer_desc', s.footer_desc);
  set('ws_footer_copy', s.footer_copy);
  set('ws_announcement_enabled', s.announcement_enabled);
  set('ws_announcement_text',    s.announcement_text);
  set('ws_announcement_bg',      s.announcement_bg);
  set('ws_announcement_color',   s.announcement_color);
  set('ws_announcement_link',    s.announcement_link);
  if (s.announcement_start) set('ws_announcement_start', new Date(s.announcement_start).toISOString().slice(0,16));
  if (s.announcement_end)   set('ws_announcement_end',   new Date(s.announcement_end).toISOString().slice(0,16));

  // Logo preview
  if (s.logo_url) {
    const prev = document.getElementById('logoPreview');
    if (prev) prev.innerHTML = `<img src="${s.logo_url}" alt="Logo">`;
  }
}

async function saveWebsiteSettings() {
  const get = (id) => { const el = document.getElementById(id); return el ? (el.type === 'checkbox' ? el.checked : el.value || null) : null; };
  const settingsData = {
    id: 'global',
    site_name:   get('ws_site_name'),
    brand_desc:  get('ws_brand_desc'),
    logo_url:    get('ws_logo_url'),
    favicon_url: get('ws_favicon_url'),
    phone:       get('ws_phone'),
    whatsapp:    get('ws_whatsapp'),
    email:       get('ws_email'),
    address:     get('ws_address'),
    instagram:   get('ws_instagram'),
    facebook:    get('ws_facebook'),
    tiktok:      get('ws_tiktok'),
    snapchat:    get('ws_snapchat'),
    youtube:     get('ws_youtube'),
    business_hours: get('ws_business_hours'),
    currency:    get('ws_currency'),
    delivery_info: get('ws_delivery_info'),
    footer_desc: get('ws_footer_desc'),
    footer_copy: get('ws_footer_copy'),
    announcement_enabled: document.getElementById('ws_announcement_enabled')?.checked,
    announcement_text:    get('ws_announcement_text'),
    announcement_bg:      get('ws_announcement_bg'),
    announcement_color:   get('ws_announcement_color'),
    announcement_link:    get('ws_announcement_link'),
    announcement_start:   get('ws_announcement_start') || null,
    announcement_end:     get('ws_announcement_end') || null,
    updated_at:  new Date().toISOString()
  };

  adminState.settings = { ...(adminState.settings || {}), ...settingsData };
  localStorage.setItem('cb_site_settings', JSON.stringify(adminState.settings));
  const { error } = await sbAdmin.from('site_settings').upsert(settingsData);
  if (error) console.warn('Supabase save notice:', error.message);
  showToast('Website settings saved successfully!');
}
window.saveWebsiteSettings = saveWebsiteSettings;
window.loadWebsiteSettings = loadWebsiteSettings;

// Logo preview on input
document.getElementById('ws_logo_url')?.addEventListener('input', (e) => {
  const prev = document.getElementById('logoPreview');
  if (prev && e.target.value) prev.innerHTML = `<img src="${e.target.value}" alt="Logo" onerror="this.style.display='none'">`;
});

// ─── 14. ANALYTICS ───────────────────────────────────────────
async function loadProductAnalytics() {
  const { data: items } = await sbAdmin.from('order_items').select('*');
  const summary = {};
  (items || []).forEach(i => {
    if (!summary[i.product_name]) summary[i.product_name] = { name: i.product_name, nameAr: i.product_name_ar, qty: 0, rev: 0 };
    summary[i.product_name].qty += i.quantity || 1;
    summary[i.product_name].rev += parseFloat(i.item_total) || 0;
  });

  const sorted = Object.values(summary).sort((a,b) => b.qty - a.qty).slice(0, 20);
  const tbody = document.getElementById('productsTable');
  if (!tbody) return;
  tbody.innerHTML = sorted.map((p,i) => `
    <tr>
      <td>${p.name}</td>
      <td style="direction:rtl">${p.nameAr || '—'}</td>
      <td><strong>${p.qty}</strong></td>
      <td>${p.rev.toFixed(2)} SR</td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center;color:#94A3B8;padding:30px">No order data yet</td></tr>';
}

// ─── 15. REPORTS ─────────────────────────────────────────────
async function loadReports() {
  const { data: orders } = await sbAdmin.from('orders').select('*');
  const allOrders = orders || [];

  const totalSales  = allOrders.reduce((s, o) => s + (parseFloat(o.total)||0), 0);
  const totalOrders = allOrders.length;
  const avgOrder    = totalOrders > 0 ? totalSales / totalOrders : 0;

  document.getElementById('reportTotalSales')?.setAttribute('textContent', `${totalSales.toFixed(2)} SR`);
  document.getElementById('reportTotalOrders')?.setAttribute('textContent', totalOrders);
  document.getElementById('reportAvgOrder')?.setAttribute('textContent', `${avgOrder.toFixed(2)} SR`);

  const el = (id) => document.getElementById(id);
  if (el('reportTotalSales')) el('reportTotalSales').textContent = `${totalSales.toFixed(2)} SR`;
  if (el('reportTotalOrders')) el('reportTotalOrders').textContent = totalOrders;
  if (el('reportAvgOrder')) el('reportAvgOrder').textContent = `${avgOrder.toFixed(2)} SR`;

  // Daily chart (last 7 days)
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dailySales = days.map(day => ({
    day,
    total: allOrders.filter(o => o.created_at && o.created_at.slice(0,10) === day).reduce((s,o) => s + (parseFloat(o.total)||0), 0)
  }));

  const dailyCtx = document.getElementById('dailySalesChart');
  if (dailyCtx) {
    if (adminState.charts.daily) adminState.charts.daily.destroy();
    adminState.charts.daily = new Chart(dailyCtx, {
      type: 'bar',
      data: {
        labels: dailySales.map(d => d.day.slice(5)),
        datasets: [{ label: 'Revenue (SR)', data: dailySales.map(d => d.total), backgroundColor: 'rgba(196,50,58,0.8)', borderRadius: 6 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  // Branch chart
  const branch1Total = allOrders.filter(o => o.branch_id === 'branch1').reduce((s,o) => s + (parseFloat(o.total)||0), 0);
  const branch2Total = allOrders.filter(o => o.branch_id === 'branch2').reduce((s,o) => s + (parseFloat(o.total)||0), 0);

  const branchCtx = document.getElementById('branchSalesChart');
  if (branchCtx) {
    if (adminState.charts.branch) adminState.charts.branch.destroy();
    adminState.charts.branch = new Chart(branchCtx, {
      type: 'doughnut',
      data: {
        labels: ['Branch 1 — Ameerfawaz', 'Branch 2 — AI-Samer'],
        datasets: [{ data: [branch1Total, branch2Total], backgroundColor: ['#C4323A','#B8935A'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
}

// ─── 16. REALTIME ORDERS ─────────────────────────────────────
function loadRealtimeOrders() {
  sbAdmin.channel('admin-orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      const o = payload.new;
      const msg = `${o.customer_name} · ${parseFloat(o.total).toFixed(2)} SR · ${o.branch_name || o.branch_id}`;
      showRealtimeNotification(msg);
      if (adminState.currentView === 'dashboard') loadDashboard();
      if (adminState.currentView === 'orders')    loadAllOrders();
    })
    .subscribe();
}

function showRealtimeNotification(msg) {
  const toast = document.getElementById('realtimeToast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;
  if (toastMsg) toastMsg.textContent = msg;
  toast.style.display = 'flex';
  if (Notification.permission === 'granted') new Notification('🍗 New Chick Buck Order!', { body: msg });
  setTimeout(() => { toast.style.display = 'none'; }, 6000);
  toast.onclick = () => { switchView('orders'); toast.style.display = 'none'; };
}

// ─── 17. UTILITIES ───────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function showToast(msg) {
  const toast = document.getElementById('realtimeToast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;
  if (toastMsg) toastMsg.textContent = msg;
  toast.innerHTML = `✅ ${msg}`;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Update order status selects
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder       = deleteOrder;
window.viewOrderDetail   = viewOrderDetail;
window.formatDate        = formatDate;
