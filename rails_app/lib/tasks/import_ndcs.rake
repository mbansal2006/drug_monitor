namespace :import do
  desc 'Import NDCs from CSV'
  task ndcs: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_ndcs_table.csv')
    puts "Loading #{path}"

    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        drug = Drug.find_by(id: row[:drug_id])
        manufacturer = Manufacturer.find_or_create_by!(manufacturer_name: row[:manufacturer_name])

        attrs = row.to_h.slice(:ndc_code, :proprietary_name, :drug_dosage, :drug_strength)
        attrs[:drug] = drug if drug
        attrs[:manufacturer] = manufacturer

        if drug.nil?
          puts "Skipping NDC #{row[:ndc_code]}: Drug ID #{row[:drug_id]} not found"
          next
        end

        Ndc.create!(attrs)
        puts "Imported NDC #{row[:ndc_code]}"
      rescue => e
        puts "Error processing row for NDC #{row[:ndc_code]}: #{e.message}"
      end
    end
  end
end