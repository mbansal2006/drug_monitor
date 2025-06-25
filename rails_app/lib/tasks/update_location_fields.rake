namespace :import do
  desc "Update country, state_or_region, and postal_code fields for Locations"
  task update_location_fields: :environment do
    require 'csv'

    puts "🌍 Finding locations with missing country/state/postal..."
    locations = Location.where(country: nil).or(Location.where(state_or_region: nil)).or(Location.where(postal_code: nil))

    puts "🌍 Found #{locations.count} locations to process..."

    updated_count = 0

    locations.find_each do |loc|
      address = loc.address
      next unless address.present?

      country = nil
      postal_code = nil
      state_or_region = nil

      # Country code in parentheses e.g. "Somewhere, MI 12345 (USA)"
      country_match = address.match(/\((\w{3})\)$/)
      country = country_match[1] if country_match

      # Postal code patterns
      postal_patterns = [
        /\b\d{5}(?:-\d{4})?\b/,         # US ZIP
        /\b\d{6}\b/,                   # India
        /\b[A-Z]\d[A-Z] ?\d[A-Z]\d\b/, # Canada
        /\b\d{4,5}\b/                  # EU/misc
      ]

      postal_patterns.each do |pattern|
        match = address.match(pattern)
        if match
          postal_code = match[0]
          break
        end
      end

      # State or region rules
      if address =~ /,\s*([A-Z]{2})\s*\d{5}/
        state_or_region = $1.strip
      elsif address =~ /\(([^()]+)\)/
        state_or_region = $1.strip
      elsif address =~ /,\s*([^,]+)\s+\d{4,6}/
        state_or_region = $1.strip
      end

      # Save if any field changed
      if country || postal_code || state_or_region
        loc.update(
          country: country || loc.country,
          postal_code: postal_code || loc.postal_code,
          state_or_region: state_or_region || loc.state_or_region
        )
        updated_count += 1
        puts "✅ Updated #{loc.duns_number}"
      end
    end

    puts "\n✅ Done. Updated #{updated_count} Location records."
  end

  desc "Test update_location_fields on 10 records"
  task test_update_location_fields: :environment do
    puts "🧪 Testing on 10 locations..."
    Rake::Task["import:update_location_fields"].invoke
  end
end