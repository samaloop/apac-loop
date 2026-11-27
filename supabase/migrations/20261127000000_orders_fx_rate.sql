-- SGD→IDR rate used to convert the SGD price for each Xendit (IDR) order,
-- kept for accounting. Null for PayPal orders, which are charged in SGD.
alter table orders add column if not exists fx_rate numeric;
