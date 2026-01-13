BEGIN;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);


-- =========================
-- REFRESH TOKENS
-- =========================
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);


-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);


-- =========================
-- SUPPLIERS
-- =========================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    contact_info TEXT
);


-- =========================
-- PRODUCTS (BARCODE BASED)
-- =========================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(32) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id INT REFERENCES categories(id),
    supplier_id UUID REFERENCES suppliers(id),
    price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fast barcode scanning
CREATE UNIQUE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);


-- =========================
-- INVENTORY
-- =========================
CREATE TABLE inventory (
    product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_quantity ON inventory(quantity);


-- =========================
-- SALES (RECEIPT HEADER)
-- =========================
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_user ON sales(user_id);


-- =========================
-- SALE ITEMS (RECEIPT LINES)
-- =========================
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    barcode VARCHAR(32) NOT NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_sale NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_sale_items_barcode ON sale_items(barcode);


-- =========================
-- PAYMENTS (OPTIONAL BUT REALISTIC)
-- =========================
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    method TEXT NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_id TEXT NOT NULL,
    notes TEXT
);

CREATE INDEX idx_payments_sale_id ON payments(sale_id);


-- =========================
-- INVENTORY LOG (AUDIT)
-- =========================
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    change_qty INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);

COMMIT;
