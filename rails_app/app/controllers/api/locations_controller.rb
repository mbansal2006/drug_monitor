class Api::LocationsController < ApplicationController
  def index
  render json: Location.all.as_json(methods: [:risk_score])
  end

  def show
  render json: Location.find(params[:id]).as_json(methods: [:risk_score])
  end
end