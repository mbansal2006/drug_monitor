class Api::LocationsController < ApplicationController
  def index
    render json: Location.all
  end

  def show
    render json: Location.find(params[:id])
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