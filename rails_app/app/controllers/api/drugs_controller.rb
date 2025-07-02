class Api::DrugsController < ApplicationController
  def index
    drugs = Drug.page(params[:page]).per(params[:per_page] || 25)
    
    if params[:q].present?
      drugs = drugs.where('drug_name ILIKE ?', "%#{params[:q]}%")
    end
    
    render json: {
      drugs: drugs,
      pagination: {
        current_page: drugs.current_page,
        total_pages: drugs.total_pages,
        total_count: drugs.total_count,
        per_page: drugs.limit_value
      }
    }
  end

  def show
    render json: Drug.find(params[:id])
  end
end