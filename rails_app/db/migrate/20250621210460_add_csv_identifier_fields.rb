class AddCsvIdentifierFields < ActiveRecord::Migration[7.1]
  def change
    add_column :drugs, :csv_drug_id, :integer
    rename_column :locations, :location_id, :csv_location_id
    add_column :ndcs, :csv_ndc_id, :integer
    add_column :ndcs, :csv_drug_id, :integer
    add_index :drugs, :csv_drug_id
    add_index :locations, :csv_location_id
    add_index :ndcs, :csv_ndc_id
    add_index :ndcs, :csv_drug_id
  end
end
