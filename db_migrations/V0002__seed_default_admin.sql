INSERT INTO users (login, password_hash, full_name, role)
VALUES ('admin', 'admin123', 'Администратор', 'admin')
ON CONFLICT (login) DO NOTHING;
