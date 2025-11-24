-- Создание администратора
-- Пароль: admin123, хэш SHA256
INSERT INTO users (email, password, name, phone, user_type, approved, submitted_at) 
VALUES (
  'admin@system.local',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Администратор',
  '',
  'individual',
  true,
  NOW()
);