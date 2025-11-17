-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'medidor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de lecturas
CREATE TABLE IF NOT EXISTS lecturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor_medidor NUMERIC NOT NULL,
  observaciones TEXT,
  foto_medidor TEXT,
  foto_fachada TEXT,
  latitud NUMERIC NOT NULL,
  longitud NUMERIC NOT NULL,
  google_maps_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturas ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para lecturas
-- Los usuarios pueden insertar sus propias lecturas
CREATE POLICY "Users can insert own lecturas"
  ON lecturas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden ver sus propias lecturas
CREATE POLICY "Users can view own lecturas"
  ON lecturas FOR SELECT
  USING (auth.uid() = user_id);

-- Los administradores pueden ver todas las lecturas
CREATE POLICY "Admins can view all lecturas"
  ON lecturas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecturas_updated_at
  BEFORE UPDATE ON lecturas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear bucket de almacenamiento para las imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('lecturas', 'lecturas', true)
ON CONFLICT (id) DO NOTHING;

-- Política de almacenamiento: los usuarios autenticados pueden subir imágenes
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lecturas' AND
    auth.role() = 'authenticated'
  );

-- Política de almacenamiento: las imágenes son públicas para lectura
CREATE POLICY "Images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lecturas');

