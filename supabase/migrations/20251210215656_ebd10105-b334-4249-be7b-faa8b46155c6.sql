-- Remove foreign key constraint from facility.created_by to allow Azure auth user IDs
ALTER TABLE facility DROP CONSTRAINT IF EXISTS facility_created_by_fkey;