namespace :import do
  desc 'Import manufacturers from CSV'
  task manufacturers: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_manufacturers_table.csv')
    puts "Loading #{path}"
    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        Manufacturer.create!(row.to_h.slice(:manufacturer_name, :temp_property))
      rescue => e
        puts "Error processing row: #{e.message}"
      end
    end
  end
end
