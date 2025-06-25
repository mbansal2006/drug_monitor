namespace :import do
  desc "Import all FDA-approved drugs from openFDA"
  task all_fda_drugs: :environment do
    require 'net/http'
    require 'json'

    base_url = URI("https://api.fda.gov/drug/ndc.json")
    limit = 100
    skip = 0
    total = nil

    puts "🚀 Starting import of FDA-approved drugs..."

    loop do
      url = URI("#{base_url}?limit=#{limit}&skip=#{skip}")
      res = Net::HTTP.get_response(url)

      break unless res.is_a?(Net::HTTPSuccess)

      body = JSON.parse(res.body)
      total ||= body.dig("meta", "results", "total")
      puts "📦 Processing #{skip + 1}–#{[skip + limit, total].min} of #{total}"

      body["results"].each do |entry|
        next unless entry["generic_name"] && entry["dosage_form"]

        drug_name = "#{entry["generic_name"]} #{entry["dosage_form"]}".squish.titleize
        Drug.find_or_create_by!(drug_name: drug_name)
      end

      skip += limit
      break if skip >= total
    end

    puts "✅ Done importing drugs!"
  end

  desc "Test import of 10 FDA-approved drugs only"
  task test_fda_drugs: :environment do
    require 'net/http'
    require 'json'

    puts "🧪 Testing import of 10 FDA-approved drugs..."

    url = URI("https://api.fda.gov/drug/ndc.json?limit=10")
    res = Net::HTTP.get_response(url)

    unless res.is_a?(Net::HTTPSuccess)
      puts "❌ Failed to fetch drugs: #{res.code}"
      exit
    end

    drugs = JSON.parse(res.body)["results"]

    drugs.each do |entry|
      next unless entry["generic_name"] && entry["dosage_form"]

      drug_name = "#{entry["generic_name"]} #{entry["dosage_form"]}".squish.titleize
      Drug.find_or_create_by!(drug_name: drug_name)
      puts "✅ Imported: #{drug_name}"
    end

    puts "✅ Test import complete!"
  end
end