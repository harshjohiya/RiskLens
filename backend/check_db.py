import sqlite3

conn = sqlite3.connect('history.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print("Tables:", tables)

# Get users table schema if it exists
if 'users' in tables:
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    print("\nUsers table schema:")
    for col in columns:
        print(f"  {col[1]} {col[2]}")
else:
    print("\nusers table does not exist!")

conn.close()
