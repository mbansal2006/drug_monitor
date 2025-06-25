namespace :geocode do
  desc "Geocode all locations, even ones with existing coordinates"
  task locations: :environment do
    puts "🌍 Starting full geocode task on all locations..."

    failed = []

    Location.where.not(address: [nil, ""])
            .where.not(country: [nil, ""])
            .find_each do |loc|

      base_address = loc.address.to_s.gsub(/\s*\([^)]*\)/, "").strip
      country = loc.full_country_name.presence || loc.country
      country = nil if country =~ /^[A-Z]{3}$/ # skip ISO like "USA", "CAN"
      state = loc.state_or_region.to_s.gsub(/\([^)]*\)/, "").strip.presence
      postal = loc.postal_code.to_s.strip.presence

      query_parts = []
      query_parts << base_address unless base_address.blank?
      query_parts << state unless state.blank? || base_address.include?(state)
      query_parts << postal unless postal.blank? || base_address.include?(postal)
      query_parts << country unless country.blank? || base_address.include?(country)

      full_query = query_parts.compact.uniq.join(', ').strip
      next if full_query.blank?

      puts "📍 Trying #{loc.id} → #{full_query}"

      strategies = [
        full_query,
        [postal, state, country].compact.uniq.join(', '),
        [state, country].compact.uniq.join(', '),
        country
      ].reject(&:blank?).map { |q| q.gsub(/\s+/, " ").gsub(/,\s*,/, ",").strip }.uniq

      coords = nil
      strategies.each do |query|
        coords = Geocoder.coordinates(query)
        break if coords
      end

      if coords
        lat, lon = coords
        lat += rand(-0.0003..0.0003)
        lon += rand(-0.0003..0.0003)
        loc.latitude = lat
        loc.longitude = lon
        loc.save!
        puts "✅ Updated #{loc.id}: #{[lat, lon]}"
      else
        puts "❌ Failed to geocode #{loc.id}"
        failed << loc.id
      end
    end

    puts "\n✅ Geocoding complete. Failed to geocode #{failed.size} locations: #{failed.take(10).join(', ')}..."
  end
end