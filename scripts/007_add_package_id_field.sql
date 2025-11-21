-- Add package_id field to orders table for mapping to SMMGen service IDs
-- This allows different packages to use different SMMGen service IDs

alter table public.orders
add column if not exists package_id text;

-- Create index on package_id for faster lookups
create index if not exists orders_package_id_idx on public.orders(package_id);

-- Update existing orders to extract package_id from package_name
-- This is a best-effort update - you may need to manually update some records
update public.orders
set package_id = lower(regexp_replace(package_name, '[^a-zA-Z0-9_]', '_', 'g'))
where package_id is null;

