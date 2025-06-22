class LocationsController < ApplicationController
  def index
    @locations = Location.all

    if params[:q].present?
      query = "%#{params[:q]}%"
      @locations = @locations.where("address LIKE ? OR country LIKE ? OR duns_number LIKE ?", query, query, query)
    end

    if params[:country].present?
      c = "%#{params[:country]}%"
      @locations = @locations.where("country LIKE ? OR full_country_name LIKE ?", c, c)
    end

    if params[:state_or_region].present?
      @locations = @locations.where("state_or_region LIKE ?", "%#{params[:state_or_region]}%")
    end

    if params[:postal_code].present?
      @locations = @locations.where("postal_code LIKE ?", "%#{params[:postal_code]}%")
    end

    if params[:risk_bucket].present?
      range = case params[:risk_bucket]
              when 'low' then 0..33
              when 'medium' then 34..66
              when 'high' then 67..1000
              end
      @locations = @locations.where(risk_score: range) if range
    end

    if params[:taa_compliant].present?
      @locations = @locations.where(taa_compliant: true)
    end

    if params[:ofac_sanctioned].present?
      @locations = @locations.where(ofac_sanctioned: true)
    end

    @locations_json = @locations.select(:id, :latitude, :longitude, :country, :address, :duns_number, :risk_score).to_json
  end

  def show
    @location = Location.find(params[:id])
  end
end
