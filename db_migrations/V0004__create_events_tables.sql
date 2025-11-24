-- Создание таблицы для мероприятий
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  event_number VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  location VARCHAR(500) NOT NULL,
  event_type VARCHAR(20),
  event_level VARCHAR(50),
  sport VARCHAR(100) NOT NULL,
  description TEXT,
  organizer VARCHAR(500) NOT NULL,
  max_participants INTEGER DEFAULT 50,
  max_spectators INTEGER,
  participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming',
  approved BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_by VARCHAR(255),
  result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для документов мероприятий
CREATE TABLE IF NOT EXISTS event_documents (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для медиафайлов мероприятий
CREATE TABLE IF NOT EXISTS event_media (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  type VARCHAR(20) NOT NULL,
  name VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для обязательных документов
CREATE TABLE IF NOT EXISTS event_required_documents (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  doc_type VARCHAR(50) NOT NULL,
  doc_name VARCHAR(500) NOT NULL,
  uploaded BOOLEAN DEFAULT FALSE,
  url TEXT,
  file_name VARCHAR(500),
  uploaded_at TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_events_approved ON events(approved);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_submitted_by ON events(submitted_by);
CREATE INDEX IF NOT EXISTS idx_event_documents_event_id ON event_documents(event_id);
CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_event_required_docs_event_id ON event_required_documents(event_id);