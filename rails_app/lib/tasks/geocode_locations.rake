# lib/tasks/geocode_locations.rake

namespace :geocode do
  desc "Geocode all locations with an address"
  task locations: :environment do
    failed = []

    Location.where.not(address: [nil, ""]).find_each do |location|
      next if location.latitude.present? && location.longitude.present?

      query = [
        location.state_or_region,
        location.postal_code,
        location.full_country_name.presence || location.country
      ].compact.join(', ')

      results = Geocoder.search(query)
      if coords = results.first&.coordinates
        location.latitude, location.longitude = coords
        location.save!
        puts "Geocoded #{location.id}: #{coords}"
      else
        puts "Failed to geocode #{location.id} (#{query})"
        failed << location.id
      end
    end

    puts "\nDone. Failed to geocode #{failed.count} locations: #{failed.join(', ')}"
  end
end