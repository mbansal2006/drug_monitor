class Api::LocationsController < ApplicationController
  def index
    render json: Location.all.as_json(only: [
      :id, :csv_location_id, :address, :country, :state_or_region,
      :full_country_name, :latitude, :longitude, :risk_score,
      :oai_count, :engages_in_dumping, :has_bis_ns1, :ofac_sanctioned,
      :is_nato, :is_five_eyes, :taa_compliant, :firm_name
    ])
  end

  def show
    location = Location.find(params[:id])
    render json: location.as_json(only: [
      :id, :csv_location_id, :address, :country, :state_or_region,
      :full_country_name, :latitude, :longitude, :risk_score,
      :oai_count, :engages_in_dumping, :has_bis_ns1, :ofac_sanctioned,
      :is_nato, :is_five_eyes, :taa_compliant, :firm_name
    ])
  end

  def ndc_summary
    location = Location.find(params[:id])
    ndcs = location.ndcs.includes(:drug, :manufacturer)

    render json: {
      ndcs: ndcs.uniq.map { |n| n.as_json(only: [:id, :ndc_code, :proprietary_name, :drug_dosage, :drug_strength, :manufacturer_name, :drug_id, :manufacturer_id]) },
      drugs: ndcs.map(&:drug).uniq.map { |d| d.as_json(only: [:id, :drug_name, :therapeutic_categories, :fda_essential]) },
      manufacturers: ndcs.map(&:manufacturer).uniq.map { |m| m.as_json(only: [:id, :manufacturer_name]) }
    }
  end
end