class NdcsController < ApplicationController
  def index
    @ndcs = Ndc.includes(:drug, :manufacturer).all
  end

  def show
    @ndc = Ndc.find(params[:id])
  end
end
