namespace :import do
  desc 'Import drugs from CSV with deduplication'
  task drugs: :environment do
    require 'csv'
    path = Rails.root.join('public', 'site_csvs', 'site_drugs_table.csv')
    puts "Loading #{path}"
    CSV.foreach(path, headers: true, header_converters: :symbol) do |row|
      begin
        attrs = row.to_h.slice(:drug_name, :fda_essential, :reason, :shortage_end, :shortage_start, :therapeutic_categories, :update_date, :update_type)
        attrs[:csv_drug_id] = row[:drug_id].to_i if row[:drug_id]
        attrs[:fda_essential] = attrs[:fda_essential].to_s.downcase == 'true'
        existing = Drug.find_by(drug_name: attrs[:drug_name], shortage_start: attrs[:shortage_start])
        if existing
          puts "Skipping duplicate #{attrs[:drug_name]}"
          next
        end
        Drug.create!(attrs)
        puts "Imported #{attrs[:drug_name]}"
      rescue => e
        puts "Error processing row: #{e.message}"
      end
    end
  end
end
