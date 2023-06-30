-- This is an empty migration.
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
DECLARE
  all_returned BOOLEAN;
  all_confirmed BOOLEAN;
BEGIN
  SELECT
    COUNT(*) = SUM(CASE WHEN "Lottery".status = 'RETURNED' THEN 1 ELSE 0 END),
    COUNT(*) = SUM(CASE WHEN "Lottery".status IN ('WON', 'PAID', 'NO_PRIZE', 'RETURNED', 'ERROR', 'CONFIRMED') THEN 1 ELSE 0 END)
  INTO
    all_returned,
    all_confirmed
  FROM
    "Lottery"
  WHERE
    "Lottery"."orderId" = NEW."orderId";

  IF all_returned THEN
    UPDATE "Order"
    SET status = 'RETURNED'
    WHERE id = NEW."orderId";
  ELSEIF all_confirmed THEN
    UPDATE "Order"
    SET status = 'CONFIRMED'
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