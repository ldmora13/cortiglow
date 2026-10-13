-- Supports the public active-only catalog and the admin inactive-product view.
CREATE INDEX "products_is_active_idx" ON "products"("is_active");
