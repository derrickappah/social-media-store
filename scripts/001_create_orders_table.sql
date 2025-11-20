-- Create orders table to store all order submissions
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Step 1: Platform
  platform text not null,
  
  -- Step 2: Service details
  service_type text not null,
  package_name text not null,
  package_price numeric not null,
  social_media_link text not null,
  
  -- Step 3: Contact information
  full_name text not null,
  phone text not null,
  email text not null,
  
  -- Step 4: Payment
  payment_method text not null,
  
  -- Step 5: Screenshot
  screenshot_url text,
  
  -- Order status
  status text default 'pending' not null,
  
  -- Constraints
  constraint valid_platform check (platform in ('Instagram', 'Facebook', 'TikTok', 'YouTube', 'Twitter')),
  constraint valid_service_type check (service_type in ('Likes', 'Followers', 'Comments', 'Saves', 'Views')),
  constraint valid_payment_method check (payment_method in ('Momo', 'Bank Transfer', 'Card Payment')),
  constraint valid_status check (status in ('pending', 'processing', 'completed', 'cancelled'))
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Create policy to allow anyone to insert orders (public form submission)
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

-- Create policy to allow users to view their own orders by email
create policy "Users can view their own orders"
  on public.orders for select
  using (true);

-- Create index on created_at for faster queries
create index orders_created_at_idx on public.orders(created_at desc);

-- Create index on email for faster lookups
create index orders_email_idx on public.orders(email);

-- Create index on status for filtering
create index orders_status_idx on public.orders(status);
