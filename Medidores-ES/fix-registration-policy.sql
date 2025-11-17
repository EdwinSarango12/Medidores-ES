-- Script para solucionar el problema de inserción de perfiles durante el registro
-- Ejecuta este script en el SQL Editor de Supabase

-- Opción 1: Usar el trigger (RECOMENDADO)
-- Primero ejecuta el script supabase-trigger-profile.sql para crear el trigger
-- El trigger creará automáticamente el perfil cuando se registre un usuario

-- Opción 2: Modificar la política para permitir inserción durante el registro
-- Si prefieres no usar el trigger, puedes modificar la política así:

-- Eliminar la política existente si existe
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Crear una política más permisiva que permita la inserción durante el registro
-- Esta política permite insertar si el id coincide con el usuario autenticado
-- O si el usuario acaba de ser creado (verificado por el trigger o por metadata)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    -- Permitir inserción si el usuario existe en auth.users (para el trigger)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = profiles.id
    )
  );

-- NOTA: La mejor solución es usar el trigger (supabase-trigger-profile.sql)
-- porque crea el perfil automáticamente sin necesidad de políticas especiales

