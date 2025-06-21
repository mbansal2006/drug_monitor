class Ndc < ApplicationRecord
  belongs_to :drug
  has_many :ndc_location_links
  has_many :locations, through: :ndc_location_links
  belongs_to :manufacturer
end
