// Complete interactive SauceDemo (Swag Labs) page templates and interactive state engine

export interface SauceDemoState {
  cartCount: number;
  addedItems: string[];
  user: string;
}

export const SAUCE_DEMO_PAGES = {
  login: (errorMsg: string = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Swag Labs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700">
  <style>
    * { box-sizing: border-box; font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 0; background: #ffffff; color: #111; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
    .login_logo { font-size: 38px; font-weight: 800; text-align: center; margin: 36px 0 24px 0; color: #132322; letter-spacing: -0.5px; }
    .login_wrapper { width: 100%; max-width: 440px; padding: 0 20px; }
    .login_wrapper-inner { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; padding: 28px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .form_group { margin-bottom: 16px; }
    .form_input { width: 100%; padding: 12px 14px; font-size: 15px; border: 1px solid #d1d5db; border-radius: 6px; background: #ffffff; color: #111; outline: none; transition: border-color 0.15s; }
    .form_input:focus { border-color: #e2231a; box-shadow: 0 0 0 2px rgba(226, 35, 26, 0.2); }
    .form_input::placeholder { color: #888; }
    .submit-button { width: 100%; background: #e2231a; color: #ffffff; border: none; padding: 13px; font-size: 16px; font-weight: 700; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.15s; margin-top: 6px; }
    .submit-button:hover { background: #c01b13; }
    .error-message-container { min-height: 10px; margin-top: 10px; }
    .error-message-container.error { background: #e2231a; color: white; padding: 10px 14px; border-radius: 4px; font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
    .error-button { background: none; border: none; color: white; font-weight: bold; cursor: pointer; font-size: 14px; }
    .login_info { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; }
    .login_credentials, .login_password { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; color: #374151; }
    .login_credentials h4, .login_password h4 { margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #111827; letter-spacing: 0.5px; }
    .login_credentials code, .login_password code { font-family: "DM Mono", monospace; background: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 4px; }
    .bot_column { text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="login_logo" data-test="login-logo">Swag Labs</div>

  <div class="login_wrapper">
    <div class="login_wrapper-inner">
      <form id="login_button_container" data-test="login-form">
        <div class="form_group">
          <input 
            class="input_error form_input" 
            placeholder="Username" 
            type="text" 
            data-test="username" 
            id="user-name" 
            name="user-name" 
            autocorrect="off" 
            autocapitalize="none" 
            value=""
            aria-label="Username"
          />
        </div>

        <div class="form_group">
          <input 
            class="input_error form_input" 
            placeholder="Password" 
            type="password" 
            data-test="password" 
            id="password" 
            name="password" 
            autocorrect="off" 
            autocapitalize="none" 
            value=""
            aria-label="Password"
          />
        </div>

        <input 
          type="submit" 
          class="submit-button btn_action" 
          data-test="login-button" 
          id="login-button" 
          name="login-button" 
          value="Login"
          aria-label="Login"
        />

        <div class="error-message-container ${errorMsg ? 'error' : ''}" data-test="error-container">
          ${
            errorMsg
              ? `<h3 data-test="error">${errorMsg}</h3><button class="error-button" data-test="error-button">✕</button>`
              : ''
          }
        </div>
      </form>
    </div>

    <div class="login_info">
      <div id="login_credentials" class="login_credentials" data-test="login-credentials">
        <h4>Accepted usernames:</h4>
        <code>standard_user</code><br/>
        <code>locked_out_user</code><br/>
        <code>problem_user</code><br/>
        <code>performance_glitch_user</code><br/>
        <code>error_user</code><br/>
        <code>visual_user</code>
      </div>
      <div class="login_password" data-test="login-password">
        <h4>Password for all users:</h4>
        <code>secret_sauce</code>
      </div>
    </div>

    <div class="bot_column" data-test="footer-info">
      Official Sauce Labs Swag Labs Test Automation Sandbox
    </div>
  </div>
</body>
</html>`,

  inventory: (cartCount: number = 0, addedItems: string[] = []) => {
    const isBackpackAdded = addedItems.includes('sauce-labs-backpack');
    const isBikeLightAdded = addedItems.includes('sauce-labs-bike-light');
    const isBoltShirtAdded = addedItems.includes('sauce-labs-bolt-t-shirt');
    const isFleeceJacketAdded = addedItems.includes('sauce-labs-fleece-jacket');
    const isOnesieAdded = addedItems.includes('sauce-labs-onesie');
    const isRedShirtAdded = addedItems.includes('test.allthethings()-t-shirt-(red)');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Swag Labs - Products</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700">
  <style>
    * { box-sizing: border-box; font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 0; background: #f7f7f7; color: #111; min-height: 100vh; }
    .header { background: #132322; color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
    .header_left { display: flex; align-items: center; gap: 16px; }
    .bm-burger-button { background: none; border: none; color: #ffffff; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 4px; }
    .bm-burger-button:hover { background: rgba(255,255,255,0.1); }
    .app_logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .shopping_cart_link { color: #ffffff; text-decoration: none; position: relative; display: flex; align-items: center; padding: 6px 10px; border-radius: 6px; font-size: 20px; }
    .shopping_cart_link:hover { background: rgba(255,255,255,0.1); }
    .shopping_cart_badge { position: absolute; top: 0; right: 0; background: #e2231a; color: white; font-size: 11px; font-weight: 700; border-radius: 9999px; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
    .header_secondary_container { background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 18px; font-weight: 700; color: #132322; text-transform: uppercase; letter-spacing: 0.5px; }
    .product_sort_container { padding: 6px 12px; font-size: 13px; font-weight: 600; border: 1px solid #d1d5db; border-radius: 6px; background: #ffffff; cursor: pointer; outline: none; }
    .inventory_container { max-width: 1120px; margin: 24px auto; padding: 0 20px; }
    .inventory_list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .inventory_item { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 6px rgba(0,0,0,0.03); transition: transform 0.15s, box-shadow 0.15s; }
    .inventory_item:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
    .inventory_item_img { width: 100%; height: 160px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .inventory_item_description { padding: 18px; display: flex; flex-direction: column; flex: 1; }
    .inventory_item_label { flex: 1; }
    .inventory_item_name { font-size: 16px; font-weight: 700; color: #008080; text-decoration: none; display: block; margin-bottom: 6px; cursor: pointer; }
    .inventory_item_name:hover { text-decoration: underline; }
    .inventory_item_desc { font-size: 13px; color: #6b7280; line-height: 1.45; margin-bottom: 14px; }
    .pricebar { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid #f3f4f6; }
    .inventory_item_price { font-size: 18px; font-weight: 800; color: #132322; }
    .btn_inventory { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #132322; transition: all 0.15s; }
    .btn_primary { background: #ffffff; color: #132322; }
    .btn_primary:hover { background: #132322; color: #ffffff; }
    .btn_secondary { background: #e2231a; color: #ffffff; border-color: #e2231a; }
    .btn_secondary:hover { background: #c01b13; border-color: #c01b13; }
    .bm-menu-wrap { display: none; position: fixed; top: 0; left: 0; width: 280px; height: 100vh; background: #ffffff; box-shadow: 4px 0 20px rgba(0,0,0,0.2); z-index: 1000; padding: 24px; flex-direction: column; }
    .bm-menu-wrap.open { display: flex; }
    .bm-item-list { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
    .bm-item { color: #132322; font-size: 15px; font-weight: 700; text-decoration: none; padding: 10px 12px; border-radius: 6px; }
    .bm-item:hover { background: #f3f4f6; color: #008080; }
    .bm-close-btn { align-self: flex-end; background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; }
    .footer { text-align: center; padding: 32px 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 40px; background: #ffffff; }
  </style>
</head>
<body>
  <!-- Header Bar -->
  <header class="header" data-test="primary-header">
    <div class="header_left">
      <button class="bm-burger-button" id="react-burger-menu-btn" data-test="open-menu" aria-label="Open Menu">☰</button>
      <a href="https://www.saucedemo.com/inventory.html" class="app_logo" data-test="app-logo">Swag Labs</a>
    </div>
    <a href="https://www.saucedemo.com/cart.html" class="shopping_cart_link" data-test="shopping-cart-link" aria-label="Shopping Cart">
      🛒
      ${cartCount > 0 ? `<span class="shopping_cart_badge" data-test="shopping-cart-badge">${cartCount}</span>` : ''}
    </a>
  </header>

  <!-- Sidebar Burger Menu -->
  <div class="bm-menu-wrap" id="sidebar-menu" data-test="sidebar-menu">
    <button class="bm-close-btn" id="react-burger-cross-btn" data-test="close-menu" aria-label="Close Menu">✕</button>
    <nav class="bm-item-list">
      <a href="https://www.saucedemo.com/inventory.html" class="bm-item" id="inventory_sidebar_link" data-test="inventory-sidebar-link">All Items</a>
      <a href="https://saucelabs.com" target="_blank" class="bm-item" id="about_sidebar_link" data-test="about-sidebar-link">About</a>
      <a href="https://www.saucedemo.com" class="bm-item" id="logout_sidebar_link" data-test="logout-sidebar-link">Logout</a>
      <a href="https://www.saucedemo.com/inventory.html?reset=true" class="bm-item" id="reset_sidebar_link" data-test="reset-sidebar-link">Reset App State</a>
    </nav>
  </div>

  <!-- Sub-header -->
  <div class="header_secondary_container" data-test="secondary-header">
    <span class="title" data-test="title">Products</span>
    <select class="product_sort_container" data-test="product-sort-container" aria-label="Sort products by">
      <option value="az">Name (A to Z)</option>
      <option value="za">Name (Z to A)</option>
      <option value="lohi">Price (low to high)</option>
      <option value="hilo">Price (high to low)</option>
    </select>
  </div>

  <!-- Inventory Grid -->
  <main class="inventory_container">
    <div class="inventory_list" data-test="inventory-list">

      <!-- Item 1: Backpack -->
      <div class="inventory_item" data-test="inventory-item">
        <div class="inventory_item_img" role="img" aria-label="Sauce Labs Backpack">🎒</div>
        <div class="inventory_item_description">
          <div class="inventory_item_label">
            <a href="https://www.saucedemo.com/inventory-item.html?id=4" class="inventory_item_name" id="item_4_title_link" data-test="inventory-item-name">Sauce Labs Backpack</a>
            <div class="inventory_item_desc" data-test="inventory-item-desc">carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style and unequaled laptop and tablet protection.</div>
          </div>
          <div class="pricebar">
            <div class="inventory_item_price" data-test="inventory-item-price">$29.99</div>
            <button 
              class="btn_inventory ${isBackpackAdded ? 'btn_secondary' : 'btn_primary'}" 
              id="${isBackpackAdded ? 'remove-sauce-labs-backpack' : 'add-to-cart-sauce-labs-backpack'}" 
              data-test="${isBackpackAdded ? 'remove-sauce-labs-backpack' : 'add-to-cart-sauce-labs-backpack'}"
              name="${isBackpackAdded ? 'remove-sauce-labs-backpack' : 'add-to-cart-sauce-labs-backpack'}"
            >
              ${isBackpackAdded ? 'Remove' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <!-- Item 2: Bike Light -->
      <div class="inventory_item" data-test="inventory-item">
        <div class="inventory_item_img" role="img" aria-label="Sauce Labs Bike Light">💡</div>
        <div class="inventory_item_description">
          <div class="inventory_item_label">
            <a href="https://www.saucedemo.com/inventory-item.html?id=0" class="inventory_item_name" id="item_0_title_link" data-test="inventory-item-name">Sauce Labs Bike Light</a>
            <div class="inventory_item_desc" data-test="inventory-item-desc">A red light isn't the desired state in testing but it is on your bike. 3 lighting modes: 1,000 lumens front white and back red safety light.</div>
          </div>
          <div class="pricebar">
            <div class="inventory_item_price" data-test="inventory-item-price">$9.99</div>
            <button 
              class="btn_inventory ${isBikeLightAdded ? 'btn_secondary' : 'btn_primary'}" 
              id="${isBikeLightAdded ? 'remove-sauce-labs-bike-light' : 'add-to-cart-sauce-labs-bike-light'}" 
              data-test="${isBikeLightAdded ? 'remove-sauce-labs-bike-light' : 'add-to-cart-sauce-labs-bike-light'}"
              name="${isBikeLightAdded ? 'remove-sauce-labs-bike-light' : 'add-to-cart-sauce-labs-bike-light'}"
            >
              ${isBikeLightAdded ? 'Remove' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <!-- Item 3: Bolt T-Shirt -->
      <div class="inventory_item" data-test="inventory-item">
        <div class="inventory_item_img" role="img" aria-label="Sauce Labs Bolt T-Shirt">👕</div>
        <div class="inventory_item_description">
          <div class="inventory_item_label">
            <a href="https://www.saucedemo.com/inventory-item.html?id=1" class="inventory_item_name" id="item_1_title_link" data-test="inventory-item-name">Sauce Labs Bolt T-Shirt</a>
            <div class="inventory_item_desc" data-test="inventory-item-desc">Get your testing superhero on with the Sauce Labs bolt T-shirt. Super soft, 100% pre-shrunk cotton with stylish crew neckline.</div>
          </div>
          <div class="pricebar">
            <div class="inventory_item_price" data-test="inventory-item-price">$15.99</div>
            <button 
              class="btn_inventory ${isBoltShirtAdded ? 'btn_secondary' : 'btn_primary'}" 
              id="${isBoltShirtAdded ? 'remove-sauce-labs-bolt-t-shirt' : 'add-to-cart-sauce-labs-bolt-t-shirt'}" 
              data-test="${isBoltShirtAdded ? 'remove-sauce-labs-bolt-t-shirt' : 'add-to-cart-sauce-labs-bolt-t-shirt'}"
              name="${isBoltShirtAdded ? 'remove-sauce-labs-bolt-t-shirt' : 'add-to-cart-sauce-labs-bolt-t-shirt'}"
            >
              ${isBoltShirtAdded ? 'Remove' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <!-- Item 4: Fleece Jacket -->
      <div class="inventory_item" data-test="inventory-item">
        <div class="inventory_item_img" role="img" aria-label="Sauce Labs Fleece Jacket">🧥</div>
        <div class="inventory_item_description">
          <div class="inventory_item_label">
            <a href="https://www.saucedemo.com/inventory-item.html?id=5" class="inventory_item_name" id="item_5_title_link" data-test="inventory-item-name">Sauce Labs Fleece Jacket</a>
            <div class="inventory_item_desc" data-test="inventory-item-desc">It's not every day that you come across a midweight fleece that boasts all-day comfort and water-repellent durability.</div>
          </div>
          <div class="pricebar">
            <div class="inventory_item_price" data-test="inventory-item-price">$49.99</div>
            <button 
              class="btn_inventory ${isFleeceJacketAdded ? 'btn_secondary' : 'btn_primary'}" 
              id="${isFleeceJacketAdded ? 'remove-sauce-labs-fleece-jacket' : 'add-to-cart-sauce-labs-fleece-jacket'}" 
              data-test="${isFleeceJacketAdded ? 'remove-sauce-labs-fleece-jacket' : 'add-to-cart-sauce-labs-fleece-jacket'}"
              name="${isFleeceJacketAdded ? 'remove-sauce-labs-fleece-jacket' : 'add-to-cart-sauce-labs-fleece-jacket'}"
            >
              ${isFleeceJacketAdded ? 'Remove' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <!-- Item 5: Onesie -->
      <div class="inventory_item" data-test="inventory-item">
        <div class="inventory_item_img" role="img" aria-label="Sauce Labs Onesie">👶</div>
        <div class="inventory_item_description">
          <div class="inventory_item_label">
            <a href="https://www.saucedemo.com/inventory-item.html?id=2" class="inventory_item_name" id="item_2_title_link" data-test="inventory-item-name">Sauce Labs Onesie</a>
            <div class="inventory_item_desc" data-test="inventory-item-desc">Rib snap infant onesie for the junior automation engineer in training. 100% cotton with reinforced 3-snap closure.</div>
          </div>
          <div class="pricebar">
            <div class="inventory_item_price" data-test="inventory-item-price">$7.99</div>
            <button 
              class="btn_inventory ${isOnesieAdded ? 'btn_secondary' : 'btn_primary'}" 
              id="${isOnesieAdded ? 'remove-sauce-labs-onesie' : 'add-to-cart-sauce-labs-onesie'}" 
              data-test="${isOnesieAdded ? 'remove-sauce-labs-onesie' : 'add-to-cart-sauce-labs-onesie'}"
              name="${isOnesieAdded ? 'remove-sauce-labs-onesie' : 'add-to-cart-sauce-labs-onesie'}"
            >
              ${isOnesieAdded ? 'Remove' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      <!-- Item 6: Red Shirt -->
      <div class="inventory_item" data-test="inventory-item">
        <div class="inventory_item_img" role="img" aria-label="Test.allTheThings() T-Shirt">🔴</div>
        <div class="inventory_item_description">
          <div class="inventory_item_label">
            <a href="https://www.saucedemo.com/inventory-item.html?id=3" class="inventory_item_name" id="item_3_title_link" data-test="inventory-item-name">Test.allTheThings() T-Shirt (Red)</a>
            <div class="inventory_item_desc" data-test="inventory-item-desc">This classic Sauce Labs t-shirt is perfect for all the things you need to test. Heather red with seamless collar.</div>
          </div>
          <div class="pricebar">
            <div class="inventory_item_price" data-test="inventory-item-price">$15.99</div>
            <button 
              class="btn_inventory ${isRedShirtAdded ? 'btn_secondary' : 'btn_primary'}" 
              id="${isRedShirtAdded ? 'remove-test.allthethings()-t-shirt-(red)' : 'add-to-cart-test.allthethings()-t-shirt-(red)'}" 
              data-test="${isRedShirtAdded ? 'remove-test.allthethings()-t-shirt-(red)' : 'add-to-cart-test.allthethings()-t-shirt-(red)'}"
              name="${isRedShirtAdded ? 'remove-test.allthethings()-t-shirt-(red)' : 'add-to-cart-test.allthethings()-t-shirt-(red)'}"
            >
              ${isRedShirtAdded ? 'Remove' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

    </div>
  </main>

  <footer class="footer" data-test="footer">
    <div>Twitter · Facebook · LinkedIn</div>
    <div style="margin-top: 8px;">© 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy</div>
  </footer>
</body>
</html>`;
  },

  cart: (cartCount: number = 1, addedItems: string[] = ['sauce-labs-backpack']) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Swag Labs - Your Cart</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700">
  <style>
    * { box-sizing: border-box; font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 0; background: #f7f7f7; color: #111; min-height: 100vh; }
    .header { background: #132322; color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
    .app_logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .shopping_cart_link { color: #ffffff; text-decoration: none; position: relative; padding: 6px 10px; font-size: 20px; }
    .shopping_cart_badge { position: absolute; top: 0; right: 0; background: #e2231a; color: white; font-size: 11px; font-weight: 700; border-radius: 9999px; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
    .header_secondary_container { background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 12px 24px; }
    .title { font-size: 18px; font-weight: 700; color: #132322; text-transform: uppercase; }
    .cart_container { max-width: 860px; margin: 24px auto; padding: 0 20px; }
    .cart_list { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; }
    .cart_headers { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
    .cart_item { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; border-bottom: 1px solid #f3f4f6; }
    .cart_quantity { width: 36px; height: 36px; border: 1px solid #d1d5db; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
    .cart_item_label { flex: 1; margin-left: 20px; }
    .inventory_item_name { font-size: 16px; font-weight: 700; color: #008080; text-decoration: none; }
    .inventory_item_desc { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .item_pricebar { display: flex; align-items: center; gap: 16px; margin-left: 20px; }
    .inventory_item_price { font-size: 16px; font-weight: 700; }
    .btn_secondary { background: #e2231a; color: #ffffff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
    .cart_footer { display: flex; justify-content: space-between; margin-top: 24px; }
    .btn_light { background: #ffffff; color: #132322; border: 1px solid #132322; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-decoration: none; }
    .btn_action { background: #e2231a; color: #ffffff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-decoration: none; }
    .btn_action:hover { background: #c01b13; }
  </style>
</head>
<body>
  <header class="header" data-test="primary-header">
    <a href="https://www.saucedemo.com/inventory.html" class="app_logo" data-test="app-logo">Swag Labs</a>
    <a href="https://www.saucedemo.com/cart.html" class="shopping_cart_link" data-test="shopping-cart-link">
      🛒
      ${cartCount > 0 ? `<span class="shopping_cart_badge" data-test="shopping-cart-badge">${cartCount}</span>` : ''}
    </a>
  </header>

  <div class="header_secondary_container" data-test="secondary-header">
    <span class="title" data-test="title">Your Cart</span>
  </div>

  <main class="cart_container">
    <div class="cart_list" data-test="cart-list">
      <div class="cart_headers">
        <span>QTY</span>
        <span>Description</span>
      </div>

      <div class="cart_item" data-test="inventory-item">
        <div class="cart_quantity" data-test="item-quantity">1</div>
        <div class="cart_item_label">
          <a href="https://www.saucedemo.com/inventory-item.html?id=4" class="inventory_item_name" data-test="inventory-item-name">Sauce Labs Backpack</a>
          <div class="inventory_item_desc" data-test="inventory-item-desc">carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style.</div>
        </div>
        <div class="item_pricebar">
          <div class="inventory_item_price" data-test="inventory-item-price">$29.99</div>
          <button class="btn_secondary" id="remove-sauce-labs-backpack" data-test="remove-sauce-labs-backpack" name="remove-sauce-labs-backpack">Remove</button>
        </div>
      </div>
    </div>

    <div class="cart_footer">
      <a href="https://www.saucedemo.com/inventory.html" class="btn_light" id="continue-shopping" data-test="continue-shopping">Continue Shopping</a>
      <a href="https://www.saucedemo.com/checkout-step-one.html" class="btn_action" id="checkout" data-test="checkout">Checkout</a>
    </div>
  </main>
</body>
</html>`,

  checkoutStepOne: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Swag Labs - Checkout Info</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700">
  <style>
    * { box-sizing: border-box; font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 0; background: #f7f7f7; color: #111; min-height: 100vh; }
    .header { background: #132322; color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
    .app_logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .header_secondary_container { background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 12px 24px; }
    .title { font-size: 18px; font-weight: 700; color: #132322; text-transform: uppercase; }
    .checkout_info_container { max-width: 480px; margin: 32px auto; padding: 0 20px; }
    .checkout_info_wrapper { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; }
    .form_group { margin-bottom: 16px; }
    .form_input { width: 100%; padding: 12px 14px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 6px; outline: none; }
    .form_input:focus { border-color: #e2231a; }
    .checkout_buttons { display: flex; justify-content: space-between; margin-top: 24px; }
    .btn_light { background: #ffffff; color: #132322; border: 1px solid #132322; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-decoration: none; }
    .submit-button { background: #e2231a; color: #ffffff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; }
    .submit-button:hover { background: #c01b13; }
  </style>
</head>
<body>
  <header class="header" data-test="primary-header">
    <a href="https://www.saucedemo.com/inventory.html" class="app_logo" data-test="app-logo">Swag Labs</a>
  </header>

  <div class="header_secondary_container" data-test="secondary-header">
    <span class="title" data-test="title">Checkout: Your Information</span>
  </div>

  <main class="checkout_info_container">
    <div class="checkout_info_wrapper">
      <form id="checkout_info_form" data-test="checkout-info-form">
        <div class="form_group">
          <input class="form_input" placeholder="First Name" type="text" data-test="firstName" id="first-name" name="firstName" value="" aria-label="First Name" required />
        </div>
        <div class="form_group">
          <input class="form_input" placeholder="Last Name" type="text" data-test="lastName" id="last-name" name="lastName" value="" aria-label="Last Name" required />
        </div>
        <div class="form_group">
          <input class="form_input" placeholder="Zip/Postal Code" type="text" data-test="postalCode" id="postal-code" name="postalCode" value="" aria-label="Zip/Postal Code" required />
        </div>

        <div class="checkout_buttons">
          <a href="https://www.saucedemo.com/cart.html" class="btn_light" id="cancel" data-test="cancel">Cancel</a>
          <input type="submit" class="submit-button" id="continue" data-test="continue" name="continue" value="Continue" />
        </div>
      </form>
    </div>
  </main>
</body>
</html>`,

  checkoutStepTwo: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Swag Labs - Checkout Overview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700">
  <style>
    * { box-sizing: border-box; font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 0; background: #f7f7f7; color: #111; min-height: 100vh; }
    .header { background: #132322; color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
    .app_logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .header_secondary_container { background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 12px 24px; }
    .title { font-size: 18px; font-weight: 700; color: #132322; text-transform: uppercase; }
    .checkout_summary_container { max-width: 720px; margin: 24px auto; padding: 0 20px; }
    .summary_wrapper { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; }
    .summary_info_label { font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; margin-top: 16px; margin-bottom: 4px; }
    .summary_value_label { font-size: 14px; color: #4b5563; }
    .summary_total_label { font-size: 18px; font-weight: 800; color: #132322; margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 14px; }
    .cart_footer { display: flex; justify-content: space-between; margin-top: 24px; }
    .btn_light { background: #ffffff; color: #132322; border: 1px solid #132322; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-decoration: none; }
    .btn_action { background: #e2231a; color: #ffffff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-decoration: none; }
    .btn_action:hover { background: #c01b13; }
  </style>
</head>
<body>
  <header class="header" data-test="primary-header">
    <a href="https://www.saucedemo.com/inventory.html" class="app_logo" data-test="app-logo">Swag Labs</a>
  </header>

  <div class="header_secondary_container" data-test="secondary-header">
    <span class="title" data-test="title">Checkout: Overview</span>
  </div>

  <main class="checkout_summary_container">
    <div class="summary_wrapper">
      <div class="summary_info_label">Payment Information:</div>
      <div class="summary_value_label" data-test="payment-info-value">SauceCard #31437</div>

      <div class="summary_info_label">Shipping Information:</div>
      <div class="summary_value_label" data-test="shipping-info-value">Free Pony Express Delivery!</div>

      <div class="summary_info_label">Price Total</div>
      <div class="summary_value_label" data-test="subtotal-label">Item total: $29.99</div>
      <div class="summary_value_label" data-test="tax-label">Tax: $2.40</div>
      <div class="summary_total_label" data-test="total-label">Total: $32.39</div>

      <div class="cart_footer">
        <a href="https://www.saucedemo.com/inventory.html" class="btn_light" id="cancel" data-test="cancel">Cancel</a>
        <a href="https://www.saucedemo.com/checkout-complete.html" class="btn_action" id="finish" data-test="finish">Finish</a>
      </div>
    </div>
  </main>
</body>
</html>`,

  checkoutComplete: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Swag Labs - Order Complete</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700">
  <style>
    * { box-sizing: border-box; font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 0; background: #f7f7f7; color: #111; min-height: 100vh; }
    .header { background: #132322; color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
    .app_logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .header_secondary_container { background: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 12px 24px; }
    .title { font-size: 18px; font-weight: 700; color: #132322; text-transform: uppercase; }
    .checkout_complete_container { max-width: 600px; margin: 40px auto; padding: 0 20px; text-align: center; }
    .complete_wrapper { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px 24px; }
    .pony_express { font-size: 56px; margin-bottom: 16px; }
    .complete_header { font-size: 22px; font-weight: 800; color: #132322; margin-bottom: 10px; }
    .complete_text { font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 28px; }
    .btn_action { background: #e2231a; color: #ffffff; border: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 700; text-transform: uppercase; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn_action:hover { background: #c01b13; }
  </style>
</head>
<body>
  <header class="header" data-test="primary-header">
    <a href="https://www.saucedemo.com/inventory.html" class="app_logo" data-test="app-logo">Swag Labs</a>
  </header>

  <div class="header_secondary_container" data-test="secondary-header">
    <span class="title" data-test="title">Checkout: Complete!</span>
  </div>

  <main class="checkout_complete_container">
    <div class="complete_wrapper" data-test="checkout-complete-container">
      <div class="pony_express" role="img" aria-label="Delivery Pony">🐎</div>
      <h2 class="complete_header" data-test="complete-header">Thank you for your order!</h2>
      <div class="complete_text" data-test="complete-text">Your order has been dispatched, and will arrive just as fast as the pony can get there!</div>
      <a href="https://www.saucedemo.com/inventory.html" class="btn_action" id="back-to-products" data-test="back-to-products">Back Home</a>
    </div>
  </main>
</body>
</html>`,
};
