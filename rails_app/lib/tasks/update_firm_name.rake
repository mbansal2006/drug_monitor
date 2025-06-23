# lib/tasks/update_firm_name.rake

namespace :locations do
  desc "Update firm_name for each location from site_locations_table.csv"
  task update_firm_name: :environment do
    require 'csv'

    csv_path = Rails.root.join('public', 'site_csvs', 'site_locations_table.csv')
    unless File.exist?(csv_path)
      puts "CSV file not found at #{csv_path}"
      next
    end

    updated = 0
    missing = 0

    CSV.foreach(csv_path, headers: true) do |row|
      location = Location.find_by(csv_location_id: row['location_id'])

      if location
        location.update(firm_name: row['firm_name'])
        updated += 1
      else
        missing += 1
        puts "No matching location for location_id #{row['location_id']}"
      end
    end

    puts "Done. Updated #{updated} locations. #{missing} unmatched."
  end
end