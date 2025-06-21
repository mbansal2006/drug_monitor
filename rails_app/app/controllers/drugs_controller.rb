class DrugsController < ApplicationController
  def index
    @drugs = if params[:q].present?
      Drug.where('drug_name LIKE ?', "%#{params[:q]}%")
    else
      Drug.all
    end
  end

  def show
    @drug = Drug.find(params[:id])
  end
end
