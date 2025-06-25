stuff to do:

** phase out csv_drug_id

Step 1: Add temporary generic_name and dosage_form columns to ndcs (if not already there)

rails generate migration AddFieldsToNdcs generic_name:string
rails db:migrate

ndc.generic_name = entry["generic_name"]
ndc.dosage_form = entry["dosage_form"]

Step 2: Backfill drug_id for all NDCs based on reconstructed drug_name

Ndc.find_each do |ndc|
  next unless ndc.generic_name && ndc.dosage_form

  drug_name = "#{ndc.generic_name.strip.titleize} #{ndc.dosage_form.strip.titleize}"
  drug = Drug.find_by(drug_name: drug_name)

  if drug
    ndc.update!(drug_id: drug.id)
  else
    Rails.logger.warn "No matching drug for NDC #{ndc.ndc_code} (#{drug_name})"
  end
end

Once all drug_ids are correctly populated:
	•	✅ Delete csv_drug_id from ndcs
	•	✅ Optionally delete generic_name / dosage_form if you don’t need them anymore

rails generate migration RemoveCsvDrugIdFromNdcs csv_drug_id:integer
rails db:migrate

drug = Drug.find_by(drug_name: "Liraglutide Injection")
ndc.drug_id = drug.id


rails generate migration RemoveCsvColumnsFromDrugsAndNdcs
class RemoveCsvColumnsFromDrugsAndNdcs < ActiveRecord::Migration[7.1]
  def change
    remove_index :drugs, :csv_drug_id
    remove_column :drugs, :csv_drug_id

    remove_index :ndcs, :csv_drug_id
    remove_column :ndcs, :csv_drug_id

    remove_index :ndcs, :csv_ndc_id
    remove_column :ndcs, :csv_ndc_id
  end
end

** api drugs table

t.string drugname
	openfda
	generic_name + "" +dosage_form

** ndcs drugs table

t.integer drugid
	internal join
	From Drug.find_by(drug_name: "#{generic_name #{drug_dosage}")


# lib/tasks/link_ndcs_to_locations.rake

require 'open-uri'
require 'nokogiri'

namespace :link do
  desc "Create NDC-location links by matching DUNS numbers from SPL"
  task ndcs_to_locations: :environment do
    puts "🔗 Linking NDCs to Locations by DUNS number..."

    Ndc.where.not(spl_set_id: nil).find_each do |ndc|
      puts "🔍 Processing #{ndc.ndc_code} (#{ndc.spl_set_id})"

      begin
        url = "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/#{ndc.spl_set_id}.xml"
        xml = Nokogiri::XML(URI.open(url))

        xml.xpath("//business_operation").each do |op|
          next unless op.at_xpath("operation")&.text&.strip&.upcase == "MANUFACTURE"

          duns = op.at_xpath("duns_number")&.text&.strip
          next unless duns

          location = Location.find_by(duns_number: duns)
          unless location
            puts "⚠️ No location found with DUNS #{duns} for NDC #{ndc.ndc_code}"
            next
          end

          NdcLocationLink.find_or_create_by!(
            ndc_id: ndc.id,
            location_id: location.id
          )

          puts "✅ Linked NDC #{ndc.ndc_code} to location DUNS #{duns}"
        end

      rescue OpenURI::HTTPError => e
        puts "⚠️ Failed to fetch SPL for #{ndc.ndc_code}: #{e.message}"
      rescue => e
        puts "❌ Error for #{ndc.ndc_code}: #{e.class} - #{e.message}"
      end
    end

    puts "🎉 All done linking NDCs to Locations."
  end
end


** geocode

Location.where(country: "CAN").find_each do |loc|
  next if loc.latitude.present? && loc.longitude.present?

  # Example: "150 Signet Drive, Toronto, Ontario M9L 1T9, Canada (CAN)"
  cleaned = loc.address.to_s.gsub(/\s*\([^)]*\)/, "").strip
  match = cleaned.match(/^(.+?),\s*(.+?),\s*(\w{2,})\s+([A-Z]\d[A-Z] ?\d[A-Z]\d)/i)

  if match
    street = match[1]
    city = match[2]
    province = match[3]
    postal = match[4].upcase.gsub(/\s+/, "") # Remove spaces to normalize

    query = "#{street}, #{city}, #{province} #{postal}, Canada"

    coords = Geocoder.coordinates(query)

    if coords
      loc.latitude = coords[0]
      loc.longitude = coords[1]
      loc.save!
      puts "✅ Updated #{loc.id} → #{query} → #{coords}"
    else
      puts "❌ Geocode fail #{loc.id} → #{query}"
    end
  else
    puts "❌ Regex failed for #{loc.id} → #{cleaned}"
  end
end
