POST /api/auth/login - Login
POST /api/auth/register - Register new user
POST /api/auth/refresh-token - Refresh access token
POST /api/auth/revoke-token - Revoke refresh token
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password - Reset password with token
POST /api/auth/logout - Logout (revoke token)

GET /api/categories - Get all categories
GET /api/categories/{id} - Get category by ID
POST /api/categories - Create category (Admin only)
PUT /api/categories/{id} - Update category (Admin only)
DELETE /api/categories/{id} - Delete category (Admin only)
GET /api/categories/exists/{name} - Check if category name exists

GET /api/suppliers - Get all suppliers
GET /api/suppliers/{id} - Get supplier by ID
POST /api/suppliers - Create supplier (Admin only)
PUT /api/suppliers/{id} - Update supplier (Admin only)
DELETE /api/suppliers/{id} - Delete supplier (Admin only)
GET /api/suppliers/exists/{name} - Check if supplier name exists

GET /api/products - Get all products
GET /api/products/{id} - Get product by ID
GET /api/products/barcode/{barcode} - Get product by barcode
POST /api/products/search - Search products
POST /api/products/scan - Scan barcode
POST /api/products - Create product (Admin only)
PUT /api/products/{id} - Update product (Admin only)
DELETE /api/products/{id} - Delete product (Admin only)
PATCH /api/products/{id}/toggle-status - Toggle product status (Admin only)
PATCH /api/products/{id}/stock - Update stock (Admin only)
GET /api/products/exists/barcode/{barcode} - Check if barcode exists

GET /api/inventory - Get all inventory
GET /api/inventory/product/{productId} - Get inventory by product ID
GET /api/inventory/barcode/{barcode} - Get inventory by barcode
GET /api/inventory/low-stock - Get low stock items
POST /api/inventory/search - Search inventory
PUT /api/inventory/product/{productId}/stock - Update stock to specific quantity (Admin only)
PATCH /api/inventory/product/{productId}/adjust - Adjust stock (add/remove) (Admin only)
GET /api/inventory/product/{productId}/check-stock/{requiredQuantity} - Check stock availability

GET /api/sales - Get all sales
GET /api/sales/{id} - Get sale by ID
POST /api/sales - Create sale
POST /api/sales/with-items - Create sale with items
POST /api/sales/with-payment - Create sale with payment (complete transaction)
DELETE /api/sales/{id} - Delete sale (Admin only)
POST /api/sales/search - Search sales
GET /api/sales/user/{userId} - Get sales by user
GET /api/sales/date-range - Get sales by date range
GET /api/sales/summary/daily - Get daily sales summary
GET /api/sales/summary/total-amount - Get total sales amount
GET /api/sales/summary/total-count - Get total sales count

GET /api/sales/{saleId}/saleItems - Get all items for a sale
GET /api/sales/{saleId}/saleItems/{id} - Get sale item by ID
POST /api/sales/{saleId}/saleItems - Add item to sale
POST /api/sales/{saleId}/saleItems/multiple - Add multiple items to sale
PUT /api/sales/{saleId}/saleItems/{id} - Update sale item
DELETE /api/sales/{saleId}/saleItems/{id} - Remove item from sale
DELETE /api/sales/{saleId}/saleItems - Remove all items from sale
GET /api/sales/{saleId}/saleItems/total - Calculate sale total
GET /api/sales/{saleId}/saleItems/sale-with-items - Get sale with all items

GET /api/payments - Get all payments
GET /api/payments/{id} - Get payment by ID
GET /api/payments/sale/{saleId} - Get payment by sale ID
POST /api/payments - Create payment
PUT /api/payments/{id} - Update payment (transactionId & notes only)
GET /api/payments/sale/{saleId}/exists - Check if sale has payment
GET /api/payments/{id}/receipt - Get payment receipt
GET /api/payments/date-range - Get payments by date range
GET /api/payments/summary/total-amount - Get total payments amount