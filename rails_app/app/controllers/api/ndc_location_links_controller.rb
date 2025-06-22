class Api::NdcLocationLinksController < ApplicationController
  def index
    render json: NdcLocationLink.all
  end

  def show
    render json: NdcLocationLink.find(params[:id])
  end
end