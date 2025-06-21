namespace :import do
  desc 'Import NDC-location links from CSV'
  task ndc_location_links: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_ndc_location_link.csv')
    puts "Loading #{path}"
    
    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        ndc = Ndc.find_by(ndc_code: row[:ndc_code])
        location = Location.find_by(location_id: row[:location_id].to_i)

        if ndc.nil?
          puts "Skipping: NDC not found for #{row[:ndc_code]}"
          next
        end

        if location.nil?
          puts "Skipping: Location not found for ID #{row[:location_id]}"
          next
        end

        NdcLocationLink.create!(ndc: ndc, location: location)
        puts "Linked NDC #{ndc.ndc_code} to location_id #{location.location_id}"
      rescue => e
        puts "Error processing row: #{e.message}"
      end
    end
  end
end