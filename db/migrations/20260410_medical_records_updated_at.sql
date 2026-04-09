-- Track when a medical record row was last edited (activity feed "Medical updated").
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE medical_records
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE medical_records
ALTER COLUMN updated_at SET DEFAULT now();
