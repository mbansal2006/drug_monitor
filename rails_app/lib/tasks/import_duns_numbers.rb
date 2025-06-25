namespace :import do
  desc "Parse SPL XMLs for DUNS and create Location entries"
  task parse_spl_xmls: :environment do
    require 'nokogiri'

    folder_path = Rails.root.join("spl_xml_files")
    xml_files = Dir.glob(folder_path.join("*.xml"))

    puts "🔍 Found #{xml_files.size} SPL XML files to parse..."

    created_locations = 0
    linked_ndcs = 0

    xml_files.each do |file_path|
      begin
        file = File.open(file_path)
        doc = Nokogiri::XML(file)
        file.close

        set_id_tag = doc.at_xpath("//*[local-name()='setId']")
        set_id = set_id_tag ? set_id_tag["root"] : nil
        next unless set_id

        ndc = Ndc.find_by(spl_set_id: set_id)
        unless ndc
          puts "⚠️ No NDC found for SPL Set ID #{set_id}"
          next
        end

        found_any = false

        doc.xpath("//*[local-name()='assignedOrganization' or local-name()='assignedEntity']").each do |org|
          id_tag = org.at_xpath(".//*[local-name()='id'][@extension]")
          next unless id_tag

          duns_number = id_tag["extension"]

          manufacture_code = org.at_xpath(
            ".//*[local-name()='performance']/*[local-name()='actDefinition']/*[local-name()='code'][translate(@displayName, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')='MANUFACTURE']"
          )

          next unless manufacture_code

          location = Location.find_or_create_by!(duns_number: duns_number) do |loc|
            loc.address = nil
            loc.country = nil
            loc.state_or_region = nil
            loc.postal_code = nil
            loc.full_country_name = nil
            loc.risk_score = nil
            loc.ofac_sanctioned = false
            loc.engages_in_dumping = false
            loc.has_bis_ns1 = false
            loc.taa_compliant = nil
            loc.is_nato = nil
            loc.is_five_eyes = nil
            loc.is_oecd = nil
            loc.is_quad = nil
          end

          NdcLocationLink.find_or_create_by!(ndc_id: ndc.id, location_id: location.id)

          puts "✅ Linked DUNS #{duns_number} to NDC #{ndc.ndc_code}"
          created_locations += 1
          linked_ndcs += 1
          found_any = true
        end

        puts "❌ No MANUFACTURE establishments in #{File.basename(file_path)}" unless found_any

      rescue => e
        puts "❌ Error processing #{File.basename(file_path)}: #{e.message}"
      end
    end

    puts "\n✅ Done. Created/linked #{created_locations} location records for #{linked_ndcs} NDCs."
  end

  desc "Test SPL XML parsing on 5 files"
  task test_parse_spl_xmls: :environment do
    require 'nokogiri'

    folder_path = Rails.root.join("spl_xml_files")
    xml_files = Dir.glob(folder_path.join("*.xml")).first(5)

    puts "🧪 Testing SPL XML parsing on #{xml_files.size} files..."

    xml_files.each do |file_path|
      begin
        file = File.open(file_path)
        doc = Nokogiri::XML(file)
        file.close

        set_id_tag = doc.at_xpath("//*[local-name()='setId']")
        set_id = set_id_tag ? set_id_tag["root"] : nil
        puts "🔍 SPL Set ID: #{set_id || 'None'}"

        ndc = Ndc.find_by(spl_set_id: set_id)
        if ndc
          puts "✅ Found NDC: #{ndc.ndc_code}"
        else
          puts "⚠️ No NDC for SPL Set ID #{set_id}"
        end

        found = false

        doc.xpath("//*[local-name()='assignedOrganization' or local-name()='assignedEntity']").each do |org|
          id_tag = org.at_xpath(".//*[local-name()='id'][@extension]")
          next unless id_tag

          duns_number = id_tag["extension"]

          manufacture_code = org.at_xpath(
            ".//*[local-name()='performance']/*[local-name()='actDefinition']/*[local-name()='code'][translate(@displayName, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')='MANUFACTURE']"
          )
          next unless manufacture_code

          puts "🏭 DUNS: #{duns_number}"
          found = true
        end

        puts "❌ No manufacturing site found" unless found

      rescue => e
        puts "❌ Error processing #{File.basename(file_path)}: #{e.message}"
      end
    end

    puts "\n🧪 Test complete."
  end
end