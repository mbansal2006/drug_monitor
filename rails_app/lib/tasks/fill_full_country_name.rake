# lib/tasks/fill_full_country_name.rake

namespace :locations do
  desc "Fill full_country_name for locations missing it using ISO3 code"
  task fill_country_names: :environment do
    require 'countries'

    updated = 0
    skipped = 0

    Location.where(full_country_name: [nil, ""]).find_each do |location|
      if location.country.blank?
        puts "Skipped Location #{location.id}: blank ISO3 code"
        skipped += 1
        next
      end

      begin
        country = ISO3166::Country.find_country_by_alpha3(location.country)
        if country
          if location.full_country_name.blank?  # ✅ safeguard manual fills
            location.full_country_name = country.translations['en'] || country.name
            location.save!
            updated += 1
            puts "Updated Location #{location.id}: #{location.full_country_name}"
          else
            puts "Skipped Location #{location.id}: already filled"
          end
        else
          puts "Could not find country for ISO3: #{location.country} (Location ID #{location.id})"
        end
      rescue => e
        puts "Error updating Location #{location.id}: #{e.message}"
      end
    end

    puts "\nDone. Updated #{updated} locations. Skipped #{skipped} due to blank ISO3 codes."
  end
end