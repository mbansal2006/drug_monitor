namespace :import do
  desc 'Import locations from CSV'
  task locations: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_locations_table.csv')
    puts "Loading #{path}"
    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        attrs = row.to_h.symbolize_keys
        Location.create!(attrs)
      rescue => e
        puts "Error processing row: #{e.message}"
      end
    end
  end
end
