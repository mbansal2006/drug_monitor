namespace :import do
  desc 'Import NDC-location links from CSV'
  task ndc_location_links: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_ndc_location_link.csv')
    puts "Loading #{path}"
    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        ndc = Ndc.find_by(ndc_code: row[:ndc_code])
        location = Location.find_by(location_id: row[:location_id])
        next unless ndc && location
        NdcLocationLink.create!(ndc: ndc, location: location)
      rescue => e
        puts "Error processing row: #{e.message}"
      end
    end
  end
end
