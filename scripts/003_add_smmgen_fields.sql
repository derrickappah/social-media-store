-- Add SMMGen API integration fields to orders table
alter table public.orders
add column if not exists smmgen_order_id text,
add column if not exists processed_at timestamp with time zone;

-- Create index on smmgen_order_id for faster lookups
create index if not exists orders_smmgen_order_id_idx on public.orders(smmgen_order_id);

-- Create index on processed_at for tracking processing times
create index if not exists orders_processed_at_idx on public.orders(processed_at);

