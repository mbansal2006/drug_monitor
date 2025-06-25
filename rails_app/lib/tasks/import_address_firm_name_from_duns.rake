namespace :import do
  desc "Update missing addresses and firm names for locations using DECRS CSV"
  task update_location_addresses: :environment do
    require 'csv'

    csv_path = Rails.root.join("public/site_csvs/decrs_export.csv")
    unless File.exist?(csv_path)
      puts "❌ CSV not found at #{csv_path}"
      next
    end

    puts "📄 Loading DECRS data..."
    decrs_data = {}
    CSV.foreach(csv_path, headers: true) do |row|
      duns = row["duns_number"]&.strip
      next unless duns
      decrs_data[duns] = {
        firm_name: row["firm_name"]&.strip,
        address: row["address"]&.strip
      }
    end

    puts "🏗 Updating Locations..."
    updated = 0
    Location.where(address: nil).find_each do |location|
      duns = location.duns_number
      next unless decrs_data.key?(duns)
      location.update(
        firm_name: decrs_data[duns][:firm_name],
        address: decrs_data[duns][:address]
      )
      puts "✅ Updated #{duns} with address and firm name"
      updated += 1
    end

    puts "\n🎉 Done. Updated #{updated} Location records."
  end

  desc "Test update with only 10 records"
  task test_update_location_addresses: :environment do
    require 'csv'

    csv_path = Rails.root.join("public/site_csvs/decrs_export.csv")
    unless File.exist?(csv_path)
      puts "❌ CSV not found at #{csv_path}"
      next
    end

    puts "📄 Loading DECRS data..."
    decrs_data = {}
    CSV.foreach(csv_path, headers: true) do |row|
      duns = row["duns_number"]&.strip
      next unless duns
      decrs_data[duns] = {
        firm_name: row["firm_name"]&.strip,
        address: row["address"]&.strip
      }
    end

    puts "🧪 Testing on first 10 Locations with missing address..."
    updated = 0
    Location.where(address: nil).limit(10).each do |location|
      duns = location.duns_number
      next unless decrs_data.key?(duns)
      location.update(
        firm_name: decrs_data[duns][:firm_name],
        address: decrs_data[duns][:address]
      )
      puts "✅ Updated #{duns} with address and firm name"
      updated += 1
    end

    puts "\n✅ Test complete. Updated #{updated} Location records."
  end
end