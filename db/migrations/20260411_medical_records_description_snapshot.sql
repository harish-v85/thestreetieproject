-- Notes at insert time for the activity feed "Medical record added" line.
-- `description` stays the live editable field; updates must not change `description_snapshot`.
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS description_snapshot text;

UPDATE medical_records
SET description_snapshot = description
WHERE description_snapshot IS NULL;
