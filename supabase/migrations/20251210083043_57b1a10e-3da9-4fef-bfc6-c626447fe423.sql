-- Add created_by column to facility table
ALTER TABLE public.facility 
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for facility table to restrict access to own facilities

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can delete facilities" ON public.facility;
DROP POLICY IF EXISTS "Authenticated users can insert facilities" ON public.facility;
DROP POLICY IF EXISTS "Authenticated users can update facilities" ON public.facility;

-- Create new policies that check ownership
CREATE POLICY "Users can insert their own facilities" 
ON public.facility 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own facilities" 
ON public.facility 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own facilities" 
ON public.facility 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by);