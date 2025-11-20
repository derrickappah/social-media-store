-- Add quantity field to orders table for reliable quantity tracking
alter table public.orders
add column if not exists quantity integer;

-- Create index on quantity for analytics
create index if not exists orders_quantity_idx on public.orders(quantity);

-- Update existing orders to extract quantity from package_name
update public.orders
set quantity = cast(
  regexp_replace(
    substring(package_name from '[\d,]+'),
    ',',
    '',
    'g'
  ) as integer
)
where quantity is null and package_name ~ '[\d,]+';

