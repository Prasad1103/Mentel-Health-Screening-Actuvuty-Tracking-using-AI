import sqlite3
import os
import pathlib

def clean_database():
    base_dir = pathlib.Path(__file__).resolve().parent.parent
    db_path = base_dir / "database" / "beproject.db"
    
    if not db_path.exists():
        print(f"[ERROR] Database file not found at: {db_path}")
        return
        
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Tables that are no longer used by the new consolidated Result schema
    unused_tables = [
        "analysis_sessions",
        "modality_results",
        "explanations",
        "recommendations",
        "user_preferences",
        "audit_logs"
    ]
    
    # Get current tables list
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    existing_tables = {row[0] for row in cursor.fetchall()}
    
    print("\nStarting database cleanup...")
    dropped_count = 0
    for table in unused_tables:
        if table in existing_tables:
            print(f" - Dropping obsolete table: '{table}'")
            cursor.execute(f"DROP TABLE IF EXISTS {table};")
            dropped_count += 1
        else:
            print(f" - Table '{table}' does not exist or has already been dropped")
            
    if dropped_count > 0:
        print("\nCommitting changes...")
        conn.commit()
        
        print("Running database VACUUM to reclaim disk space...")
        cursor.execute("VACUUM;")
        conn.commit()
        print("[SUCCESS] Database optimized and space reclaimed.")
    else:
        print("\nNo obsolete tables found. Database is already clean.")
        
    # Verify remaining tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    remaining_tables = [row[0] for row in cursor.fetchall()]
    print("\nActive tables remaining in database:")
    for t in remaining_tables:
        print(f" - {t}")
        
    conn.close()

if __name__ == "__main__":
    clean_database()
