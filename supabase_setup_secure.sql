-- ============================================
-- Supabase Datenbank Setup für Physique App
-- MIT Authentifizierung und Owner-basierten Policies
-- ============================================

-- Übungen Tabelle (öffentlich lesbar, aber nur authentifizierte Nutzer können erstellen/bearbeiten)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Optional: owner_id für benutzerdefinierte Übungen
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Trainingspläne Tabelle (nur für den Besitzer sichtbar/bearbeitbar)
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainingsplan-Übungen Verknüpfung
CREATE TABLE IF NOT EXISTS training_plan_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL,
  rest_seconds INTEGER,
  "order" INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes für bessere Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_exercises_owner_id ON exercises(owner_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_owner_id ON training_plans(owner_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_is_active ON training_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_training_plan_exercises_plan_id ON training_plan_exercises(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_exercises_exercise_id ON training_plan_exercises(exercise_id);

-- ============================================
-- Trigger für updated_at (automatische Aktualisierung)
-- ============================================

-- Funktion für updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für exercises
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger für training_plans
DROP TRIGGER IF EXISTS update_training_plans_updated_at ON training_plans;
CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security aktivieren
-- ============================================

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_exercises ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies für exercises Tabelle
-- ============================================

-- Alle können Standard-Übungen lesen (owner_id IS NULL = öffentliche Übungen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'exercises_select_public'
    AND schemaname = 'public'
    AND tablename = 'exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "exercises_select_public" ON public.exercises
      FOR SELECT
      USING (owner_id IS NULL OR owner_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Authentifizierte Nutzer können Übungen erstellen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'exercises_insert_authenticated'
    AND schemaname = 'public'
    AND tablename = 'exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "exercises_insert_authenticated" ON public.exercises
      FOR INSERT
      TO authenticated
      WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur ihre eigenen Übungen bearbeiten
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'exercises_update_owner'
    AND schemaname = 'public'
    AND tablename = 'exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "exercises_update_owner" ON public.exercises
      FOR UPDATE
      USING (owner_id = auth.uid() OR owner_id IS NULL)
      WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur ihre eigenen Übungen löschen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'exercises_delete_owner'
    AND schemaname = 'public'
    AND tablename = 'exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "exercises_delete_owner" ON public.exercises
      FOR DELETE
      USING (owner_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- ============================================
-- Policies für training_plans Tabelle
-- ============================================

-- Nutzer können nur ihre eigenen Trainingspläne sehen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plans_select_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plans'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plans_select_owner" ON public.training_plans
      FOR SELECT
      USING (owner_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Authentifizierte Nutzer können Trainingspläne erstellen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plans_insert_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plans'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plans_insert_owner" ON public.training_plans
      FOR INSERT
      TO authenticated
      WITH CHECK (owner_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur ihre eigenen Trainingspläne bearbeiten
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plans_update_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plans'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plans_update_owner" ON public.training_plans
      FOR UPDATE
      USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur ihre eigenen Trainingspläne löschen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plans_delete_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plans'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plans_delete_owner" ON public.training_plans
      FOR DELETE
      USING (owner_id = auth.uid());
    $sql$;
  END IF;
END
$$;

-- ============================================
-- Policies für training_plan_exercises Tabelle
-- ============================================

-- Nutzer können nur Übungen ihrer eigenen Trainingspläne sehen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plan_exercises_select_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plan_exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plan_exercises_select_owner" ON public.training_plan_exercises
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM training_plans
          WHERE training_plans.id = training_plan_exercises.training_plan_id
          AND training_plans.owner_id = auth.uid()
        )
      );
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur Übungen zu ihren eigenen Trainingsplänen hinzufügen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plan_exercises_insert_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plan_exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plan_exercises_insert_owner" ON public.training_plan_exercises
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM training_plans
          WHERE training_plans.id = training_plan_exercises.training_plan_id
          AND training_plans.owner_id = auth.uid()
        )
      );
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur Übungen in ihren eigenen Trainingsplänen bearbeiten
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plan_exercises_update_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plan_exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plan_exercises_update_owner" ON public.training_plan_exercises
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM training_plans
          WHERE training_plans.id = training_plan_exercises.training_plan_id
          AND training_plans.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM training_plans
          WHERE training_plans.id = training_plan_exercises.training_plan_id
          AND training_plans.owner_id = auth.uid()
        )
      );
    $sql$;
  END IF;
END
$$;

-- Nutzer können nur Übungen aus ihren eigenen Trainingsplänen löschen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE polname = 'training_plan_exercises_delete_owner'
    AND schemaname = 'public'
    AND tablename = 'training_plan_exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "training_plan_exercises_delete_owner" ON public.training_plan_exercises
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM training_plans
          WHERE training_plans.id = training_plan_exercises.training_plan_id
          AND training_plans.owner_id = auth.uid()
        )
      );
    $sql$;
  END IF;
END
$$;

