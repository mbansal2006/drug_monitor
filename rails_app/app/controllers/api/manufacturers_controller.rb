class Api::ManufacturersController < ApplicationController
  def index
    render json: Manufacturer.all
  end

  def show
    render json: Manufacturer.find(params[:id])
  end
end