class Api::NdcsController < ApplicationController
  def index
    render json: Ndc.all
  end

  def show
    render json: Ndc.find(params[:id])
  end
end