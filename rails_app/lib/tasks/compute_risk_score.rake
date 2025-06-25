# lib/tasks/compute_risk_score.rake
namespace :location do
  desc "Compute and update risk_score and policy flags for all locations"
  task compute_risk_score: :environment do
    # Country sets (ISO3 codes)
    five_eyes = %w[USA CAN GBR AUS NZL]
    nato = %w[ALB BEL BGR CAN HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LTU LUX MNE NLD MKD NOR POL PRT ROU SVK SVN ESP SWE TUR GBR USA]
    taa_compliant = %w[AFG FRA NER AGO GMB MKD DEU NOR ARM GRC OMN ABW GRD PAN AUS GTM PER AUT GIN POL BHS GNB PRT BHR GUY ROU BGD HTI RWA BRB HND BEL HKG WSM BLZ HUN BEN ISL SEN BTN IRL SLE ISR SGP VGB ITA BGR JAM SXM BFA JPN SVK BDI KIR SVN KHM KOR SLB CAN LAO SOM CAF LVA SSD TCD LSO ESP CHL LBR COL LIE COM LTU CRI LUX SWE HRV MDG CHE CUW MWI TWN CYP MLI TLS CZE MLT TGO COD MRT DNK MEX DJI MDA TUV DMA MNE UGA DOM MSR UKR SLV MAR GBR GNQ MOZ VUT ERI NPL YEM EST NLD RNR ETH NZL FIN NIC USA]
    oecd = %w[AUS AUT BEL CAN CHL COL CRI CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ISR ITA JPN KOR LVA LTU LUX MEX NLD NZL NOR POL PRT SVK SVN ESP SWE CHE TUR GBR USA]
    mnna = %w[ARG AUS BHR BRA COL EGY ISR JPN JOR KEN KWT MAR NZL PAK PHL QAT KOR TWN THA TUN]
    quad = %w[USA AUS JPN IND]
    bis_ns1 = %w[AFG ALB DZA AND AGO ARG ARM ABW AUT AZE BHS BHR BGD BRB BLR BEL BLZ BEN BTN BOL BWA BRA BRN BGR BFA BDI KHM CMR CPV CAF TCD CHL CHN COL COM COD COG CRI CIV HRV CUW CYP CZE DNK DJI DMA DOM ECU EGY SLV GNQ ERI EST SWZ ETH FJI FIN FRA GAB GMB GEO DEU GHA GRC GRD GTM GIN GNB GUY HTI HND HUN ISL IND IDN IRQ IRL ISR ITA JAM JPN JOR KAZ KEN KIR KOR XXK KWT KGZ LAO LVA LBN LSO LBR LBY LIE LTU LUX MAC MKD MDG MWI MYS MDV MLI MLT MHL MRT MUS MEX FSM MDA MCO MNG MNE MAR MOZ NAM NRU NPL NLD NIC NER NGA MKD NOR OMN PAK PLW PAN PNG PRY PER PHL POL PRT QAT ROU RUS RWA WSM SMR SAU SEN SRB SYC SLE SXM SVK SVN SLB SOM ZAF SSD ESP LKA SDN SUR SWZ SWE CHE TWN TJK TZA THA TLS TGO TON TUN TUR TKM TUV UGA UKR ARE URY UZB VUT VAT VEN VNM ESH YEM RNR ZWE]
    bis_rs1 = %w[AFG ALB DZA AND AGO ARM ABW AZE BHS BHR BGD BRB BLR BLZ BEN BTN BOL BWA BRA BRN BFA BDI KHM CMR CPV CAF TCD CHL CHN COL COM COD COG CRI CIV CUW CYP DJI DMA DOM ECU EGY SLV GNQ ERI SWZ ETH FJI GAB GMB GEO GHA GRD GTM GIN GNB GUY HTI HND IDN IRQ ISR JAM JOR KAZ KEN KIR XXK KWT KGZ LAO LBN LSO LBR LBY MAC MDG MWI MYS MDV MLI MLT MHL MRT MUS FSM MDA MCO MNG MNE MAR MOZ NAM NRU NPL NIC NER NGA MKD OMN PAK PLW PAN PNG PRY PER PHL QAT RUS RWA WSM SMR SAU SEN SRB SYC SLE SGP SXM SLB SOM ZAF SSD LKA SDN SUR SWZ SYR TWN TJK TZA THA TLS TGO TON TUN TKM TUV UGA UKR ARE URY UZB VUT VAT VEN VNM ESH YEM RNR ZWE]
    ofac = %w[IRN PRK SYR CUB RUS BLR VEN MMR SDN YEM ZWE NIC CAF COD ETH SSD HTI SOM LBN]
    dumping = %w[CHN]
    export_bans = %w[IND CHN]
    fda_oai = %w[IND CHN]
    counterfeit = %w[BEL BGR DEU POL ROU]

    updated = 0

    Location.find_each do |loc|
      c = loc.country&.strip&.upcase
      next unless c

      score = 5
      score += 2 if five_eyes.include?(c)
      score += 1 if nato.include?(c)
      score += 1 if mnna.include?(c)
      score += 1 if oecd.include?(c)
      score += 1 if quad.include?(c)
      score += 1 if taa_compliant.include?(c)

      score -= 2 if bis_ns1.include?(c)
      score -= 2 if bis_rs1.include?(c)
      score -= 4 if ofac.include?(c)
      score -= 2 if export_bans.include?(c)
      score -= 2 if dumping.include?(c)
      score -= 2 if fda_oai.include?(c)
      score -= 1 unless taa_compliant.include?(c)

      loc.risk_score = [[score, 0].max, 10].min
      loc.is_five_eyes = five_eyes.include?(c)
      loc.is_nato = nato.include?(c)
      loc.is_mnna = mnna.include?(c)
      loc.is_oecd = oecd.include?(c)
      loc.is_quad = quad.include?(c)
      loc.taa_compliant = taa_compliant.include?(c)
      loc.has_bis_ns1 = bis_ns1.include?(c)
      loc.has_bis_rs1 = bis_rs1.include?(c)
      loc.ofac_sanctioned = ofac.include?(c)
      loc.engages_in_dumping = dumping.include?(c)
      loc.has_export_ban_history = export_bans.include?(c)
      loc.quality_risk_flag = fda_oai.include?(c)

      updated += 1 if loc.changed?
      loc.save! if loc.changed?
    end

    puts "Updated #{updated} location records with risk scores and flags."
  end
end