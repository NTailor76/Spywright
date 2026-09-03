import { DemoPreset } from '../types';
import { SAUCE_DEMO_PAGES } from './sauceDemoPages';

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'saucedemo',
    name: 'SauceDemo - Swag Labs Login & Portal',
    category: 'E-Commerce / Benchmark',
    description: 'Industry-standard automation sandbox with data-test attributes (username, password, login-button) and interactive navigation.',
    url: 'https://www.saucedemo.com',
    html: SAUCE_DEMO_PAGES.login(),
  },
  {
    id: 'saucedemo-inventory',
    name: 'SauceDemo - Products Catalog',
    category: 'E-Commerce / Benchmark',
    description: 'Product catalog with items, add-to-cart toggles, sort dropdown, burger menu, and shopping cart badge.',
    url: 'https://www.saucedemo.com/inventory.html',
    html: SAUCE_DEMO_PAGES.inventory(0, []),
  },
  {
    id: 'saucedemo-cart',
    name: 'SauceDemo - Shopping Cart',
    category: 'E-Commerce / Benchmark',
    description: 'Shopping cart items list, quantity verification, continue shopping, and checkout button.',
    url: 'https://www.saucedemo.com/cart.html',
    html: SAUCE_DEMO_PAGES.cart(1, ['sauce-labs-backpack']),
  },
  {
    id: 'saucedemo-checkout-one',
    name: 'SauceDemo - Checkout Customer Info',
    category: 'E-Commerce / Benchmark',
    description: 'Customer checkout form with First Name, Last Name, Postal Code, and Cancel/Continue buttons.',
    url: 'https://www.saucedemo.com/checkout-step-one.html',
    html: SAUCE_DEMO_PAGES.checkoutStepOne(),
  },
  {
    id: 'saas-auth',
    name: 'SaaS Authentication & Two-Factor (MFA)',
    category: 'Authentication',
    description: 'Forms, labels, email/password inputs, remember-me checkbox, submit button, social auth buttons, and alert messages.',
    url: 'https://app.qa-portal.io/login',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QA Portal - Secure Sign In</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #1e293b; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; width: 100%; max-width: 440px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { width: 48px; height: 48px; background: #2563eb; color: white; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a; }
    p.subtitle { color: #64748b; font-size: 14px; margin: 0; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #334155; }
    input[type="email"], input[type="password"], input[type="text"] { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.15s; }
    input:focus { border-color: #2563eb; ring: 2px solid #93c5fd; }
    .form-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 20px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal; margin: 0; }
    .forgot-link { color: #2563eb; text-decoration: none; font-weight: 500; }
    .forgot-link:hover { text-decoration: underline; }
    .btn-primary { width: 100%; background: #2563eb; color: white; border: none; padding: 11px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: background 0.15s; }
    .btn-primary:hover { background: #1d4ed8; }
    .divider { display: flex; align-items: center; text-align: center; margin: 24px 0; color: #94a3b8; font-size: 12px; }
    .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #e2e8f0; }
    .divider span { padding: 0 10px; }
    .social-btn { width: 100%; background: #f1f5f9; border: 1px solid #e2e8f0; color: #334155; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .social-btn:hover { background: #e2e8f0; }
    .alert-banner { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 18px; display: none; }
    .signup-footer { text-align: center; margin-top: 24px; font-size: 13px; color: #64748b; }
    .signup-footer a { color: #2563eb; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card" data-testid="auth-card" id="login-container">
    <div class="header">
      <div class="logo" role="img" aria-label="Portal Brand Logo">QA</div>
      <h1 id="page-heading">Sign in to your account</h1>
      <p class="subtitle">Enter your work credentials to access the test dashboard</p>
    </div>

    <div id="error-alert" class="alert-banner" role="alert" aria-live="assertive">
      Invalid credentials. Please verify your email and password.
    </div>

    <form id="login-form" data-testid="login-form" action="javascript:void(0);">
      <div class="form-group">
        <label for="user-email">Work Email Address</label>
        <input 
          type="email" 
          id="user-email" 
          name="email" 
          placeholder="alex.tester@enterprise.com" 
          data-testid="input-email" 
          required 
          autocomplete="email"
          aria-required="true"
        />
      </div>

      <div class="form-group">
        <label for="user-password">Password</label>
        <input 
          type="password" 
          id="user-password" 
          name="password" 
          placeholder="••••••••••••" 
          data-testid="input-password" 
          required 
          autocomplete="current-password"
          aria-required="true"
        />
      </div>

      <div class="form-row">
        <label class="checkbox-label">
          <input type="checkbox" id="remember-me" name="remember" data-testid="checkbox-remember" checked />
          <span>Remember this browser for 30 days</span>
        </label>
        <a href="#forgot" class="forgot-link" data-testid="link-forgot-password" title="Recover account password">Forgot password?</a>
      </div>

      <button type="submit" id="submit-btn" class="btn-primary" data-testid="btn-submit">
        <span>Sign In with Single Sign-On</span>
      </button>
    </form>

    <div class="divider"><span>OR CONTINUE WITH</span></div>

    <button type="button" class="social-btn" id="github-auth-btn" data-testid="btn-auth-github">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      <span>GitHub Enterprise</span>
    </button>
    <button type="button" class="social-btn" id="google-auth-btn" data-testid="btn-auth-google">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
      <span>Google Workspace</span>
    </button>

    <div class="signup-footer">
      Don't have an automated test tenant? <a href="#register" id="link-register" data-testid="link-register">Request Demo Access</a>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'ecommerce-checkout',
    name: 'E-Commerce Cart & Multi-Item Checkout',
    category: 'E-Commerce',
    description: 'Shopping items, quantity counter buttons, coupon codes, shipping selectors, radio inputs, and payment buttons.',
    url: 'https://store.automation-demo.shop/checkout',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QA Store - Order Checkout</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .wrapper { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
    .panel { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; }
    h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
    .product-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f8fafc; }
    .product-info { display: flex; align-items: center; gap: 14px; }
    .product-img { width: 56px; height: 56px; border-radius: 8px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .product-title { font-size: 14px; font-weight: 600; }
    .product-sku { font-size: 12px; color: #64748b; }
    .qty-control { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; }
    .qty-btn { background: none; border: none; padding: 4px 10px; cursor: pointer; font-weight: bold; color: #475569; }
    .qty-btn:hover { background: #f1f5f9; }
    .qty-val { padding: 4px 10px; font-size: 13px; font-weight: 600; min-width: 30px; text-align: center; }
    .price-tag { font-weight: 700; font-size: 14px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #475569; }
    input[type="text"], select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .radio-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; }
    .radio-card.active { border-color: #2563eb; background: #eff6ff; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #475569; }
    .summary-row.total { font-size: 16px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
    .coupon-box { display: flex; gap: 8px; margin: 16px 0; }
    .btn-apply { background: #0f172a; color: white; border: none; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-checkout { width: 100%; background: #16a34a; color: white; border: none; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 16px; }
    .btn-checkout:hover { background: #15803d; }
  </style>
</head>
<body>
  <div class="wrapper" id="checkout-app">
    <div class="panel" data-testid="shipping-section">
      <h2 id="shipping-heading">1. Shipping & Customer Details</h2>
      <form id="shipping-form">
        <div class="row-2">
          <div class="form-group">
            <label for="first-name">First Name</label>
            <input type="text" id="first-name" name="firstName" placeholder="Jane" data-testid="input-firstname" required />
          </div>
          <div class="form-group">
            <label for="last-name">Last Name</label>
            <input type="text" id="last-name" name="lastName" placeholder="Doe" data-testid="input-lastname" required />
          </div>
        </div>

        <div class="form-group">
          <label for="street-address">Street Address</label>
          <input type="text" id="street-address" name="address" placeholder="100 Silicon Way, Suite 400" data-testid="input-address" required />
        </div>

        <div class="row-2">
          <div class="form-group">
            <label for="city-name">City</label>
            <input type="text" id="city-name" name="city" placeholder="San Francisco" data-testid="input-city" required />
          </div>
          <div class="form-group">
            <label for="state-select">State / Region</label>
            <select id="state-select" name="state" data-testid="select-state">
              <option value="CA">California (CA)</option>
              <option value="NY">New York (NY)</option>
              <option value="TX">Texas (TX)</option>
              <option value="WA">Washington (WA)</option>
            </select>
          </div>
        </div>

        <h2 style="margin-top: 24px;">2. Shipping Method</h2>
        <label class="radio-card active" data-testid="shipping-standard">
          <input type="radio" name="shippingMethod" value="standard" checked />
          <div>
            <div style="font-weight: 600; font-size: 13px;">Standard Ground Delivery ($5.00)</div>
            <div style="font-size: 11px; color: #64748b;">Delivers in 3-5 business days</div>
          </div>
        </label>
        <label class="radio-card" data-testid="shipping-express">
          <input type="radio" name="shippingMethod" value="express" />
          <div>
            <div style="font-weight: 600; font-size: 13px;">Express Overnight Air ($18.00)</div>
            <div style="font-size: 11px; color: #64748b;">Guaranteed next morning delivery</div>
          </div>
        </label>
      </form>
    </div>

    <div class="panel" data-testid="order-summary-panel">
      <h2 id="cart-heading">Order Summary (2 Items)</h2>
      
      <div class="product-row" data-testid="item-row-1" role="listitem">
        <div class="product-info">
          <div class="product-img" role="img" aria-label="Wireless Headset">🎧</div>
          <div>
            <div class="product-title">Pro ANC Wireless Headphones</div>
            <div class="product-sku">SKU: HEAD-900-BLK</div>
          </div>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" aria-label="Decrease quantity for Headphones" data-testid="btn-qty-minus-1">-</button>
          <span class="qty-val" data-testid="text-qty-1">1</span>
          <button type="button" class="qty-btn" aria-label="Increase quantity for Headphones" data-testid="btn-qty-plus-1">+</button>
        </div>
        <div class="price-tag" data-testid="price-item-1">$199.00</div>
      </div>

      <div class="product-row" data-testid="item-row-2" role="listitem">
        <div class="product-info">
          <div class="product-img" role="img" aria-label="USB-C Charging Hub">🔌</div>
          <div>
            <div class="product-title">100W GaN Charging Stand</div>
            <div class="product-sku">SKU: CHG-100-WHT</div>
          </div>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" aria-label="Decrease quantity for Charger" data-testid="btn-qty-minus-2">-</button>
          <span class="qty-val" data-testid="text-qty-2">2</span>
          <button type="button" class="qty-btn" aria-label="Increase quantity for Charger" data-testid="btn-qty-plus-2">+</button>
        </div>
        <div class="price-tag" data-testid="price-item-2">$78.00</div>
      </div>

      <div class="coupon-box">
        <input type="text" placeholder="Promo / Discount Code" id="promo-input" data-testid="input-promo-code" aria-label="Promotional coupon code" />
        <button type="button" class="btn-apply" id="btn-apply-coupon" data-testid="btn-apply-promo">Apply</button>
      </div>

      <div class="summary-row">
        <span>Subtotal</span>
        <span data-testid="val-subtotal">$277.00</span>
      </div>
      <div class="summary-row">
        <span>Estimated Tax (8.5%)</span>
        <span data-testid="val-tax">$23.55</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span data-testid="val-shipping">$5.00</span>
      </div>
      <div class="summary-row total">
        <span>Total Amount Due</span>
        <span data-testid="val-grand-total">$305.55</span>
      </div>

      <button type="button" class="btn-checkout" id="btn-place-order" data-testid="btn-complete-order">
        Confirm & Pay $305.55
      </button>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'data-table-admin',
    name: 'Admin User Management Data Table',
    category: 'Enterprise Data Table',
    description: 'Search filter input, status dropdown, batch actions, table rows, edit/delete action buttons, modal triggers, and pagination.',
    url: 'https://admin.qa-enterprise.internal/users',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Console - User Management</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 1080px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 20px; font-weight: 700; margin: 0; }
    .controls { display: flex; gap: 10px; align-items: center; }
    .search-input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 240px; }
    .filter-select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; background: white; }
    .btn-create { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .btn-create:hover { background: #1d4ed8; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { text-align: left; padding: 12px 14px; background: #f8fafc; font-size: 12px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    td { padding: 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:hover td { background: #f8fafc; }
    .badge { padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-block; }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fef9c3; color: #854d0e; }
    .badge-suspended { background: #fee2e2; color: #991b1b; }
    .btn-action { background: none; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; color: #475569; margin-right: 4px; }
    .btn-action:hover { background: #f1f5f9; }
    .btn-danger { color: #dc2626; border-color: #fecaca; }
    .btn-danger:hover { background: #fef2f2; }
    .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 13px; color: #64748b; }
    .page-buttons { display: flex; gap: 4px; }
    .page-btn { padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; background: white; cursor: pointer; font-size: 12px; }
    .page-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
  </style>
</head>
<body>
  <div class="container" id="admin-user-mgmt">
    <div class="top-bar">
      <div>
        <h1 id="page-title">User Accounts Directory</h1>
        <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Manage team permissions, active sessions, and roles</div>
      </div>
      <div class="controls">
        <input type="search" placeholder="Search by name or email..." class="search-input" id="search-users-input" data-testid="input-user-search" aria-label="Search users" />
        <select class="filter-select" id="role-filter" data-testid="select-role-filter" aria-label="Filter by role">
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="editor">Test Engineers</option>
          <option value="viewer">Read Only</option>
        </select>
        <button type="button" class="btn-create" id="btn-add-new-user" data-testid="btn-invite-user" aria-haspopup="dialog">
          + Add New User
        </button>
      </div>
    </div>

    <table data-testid="users-data-table" role="table" aria-label="User accounts table">
      <thead>
        <tr role="row">
          <th style="width: 36px;"><input type="checkbox" id="select-all-checkbox" data-testid="checkbox-select-all" aria-label="Select all rows" /></th>
          <th role="columnheader">Full Name</th>
          <th role="columnheader">Email Address</th>
          <th role="columnheader">Assigned Role</th>
          <th role="columnheader">Status</th>
          <th role="columnheader" style="text-align: right;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr data-testid="user-row-1" role="row">
          <td><input type="checkbox" data-testid="checkbox-row-1" aria-label="Select Alice Johnson" /></td>
          <td style="font-weight: 600;">Alice Johnson</td>
          <td style="color: #64748b;">alice.j@enterprise.com</td>
          <td><span style="font-size: 12px; font-weight: 500;">Lead QA Architect</span></td>
          <td><span class="badge badge-active" data-testid="status-badge-1">Active</span></td>
          <td style="text-align: right;">
            <button type="button" class="btn-action" data-testid="btn-edit-user-1" aria-label="Edit Alice Johnson">Edit</button>
            <button type="button" class="btn-action btn-danger" data-testid="btn-delete-user-1" aria-label="Delete Alice Johnson">Delete</button>
          </td>
        </tr>
        <tr data-testid="user-row-2" role="row">
          <td><input type="checkbox" data-testid="checkbox-row-2" aria-label="Select Marcus Chen" /></td>
          <td style="font-weight: 600;">Marcus Chen</td>
          <td style="color: #64748b;">mchen@enterprise.com</td>
          <td><span style="font-size: 12px; font-weight: 500;">SDET Lead</span></td>
          <td><span class="badge badge-active" data-testid="status-badge-2">Active</span></td>
          <td style="text-align: right;">
            <button type="button" class="btn-action" data-testid="btn-edit-user-2" aria-label="Edit Marcus Chen">Edit</button>
            <button type="button" class="btn-action btn-danger" data-testid="btn-delete-user-2" aria-label="Delete Marcus Chen">Delete</button>
          </td>
        </tr>
        <tr data-testid="user-row-3" role="row">
          <td><input type="checkbox" data-testid="checkbox-row-3" aria-label="Select Sarah Miller" /></td>
          <td style="font-weight: 600;">Sarah Miller</td>
          <td style="color: #64748b;">sarah.m@enterprise.com</td>
          <td><span style="font-size: 12px; font-weight: 500;">Automation Tester</span></td>
          <td><span class="badge badge-pending" data-testid="status-badge-3">Pending Invite</span></td>
          <td style="text-align: right;">
            <button type="button" class="btn-action" data-testid="btn-edit-user-3" aria-label="Edit Sarah Miller">Edit</button>
            <button type="button" class="btn-action btn-danger" data-testid="btn-delete-user-3" aria-label="Delete Sarah Miller">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <span data-testid="text-pagination-info">Showing 1 to 3 of 48 users</span>
      <div class="page-buttons" role="navigation" aria-label="Pagination Navigation">
        <button type="button" class="page-btn" data-testid="btn-prev-page" disabled>Previous</button>
        <button type="button" class="page-btn active" data-testid="btn-page-1" aria-current="page">1</button>
        <button type="button" class="page-btn" data-testid="btn-page-2">2</button>
        <button type="button" class="page-btn" data-testid="btn-page-3">3</button>
        <button type="button" class="page-btn" data-testid="btn-next-page">Next</button>
      </div>
    </div>
  </div>
</body>
</html>`
  }
];
