-- Create admin user
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'Admin', 
  'admin', 
  '$2a$10$xi/r.oDiVwcZa4Mu9/.tGOOy.uiupIuPAVopFDsnfXP1Ybgscvuw.', 
  'admin', 
  NOW(), 
  NOW()
) 
ON CONFLICT (email) DO NOTHING;

SELECT * FROM "User";
