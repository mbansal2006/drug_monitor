class Api::NdcsController < ApplicationController
  def index
    ndcs = Ndc.includes(:manufacturer).all

    render json: ndcs.map { |ndc|
      {
        id: ndc.id,
        ndc_code: ndc.ndc_code,
        proprietary_name: ndc.proprietary_name,
        drug_dosage: ndc.drug_dosage,
        drug_strength: ndc.drug_strength,
        manufacturer_name: ndc.manufacturer&.manufacturer_name
      }
    }
  end

  def show
    ndc = Ndc.includes(:manufacturer).find(params[:id])

    render json: {
      id: ndc.id,
      ndc_code: ndc.ndc_code,
      proprietary_name: ndc.proprietary_name,
      drug_dosage: ndc.drug_dosage,
      drug_strength: ndc.drug_strength,
      manufacturer_name: ndc.manufacturer&.manufacturer_name
    }
  end
end