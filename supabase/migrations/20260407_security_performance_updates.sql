-- 1. Ajout d'index pour optimiser les performances de requêtes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_boutique_id ON orders (boutique_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_stocks_product_id ON stocks (product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_boutique_id ON stocks (boutique_id);

-- 2. Audit des stocks : Créer une table pour suivre tous les changements
CREATE TABLE IF NOT EXISTS stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  quantity_changed INT NOT NULL,
  new_quantity INT NOT NULL,
  reason TEXT, -- 'Vente', 'Inventaire', 'Ajustement', 'Transfert'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger pour log automatique des changements de stock
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF OLD.quantity <> NEW.quantity THEN
      INSERT INTO stock_logs (product_id, boutique_id, quantity_changed, new_quantity, reason)
      VALUES (NEW.product_id, NEW.boutique_id, NEW.quantity - OLD.quantity, NEW.quantity, 'Ajustement automatique');
    END IF;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO stock_logs (product_id, boutique_id, quantity_changed, new_quantity, reason)
    VALUES (NEW.product_id, NEW.boutique_id, NEW.quantity, NEW.quantity, 'Stock initial/Nouveau');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_log_stock_change ON stocks;
CREATE TRIGGER tr_log_stock_change
AFTER INSERT OR UPDATE ON stocks
FOR EACH ROW EXECUTE FUNCTION log_stock_change();

-- 4. Restauration de stock sur annulation de commande
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe à 'cancelled'
  IF (NEW.status = 'cancelled' AND OLD.status <> 'cancelled') THEN
    -- On remet le stock pour chaque item de la commande
    UPDATE stocks s
    SET quantity = s.quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND s.product_id = oi.product_id
      AND s.boutique_id = oi.boutique_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_restore_stock_on_cancel ON orders;
CREATE TRIGGER tr_restore_stock_on_cancel
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION restore_stock_on_cancel();
