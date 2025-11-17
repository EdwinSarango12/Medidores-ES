-- Script para agregar la política faltante de INSERT en profiles
-- Ejecuta este script en el SQL Editor de Supabase

-- Política para permitir que los usuarios inserten su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

