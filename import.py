import json
import mysql.connector
import os

# Current timestamp and username as specified
CURRENT_TIMESTAMP = "2025-04-27 17:23:00"  # Updated timestamp
CURRENT_USER = "souhail4real"

# Database connection parameters
DB_HOST = "localhost"
DB_NAME = "freelancima"
DB_USER = "root"
DB_PASSWORD = ""

def create_connection():
    """Create a database connection"""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return connection
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def load_json_data(filename="freelancers_with_metadata.json"):  # Fixed typo in filename
    """Load data from the JSON file"""
    try:
        if not os.path.exists(filename):
            print(f"❌ Error: JSON file '{filename}' not found.")
            # Try fallback to regular JSON file
            if os.path.exists("freelancers.json"):
                print(f"⚠️ Trying to use freelancers.json as fallback...")
                filename = "freelancers.json"
            else:
                return None
            
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Handle both new and old JSON formats
        if "categories" in data:
            # New format with metadata
            categories_data = data["categories"]
        else:
            # Old format without metadata
            categories_data = data
            
        print(f"✅ Successfully loaded data from {filename}")
        return categories_data
    except Exception as e:
        print(f"❌ Error loading JSON data: {e}")
        return None

def import_to_database(connection, categorized_data):
    """Import data to MySQL database without duplicates"""
    if not connection:
        print("❌ Database connection failed. Data will not be imported to database.")
        return False
    
    cursor = connection.cursor()
    
    try:
        # Begin transaction
        connection.start_transaction()
        
        # Get existing profile links to avoid duplicates
        cursor.execute("SELECT profile_link FROM freelancers")
        existing_links = {row[0] for row in cursor.fetchall()}
        
        added_count = 0
        skipped_count = 0
        print("🔄 Importing new freelancers to database...")
        
        # Process each category
        for category_slug, freelancers in categorized_data.items():
            # Process each freelancer in this category
            for freelancer in freelancers:
                # Check if this freelancer already exists
                if freelancer["profile_link"] in existing_links:
                    print(f"  ⏩ Skipping existing freelancer: {freelancer['username']}")
                    skipped_count += 1
                    continue
                
                # Insert new freelancer with category as a column
                insert_query = """
                INSERT INTO freelancers 
                (username, profile_link, profile_image, rating, reviews, short_description, price, category, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                cursor.execute(insert_query, (
                    freelancer["username"],
                    freelancer["profile_link"],
                    freelancer["profile_image"],
                    float(freelancer["rating"]),
                    int(freelancer["reviews"]) if freelancer["reviews"].isdigit() else 0,
                    freelancer["short_description"],
                    float(freelancer["price"]),
                    category_slug,  # Store category directly as a string
                    CURRENT_TIMESTAMP
                ))
                
                # Add to existing links to prevent duplicates in current batch
                existing_links.add(freelancer["profile_link"])
                
                added_count += 1
                print(f"  ✓ Added new freelancer: {freelancer['username']} (Category: {category_slug})")
        
        # Add metadata entry
        metadata_query = """
        INSERT INTO metadata 
        (last_updated, updated_by, record_count)
        VALUES (%s, %s, %s)
        """
        
        cursor.execute(metadata_query, (CURRENT_TIMESTAMP, CURRENT_USER, added_count))
        
        # Commit changes
        connection.commit()
        print(f"✅ Successfully imported {added_count} new freelancers to database")
        print(f"   Skipped {skipped_count} existing freelancers")
        return True
        
    except Exception as e:
        connection.rollback()
        print(f"❌ Error importing data to database: {e}")
        return False
    finally:
        cursor.close()

def import_process():
    """Main function to import data from JSON to database"""
    # Create database connection
    print("🔌 Connecting to database...")
    connection = create_connection()
    
    if not connection:
        print("❌ Cannot proceed without database connection.")
        return False
    
    # Load JSON data
    print("📂 Loading JSON data...")
    categorized_data = load_json_data()
    
    if not categorized_data:
        print("❌ Failed to load JSON data. Cannot proceed with import.")
        return False
    
    # Import data to database
    print("\n=== Importing to Database ===")
    success = import_to_database(connection, categorized_data)
    
    # Close database connection
    if connection.is_connected():
        print("🔌 Closing database connection...")
        connection.close()
    
    return success

# Main execution
if __name__ == "__main__":
    print("=== FreeLanci.ma Minimal Data Importer ===")
    print(f"Current user: {CURRENT_USER}")
    print(f"Timestamp: {CURRENT_TIMESTAMP}")
    print("=" * 50)
    
    
    # Run the importer
    success = import_process()
    
    if success:
        print("\n✅ Import completed successfully!")
        print("   Database has been updated with new freelancers.")
    else:
        print("\n❌ Import failed. Please check the logs for details.")
    
    print("\nScript execution completed.")