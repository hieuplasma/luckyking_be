-- This is an empty migration.
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
DECLARE
  all_confirmed BOOLEAN;
  all_paid_or_no_prize BOOLEAN;
  all_no_prize BOOLEAN;
BEGIN
  SELECT
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'CONFIRMED' THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status IN ('WON', 'PAID', 'NO_PRIZE') THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'NO_PRIZE' THEN 1 ELSE 0 END)
  INTO
    all_confirmed,
    all_paid_or_no_prize,
    all_no_prize
  FROM
    "Lottery"
  WHERE
    "Lottery"."orderId" = NEW.orderId;

  IF all_confirmed THEN
    UPDATE "Order"
    SET status = 'CONFIRMED'
    WHERE id = NEW.orderId;
  ELSIF all_paid_or_no_prize THEN
    UPDATE "Order"
    SET status = 'PAID'
    WHERE id = NEW.orderId;
  ELSIF all_no_prize THEN
    UPDATE "Order"
    SET status = 'NO_PRIZE'
    WHERE id = NEW.orderId;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lottery_status_trigger
AFTER UPDATE OR DELETE ON "Lottery"
FOR EACH ROW
EXECUTE FUNCTION update_order_status();




CREATE OR REPLACE FUNCTION update_order_benefits()
RETURNS TRIGGER AS $$
DECLARE
  total_benefits INT;
BEGIN
  SELECT COALESCE(SUM(benefits), 0) INTO total_benefits
  FROM "Lottery"
  WHERE "orderId" = NEW."orderId";

  UPDATE "Order"
  SET benefits = total_benefits
  WHERE id = NEW."orderId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_benefits_trigger
AFTER UPDATE OR DELETE ON "Lottery"
FOR EACH ROW
EXECUTE FUNCTION update_order_benefits();