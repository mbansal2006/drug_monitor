class AddPerformanceIndexes < ActiveRecord::Migration[7.1]
  def change
    # Add indexes for frequently searched fields
    add_index :drugs, :drug_name
    add_index :locations, :country
    add_index :locations, :address
    add_index :locations, :duns_number
    add_index :locations, :firm_name
    add_index :locations, :risk_score
    add_index :ndcs, :ndc_code
    add_index :ndcs, :proprietary_name
    add_index :ndcs, :generic_name
    add_index :manufacturers, :manufacturer_name
  end
end
