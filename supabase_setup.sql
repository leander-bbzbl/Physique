-- ============================================
-- Supabase Datenbank Setup für Physique App
-- ============================================

-- Übungen Tabelle
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainingspläne Tabelle
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainingsplan-Übungen Verknüpfung
CREATE TABLE IF NOT EXISTS training_plan_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL,
  rest_seconds INTEGER,
  "order" INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Row Level Security aktivieren
-- ============================================

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_exercises ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies für exercises Tabelle
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE polname = 'Allow public access'
      AND schemaname = 'public'
      AND tablename = 'exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Allow public access" ON public.exercises
      FOR ALL
      USING (true)
      WITH CHECK (true);
    $sql$;
  END IF;
END
$$;

-- ============================================
-- Policies für training_plans Tabelle
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE polname = 'Allow public access'
      AND schemaname = 'public'
      AND tablename = 'training_plans'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Allow public access" ON public.training_plans
      FOR ALL
      USING (true)
      WITH CHECK (true);
    $sql$;
  END IF;
END
$$;

-- ============================================
-- Policies für training_plan_exercises Tabelle
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE polname = 'Allow public access'
      AND schemaname = 'public'
      AND tablename = 'training_plan_exercises'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Allow public access" ON public.training_plan_exercises
      FOR ALL
      USING (true)
      WITH CHECK (true);
    $sql$;
  END IF;
END
$$;

-- ============================================
-- Indexes für bessere Performance (optional)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_training_plan_exercises_plan_id 
  ON training_plan_exercises(training_plan_id);

CREATE INDEX IF NOT EXISTS idx_training_plan_exercises_exercise_id 
  ON training_plan_exercises(exercise_id);

CREATE INDEX IF NOT EXISTS idx_training_plans_is_active 
  ON training_plans(is_active);

