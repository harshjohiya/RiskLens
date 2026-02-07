"""Test script to debug auth functions"""
import sys
sys.path.insert(0, '.')

from app.auth_utils import hash_password, create_access_token
from app.storage import create_user, get_user_by_email

# Test password hashing
print("Testing password hashing...")
try:
    password = "password123"
    hashed = hash_password(password)
    print(f"✓ Password hashing works: {hashed[:50]}...")
except Exception as e:
    print(f"✗ Password hashing  failed: {e}")
    import traceback
    traceback.print_exc()

# Test user creation
print("\nTesting user creation...")
try:
    test_email = "test@example.com"
    
    # Check if user exists and delete if necessary
    existing = get_user_by_email(test_email)
    if existing:
        import sqlite3
        conn = sqlite3.connect('history.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email = ?", (test_email,))
        conn.commit()
        conn.close()
        print(f"  Deleted existing test user")
    
    user_id = create_user(
        email=test_email,
        password_hash=hashed,
        name="Test User"
    )
    print(f"✓ User creation works: {user_id}")
except Exception as e:
    print(f"✗ User creation failed: {e}")
    import traceback
    traceback.print_exc()

# Test JWT creation
print("\nTesting JWT creation...")
try:
    token = create_access_token(user_id="test-id", email="test@example.com")
    print(f"✓ JWT creation works: {token[:50]}...")
except Exception as e:
    print(f"✗ JWT creation failed: {e}")
    import traceback
    traceback.print_exc()

print("\n✓ All auth functions working!")
