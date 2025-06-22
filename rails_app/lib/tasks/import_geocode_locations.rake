namespace :import do
  desc 'Geocode Location records with missing coordinates'
  task geocode_locations: :environment do
    scope = Location.where.not(address: [nil, '']).where("latitude IS NULL OR longitude IS NULL")
    scope.find_each do |location|
      begin
        result = Geocoder.search(location.address).first
        if result
          location.update(latitude: result.latitude, longitude: result.longitude)
          puts "✅ #{location.id} - #{location.address}: (#{result.latitude}, #{result.longitude})"
        else
          puts "⚠️ #{location.id} - #{location.address}: no results"
        end
      rescue => e
        puts "❌ #{location.id} - #{location.address}: #{e.message}"
      end
    end
  end
end
