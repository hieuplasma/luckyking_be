-- This is an empty migration.
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
DECLARE
  all_confirmed BOOLEAN;
  all_no_prize BOOLEAN;
  all_won BOOLEAN;
  all_paid BOOLEAN;
  all_paid_or_no_prize BOOLEAN;
  all_paid_or_won BOOLEAN;
BEGIN
  SELECT
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'CONFIRMED' THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'NO_PRIZE' THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'WON' THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'PAID' THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status IN ('PAID', 'NO_PRIZE') THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status IN ('WON', 'PAID', 'NO_PRIZE') THEN 1 ELSE 0 END)
  INTO
    all_confirmed,
    all_no_prize,
    all_won,
    all_paid,
    all_paid_or_no_prize
    all_paid_or_won
  FROM
    "Lottery"
  WHERE
    "Lottery"."orderId" = NEW."orderId";

  IF all_confirmed THEN
    UPDATE "Order"
    SET status = 'CONFIRMED'
    WHERE id = NEW."orderId";
  ELSIF all_no_prize THEN
    UPDATE "Order"
    SET status = 'NO_PRIZE'
    WHERE id = NEW."orderId";
  ELSIF all_won THEN
    UPDATE "Order"
    SET status = 'WON'
    WHERE id = NEW."orderId";
  ELSIF all_paid THEN
    UPDATE "Order"
    SET status = 'PAID'
    WHERE id = NEW."orderId";
  ELSIF all_paid_or_no_prize THEN
    UPDATE "Order"
    SET status = 'PAID'
    WHERE id = NEW."orderId";
  ELSIF all_paid_or_won THEN
    UPDATE "Order"
    SET status = 'WON'
    WHERE id = NEW."orderId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER lottery_status_trigger
AFTER UPDATE ON "Lottery"
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_order_status();


CREATE OR REPLACE FUNCTION update_order_benefits()
RETURNS TRIGGER AS $$
DECLARE
  total_benefits BIGINT;
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

CREATE OR REPLACE TRIGGER update_order_benefits_trigger
AFTER UPDATE ON "Lottery"
FOR EACH ROW
WHEN (OLD.benefits IS DISTINCT FROM NEW.benefits)
EXECUTE FUNCTION update_order_benefits();