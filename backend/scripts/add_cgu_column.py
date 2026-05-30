import sqlite3

db_path = 'backend.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get existing columns
cur.execute("PRAGMA table_info(users)")
cols = [row[1] for row in cur.fetchall()]

if 'cgu_accepted' not in cols:
    print('Adding column cgu_accepted')
    cur.execute("ALTER TABLE users ADD COLUMN cgu_accepted BOOLEAN DEFAULT 0;")
    conn.commit()
    print('Column cgu_accepted added successfully')
else:
    print('Column cgu_accepted already exists')

conn.close()
