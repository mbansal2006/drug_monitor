class LocationsController < ApplicationController
  def index
    @locations = Location.all

    if params[:q].present?
      query = "%#{params[:q]}%"
      @locations = @locations.where("address LIKE ? OR country LIKE ? OR duns_number LIKE ?", query, query, query)
    end

    if params[:risk_bucket].present?
      range = case params[:risk_bucket]
              when 'low' then 0..33
              when 'medium' then 34..66
              when 'high' then 67..1000
              end
      @locations = @locations.where(risk_score: range) if range
    end

    @locations_json = @locations.select(:id, :latitude, :longitude, :country, :address, :duns_number, :risk_score).to_json
  end

  def show
    @location = Location.find(params[:id])
  end
end
