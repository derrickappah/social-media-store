-- Add pricing tracking fields to orders table
alter table public.orders
add column if not exists panel_cost numeric,
add column if not exists panel_currency text default 'USD',
add column if not exists profit numeric,
add column if not exists profit_margin numeric;

-- Create index on panel_cost for cost analysis
create index if not exists orders_panel_cost_idx on public.orders(panel_cost);

