namespace :import do
  desc 'Import locations from CSV'
  task locations: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_locations_table.csv')
    puts "Loading #{path}"
    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        attrs = row.to_h.slice(
          :location_id, :address, :country, :state_or_region, :postal_code,
          :full_country_name, :latitude, :longitude, :duns_number, :risk_score,
          :oai_count, :engages_in_dumping, :has_bis_ns1, :has_bis_rs1,
          :has_export_ban_history, :is_five_eyes, :is_mnna, :is_nato,
          :is_oecd, :is_quad, :ofac_sanctioned, :quality_risk_flag,
          :taa_compliant
        )

        # Clean up types
        attrs[:latitude] = attrs[:latitude].to_f if attrs[:latitude]
        attrs[:longitude] = attrs[:longitude].to_f if attrs[:longitude]
        attrs[:risk_score] = attrs[:risk_score].to_i if attrs[:risk_score]
        attrs[:oai_count] = attrs[:oai_count].to_i if attrs[:oai_count]

        # Convert boolean strings to real booleans
        Location.columns.each do |col|
          if col.type == :boolean && attrs.key?(col.name.to_sym)
            val = attrs[col.name.to_sym].to_s.downcase
            attrs[col.name.to_sym] = val == 'true'
          end
        end

        Location.create!(attrs)
        puts "Imported location_id #{attrs[:location_id]}"
      rescue => e
        puts "Error processing row: #{e.message}"
      end
    end
  end
end