-- Enable PostGIS for geometry support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Kommuner (Municipalities)
CREATE TABLE kommun (
  id SERIAL PRIMARY KEY,
  kommun_namn VARCHAR NOT NULL,
  kommun_kod VARCHAR NOT NULL UNIQUE
);

-- Typer av anläggning enligt CIF klassificering
CREATE TABLE facility_type (
  id SERIAL PRIMARY KEY,
  code VARCHAR NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT
);

-- Anläggning (Facility)
CREATE TABLE facility (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR UNIQUE,
  name TEXT NOT NULL,
  facility_type_id INTEGER REFERENCES facility_type(id),
  kommun_id INTEGER REFERENCES kommun(id),
  address TEXT,
  postal_code VARCHAR,
  city VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Geometri / platsinfo för anläggning
CREATE TABLE facility_geometry (
  facility_id INTEGER PRIMARY KEY REFERENCES facility(id) ON DELETE CASCADE,
  geom GEOMETRY,
  geom_type VARCHAR,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aktivitetsytor / underdelar av anläggning
CREATE TABLE activity_area (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facility(id) ON DELETE CASCADE,
  area_type VARCHAR,
  name TEXT,
  description TEXT,
  capacity INTEGER,
  geom GEOMETRY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ytterligare metadata / attribut
CREATE TABLE facility_attribute (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facility(id) ON DELETE CASCADE,
  attribute VARCHAR NOT NULL,
  value TEXT
);

-- User profiles for admin users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  kommun_id INTEGER REFERENCES kommun(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE kommun ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_geometry ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_attribute ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for public-facing data
CREATE POLICY "Public can read municipalities" ON kommun FOR SELECT USING (true);
CREATE POLICY "Public can read facility types" ON facility_type FOR SELECT USING (true);
CREATE POLICY "Public can read facilities" ON facility FOR SELECT USING (true);
CREATE POLICY "Public can read facility geometry" ON facility_geometry FOR SELECT USING (true);
CREATE POLICY "Public can read activity areas" ON activity_area FOR SELECT USING (true);
CREATE POLICY "Public can read facility attributes" ON facility_attribute FOR SELECT USING (true);

-- Admin write access (authenticated users can manage data for their municipality)
CREATE POLICY "Authenticated users can insert facilities" ON facility FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update facilities" ON facility FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete facilities" ON facility FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert geometry" ON facility_geometry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update geometry" ON facility_geometry FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete geometry" ON facility_geometry FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activity areas" ON activity_area FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update activity areas" ON activity_area FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete activity areas" ON activity_area FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert attributes" ON facility_attribute FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update attributes" ON facility_attribute FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete attributes" ON facility_attribute FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert facility types" ON facility_type FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert municipalities" ON kommun FOR INSERT TO authenticated WITH CHECK (true);

-- Profile policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facility_updated_at BEFORE UPDATE ON facility
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_geometry_updated_at BEFORE UPDATE ON facility_geometry
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_area_updated_at BEFORE UPDATE ON activity_area
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO kommun (kommun_namn, kommun_kod) VALUES 
('Stockholm', '0180'),
('Göteborg', '1480'),
('Malmö', '1280'),
('Uppsala', '0380'),
('Västerås', '1980');

INSERT INTO facility_type (code, label, description) VALUES 
('FOOTBALL', 'Fotbollsplan', 'Gräs- eller konstgräsplan för fotboll'),
('SPORTS_HALL', 'Idrottshall', 'Inomhushall för olika idrotter'),
('SWIMMING', 'Simhall', 'Inomhusbassäng för simning'),
('ICE_RINK', 'Ishall', 'Inomhushall för is-idrotter'),
('TENNIS', 'Tennisbana', 'Utomhus- eller inomhustennisbana'),
('ATHLETICS', 'Friidrottsanläggning', 'Anläggning för friidrott'),
('GYM', 'Gym', 'Träningsanläggning med styrketräning');