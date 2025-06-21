class CreateLocations < ActiveRecord::Migration[7.1]
  def change
    create_table :locations do |t|
      t.integer :location_id
      t.string :address
      t.string :country
      t.string :state_or_region
      t.string :postal_code
      t.string :full_country_name
      t.float :latitude
      t.float :longitude
      t.string :duns_number
      t.integer :risk_score
      t.integer :oai_count
      t.boolean :engages_in_dumping
      t.boolean :has_bis_ns1
      t.boolean :has_bis_rs1
      t.boolean :has_export_ban_history
      t.boolean :is_five_eyes
      t.boolean :is_mnna
      t.boolean :is_nato
      t.boolean :is_oecd
      t.boolean :is_quad
      t.boolean :ofac_sanctioned
      t.boolean :quality_risk_flag
      t.boolean :taa_compliant

      t.timestamps
    end
  end
end
