# lib/tasks/import_spl_xmls.rake
namespace :import do
  desc "Download SPL XML files for all NDCs with SPL Set IDs"
  task download_spl_xmls: :environment do
    require 'net/http'
    require 'uri'
    require 'fileutils'

    folder = Rails.root.join("spl_xml_files")
    FileUtils.mkdir_p(folder)

    ndcs = Ndc.where.not(spl_set_id: [nil, ""])
    puts "📦 Found #{ndcs.count} NDCs with SPL Set IDs"

    ndcs.each do |ndc|
      next if ndc.spl_set_id.blank?

      url = URI("https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/#{ndc.spl_set_id}.xml")
      begin
        res = Net::HTTP.get_response(url)
        if res.is_a?(Net::HTTPSuccess)
          path = folder.join("#{ndc.id}.xml")
          File.open(path, "wb") { |f| f.write(res.body) }
          puts "✅ Saved #{ndc.spl_set_id} to #{path}"
        else
          puts "❌ Failed #{ndc.id} (#{ndc.spl_set_id}): #{res.code}"
        end
      rescue => e
        puts "❌ Error for #{ndc.id} (#{ndc.spl_set_id}): #{e.message}"
      end
    end

    puts "✅ Done!"
  end
end