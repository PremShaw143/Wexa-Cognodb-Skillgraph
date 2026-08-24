from database import verify_connection, close_driver

try:
    verify_connection()
    print("✅ CognoDB connection successful!")

except Exception as e:
    print("❌ CognoDB connection failed!")
    print(e)

finally:
    close_driver()