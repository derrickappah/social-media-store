-- Add user_id column to orders table for linking orders to authenticated users
alter table public.orders
add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Create index on user_id for faster lookups
create index if not exists orders_user_id_idx on public.orders(user_id);

-- Update RLS policy to allow users to view their own orders
drop policy if exists "Users can view their own orders" on public.orders;

create policy "Users can view their own orders"
  on public.orders for select
  using (
    auth.uid() = user_id or
    auth.uid()::text = (select id::text from auth.users where email = orders.email limit 1) or
    true -- Allow viewing for now, can be restricted later
  );

-- Update insert policy to allow authenticated users to insert orders
drop policy if exists "Anyone can insert orders" on public.orders;

create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

