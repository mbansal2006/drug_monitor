namespace :locations do
  desc "Populate related_entities for each location"
  task populate_related_entities: :environment do
    Location.find_each do |location|
      ndcs = location.ndcs.includes(:drug, :manufacturer)

      entities = ndcs.flat_map do |ndc|
        [
          ndc.ndc_code,
          ndc.proprietary_name,
          ndc.manufacturer_name,
          ndc.drug&.drug_name
        ]
      end.compact.map(&:downcase).uniq

      location.update!(related_entities: entities.join(', '))
    end

    puts "Updated related_entities for all locations."
  end
end