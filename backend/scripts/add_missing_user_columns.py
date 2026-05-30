import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent.parent / "backend.db"
conn = sqlite3.connect(str(db_path))
cur = conn.cursor()

cur.execute("PRAGMA table_info(users);")
cols = [r[1] for r in cur.fetchall()]

if 'study_level' not in cols:
    print('Adding column study_level')
    cur.execute("ALTER TABLE users ADD COLUMN study_level TEXT;")
else:
    print('Column study_level already exists')

if 'institution' not in cols:
    print('Adding column institution')
    cur.execute("ALTER TABLE users ADD COLUMN institution TEXT;")
else:
    print('Column institution already exists')

conn.commit()
conn.close()
print('Done')
