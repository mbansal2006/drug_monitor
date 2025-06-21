class NdcLocationLink < ApplicationRecord
  belongs_to :ndc
  belongs_to :location
end
