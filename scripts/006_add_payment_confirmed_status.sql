-- Add "payment_confirmed" status to the valid_status constraint
-- This allows tracking when payment is confirmed but SMMGen processing hasn't started yet

-- First, drop the existing constraint
alter table public.orders drop constraint if exists valid_status;

-- Recreate the constraint with the new status
alter table public.orders add constraint valid_status 
  check (status in ('pending', 'payment_confirmed', 'processing', 'completed', 'cancelled'));

-- Add comment to explain the status flow
comment on column public.orders.status is 
  'Order status: pending -> payment_confirmed -> processing -> completed (or cancelled)';

