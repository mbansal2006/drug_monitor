class Api::DrugsController < ApplicationController
  def index
    render json: Drug.all
  end

  def show
    render json: Drug.find(params[:id])
  end
end