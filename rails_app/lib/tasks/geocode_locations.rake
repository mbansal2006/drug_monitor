namespace :geocode do
  desc 'Geocode missing lat/lng for locations'
  task locations: :environment do
    Location.where(latitude: [nil, 0], longitude: [nil, 0]).find_each do |location|
      result = Geocoder.search(location.full_location_string).first
      if result
        location.update(latitude: result.latitude, longitude: result.longitude)
        puts "Geocoded #{location.id}"
      else
        puts "Failed to geocode #{location.id}"
      end
    end
  end
end
