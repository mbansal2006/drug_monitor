#!/usr/bin/env ruby

require 'sqlite3'

# Remove existing database
File.delete('db/production.sqlite3') if File.exist?('db/production.sqlite3')

# Create new database and load dump
db = SQLite3::Database.new('db/production.sqlite3')

puts "Loading SQL dump..."
sql_content = File.read('public/db_dump.sql')

# Execute the entire dump as a batch
begin
  db.execute_batch(sql_content)
  puts "SQL dump loaded successfully!"
  
  # Verify data was loaded
  puts "Verification:"
  puts "- Manufacturers: #{db.execute('SELECT COUNT(*) FROM manufacturers')[0][0]}"
  puts "- Locations: #{db.execute('SELECT COUNT(*) FROM locations')[0][0]}" rescue puts "- Locations: table not found"
  puts "- Drugs: #{db.execute('SELECT COUNT(*) FROM drugs')[0][0]}" rescue puts "- Drugs: table not found"
  puts "- NDCs: #{db.execute('SELECT COUNT(*) FROM ndcs')[0][0]}" rescue puts "- NDCs: table not found"
  
rescue SQLite3::Exception => e
  puts "Error loading dump: #{e.message}"
ensure
  db.close
end

puts "Done!"