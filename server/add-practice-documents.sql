CREATE TABLE IF NOT EXISTS "PracticeDocument" (
  "id"       SERIAL PRIMARY KEY,
  "lessonId" INTEGER NOT NULL REFERENCES "Lesson"("id") ON DELETE CASCADE,
  "name"     TEXT NOT NULL,
  "url"      TEXT NOT NULL,
  "size"     TEXT
);
