class Location < ApplicationRecord
  has_many :ndc_location_links
  has_many :ndcs, through: :ndc_location_links

  geocoded_by :full_location_string
  after_validation :geocode, if: ->(obj) { obj.latitude.blank? || obj.longitude.blank? }

  def full_location_string
    [address, state_or_region, postal_code, country].compact.join(', ')
  end
end
