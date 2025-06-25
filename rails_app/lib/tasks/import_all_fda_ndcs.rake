namespace :import do
  desc "Import NDCs from openFDA API"
  task all_ndcs: :environment do
    require 'net/http'
    require 'json'

    base_url = "https://api.fda.gov/drug/ndc.json"
    limit = 100
    skip = 0
    total = nil

    puts "🚀 Starting NDC import..."

    loop do
      url = URI("#{base_url}?limit=#{limit}&skip=#{skip}")
      res = Net::HTTP.get_response(url)

      unless res.is_a?(Net::HTTPSuccess)
        puts "❌ Failed to fetch data at skip=#{skip}"
        break
      end

      body = JSON.parse(res.body)
      total ||= body.dig("meta", "results", "total")
      puts "📦 Processing NDCs #{skip + 1}–#{[skip + limit, total].min} of #{total}"

      body["results"].each do |entry|
        begin
          generic_name = entry["generic_name"]&.squish
          dosage_form = entry["dosage_form"]&.squish&.upcase
          drug_name = "#{generic_name} #{dosage_form}".squish.titleize

          drug = Drug.find_by(drug_name: drug_name)

          unless drug
            puts "⚠️ No matching drug for #{drug_name}"
            next
          end

          manufacturer_name = entry["labeler_name"]&.squish
          manufacturer = Manufacturer.find_or_create_by!(manufacturer_name: manufacturer_name)

          ndc_code = entry["product_ndc"]
          proprietary_name = entry["brand_name"]
          drug_strength = entry["active_ingredients"]&.first&.dig("strength")
          spl_set_id = entry.dig("openfda", "spl_set_id")&.first

          ndc = Ndc.find_or_initialize_by(ndc_code: ndc_code)
          ndc.update!(
            drug_id: drug.id,
            manufacturer_id: manufacturer.id,
            proprietary_name: proprietary_name,
            drug_dosage: dosage_form,
            drug_strength: drug_strength,
            spl_set_id: spl_set_id,
            generic_name: generic_name
          )

          puts "✅ Imported NDC #{ndc_code} for #{proprietary_name} (#{drug_name})"
        rescue => e
          puts "❌ Error processing NDC #{entry['product_ndc']}: #{e.message}"
        end
      end

      skip += limit
      break if skip >= total
    end

    puts "✅ Done importing all NDCs!"
  end

  desc "Test NDC import with limit 10"
  task test_ndcs: :environment do
    require 'net/http'
    require 'json'

    puts "🧪 Testing NDC import..."

    url = URI("https://api.fda.gov/drug/ndc.json?limit=10")
    res = Net::HTTP.get_response(url)
    abort("❌ Failed to fetch data") unless res.is_a?(Net::HTTPSuccess)

    body = JSON.parse(res.body)

    body["results"].each do |entry|
      begin
        generic_name = entry["generic_name"]&.squish
        dosage_form = entry["dosage_form"]&.squish&.upcase
        drug_name = "#{generic_name} #{dosage_form}".squish.titleize

        drug = Drug.find_by(drug_name: drug_name)
        unless drug
          puts "⚠️ No matching drug for #{drug_name}"
          next
        end

        manufacturer_name = entry["labeler_name"]&.squish
        manufacturer = Manufacturer.find_or_create_by!(manufacturer_name: manufacturer_name)

        ndc_code = entry["product_ndc"]
        proprietary_name = entry["brand_name"]
        drug_strength = entry.dig("active_ingredients", 0, "strength")
        spl_set_id = entry.dig("openfda", "spl_set_id", 0)

        ndc = Ndc.find_or_initialize_by(ndc_code: ndc_code)
        ndc.update!(
          drug_id: drug.id,
          manufacturer_id: manufacturer.id,
          proprietary_name: proprietary_name,
          drug_dosage: dosage_form,
          drug_strength: drug_strength,
          spl_set_id: spl_set_id,
          generic_name: generic_name
        )

        puts "✅ Test NDC #{ndc_code} imported: #{proprietary_name} (#{drug_name})"
      rescue => e
        puts "❌ Error processing NDC #{entry['product_ndc']}: #{e.message}"
      end
    end

    puts "✅ Test complete."
  end
end