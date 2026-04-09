-- Add optional death-year estimate for deceased dogs.
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS estimated_death_year integer;

-- Guardrail: keep year in a sensible range when provided.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dogs_estimated_death_year_check'
      AND conrelid = 'public.dogs'::regclass
  ) THEN
    ALTER TABLE public.dogs
    ADD CONSTRAINT dogs_estimated_death_year_check
    CHECK (
      estimated_death_year IS NULL
      OR (
        estimated_death_year >= 1980
        AND estimated_death_year <= EXTRACT(YEAR FROM now())::integer
      )
    );
  END IF;
END
$$;
