-- Fix any NULL values in xp and level columns
UPDATE "User"
SET xp = COALESCE(xp, 0),
    level = COALESCE(level, 1)
WHERE xp IS NULL OR level IS NULL; 