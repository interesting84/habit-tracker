-- Delete all related data first
DELETE FROM "HabitCompletion";
DELETE FROM "UserBadge";
DELETE FROM "Habit";
DELETE FROM "Session";
DELETE FROM "Account";
-- Finally delete all users
DELETE FROM "User"; 