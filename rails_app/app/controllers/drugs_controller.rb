class DrugsController < ApplicationController
  def index
    @drugs = Drug.page(params[:page]).per(25)
    
    if params[:q].present?
      @drugs = @drugs.where('drug_name ILIKE ?', "%#{params[:q]}%")
    end
  end

  def show
    @drug = Drug.find(params[:id])
  end
end
