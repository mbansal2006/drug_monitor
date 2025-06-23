class Api::LocationsController < ApplicationController
  def index
    @locations = Location.all

    if params[:q].present?
      query = "%#{params[:q].downcase.strip}%"
      @locations = @locations.where(
        "LOWER(address) LIKE :q OR LOWER(country) LIKE :q OR LOWER(duns_number) LIKE :q OR LOWER(firm_name) LIKE :q OR LOWER(state_or_region) LIKE :q OR LOWER(full_country_name) LIKE :q OR LOWER(related_entities) LIKE :q",
        q: query
      )
    end

    # Optional filters (still safe to include if used)
    @locations = @locations.where("country LIKE ? OR full_country_name LIKE ?", "%#{params[:country]}%", "%#{params[:country]}%") if params[:country].present?
    @locations = @locations.where("state_or_region LIKE ?", "%#{params[:state_or_region]}%") if params[:state_or_region].present?
    @locations = @locations.where("postal_code LIKE ?", "%#{params[:postal_code]}%") if params[:postal_code].present?

    if params[:risk_bucket].present?
      range = case params[:risk_bucket]
              when 'low' then 0..33
              when 'medium' then 34..66
              when 'high' then 67..1000
              end
      @locations = @locations.where(risk_score: range) if range
    end

    @locations = @locations.where(taa_compliant: true) if params[:taa_compliant].present?
    @locations = @locations.where(ofac_sanctioned: true) if params[:ofac_sanctioned].present?

    render json: @locations.select(
      :id,
      :latitude,
      :longitude,
      :country,
      :address,
      :duns_number,
      :risk_score,
      :related_entities,
      :firm_name,
      :state_or_region,
      :full_country_name
    )
  end

  def show
    @location = Location.find(params[:id])
  end

  def ndc_summary
    location = Location.find(params[:id])
    ndc_links = NdcLocationLink.where(location_id: location.id)
    ndcs = Ndc.where(id: ndc_links.pluck(:ndc_id))

    drug_ids = ndcs.pluck(:drug_id).uniq
    manufacturer_ids = ndcs.pluck(:manufacturer_id).uniq

    drugs = Drug.where(id: drug_ids)
    manufacturers = Manufacturer.where(id: manufacturer_ids)

    render json: {
      drugs: drugs.as_json(only: [:id, :drug_name, :fda_essential, :therapeutic_categories, :shortage_start, :shortage_end]),
      ndcs: ndcs.as_json(only: [:id, :ndc_code, :proprietary_name, :drug_dosage, :drug_strength, :manufacturer_name, :drug_id, :manufacturer_id]),
      manufacturers: manufacturers.as_json(only: [:id, :manufacturer_name])
    }
  end
end