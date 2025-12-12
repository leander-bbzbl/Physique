-- ============================================
-- User Profiles Tabelle für Profilbilder
-- ============================================

-- User Profiles Tabelle
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes für bessere Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- Trigger für updated_at (automatische Aktualisierung)
-- ============================================

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security aktivieren
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies für user_profiles Tabelle
-- ============================================

-- Nutzer können nur ihr eigenes Profil sehen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'user_profiles_select_owner'
    AND schemaname = 'public'
    AND tablename = 'user_profiles'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "user_profiles_select_owner" ON public.user_profiles
      FOR SELECT
      USING (user_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Authentifizierte Nutzer können ihr Profil erstellen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'user_profiles_insert_owner'
    AND schemaname = 'public'
    AND tablename = 'user_profiles'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "user_profiles_insert_owner" ON public.user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur ihr eigenes Profil bearbeiten
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'user_profiles_update_owner'
    AND schemaname = 'public'
    AND tablename = 'user_profiles'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "user_profiles_update_owner" ON public.user_profiles
      FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur ihr eigenes Profil löschen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'user_profiles_delete_owner'
    AND schemaname = 'public'
    AND tablename = 'user_profiles'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "user_profiles_delete_owner" ON public.user_profiles
      FOR DELETE
      USING (user_id = auth.uid());
    $sql$;
  END IF;
END
$$;

