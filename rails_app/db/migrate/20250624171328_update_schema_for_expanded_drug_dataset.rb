class UpdateSchemaForExpandedDrugDataset < ActiveRecord::Migration[7.1]
  def change
    remove_column :drugs, :csv_drug_id, :integer

    remove_column :ndcs, :csv_ndc_id, :integer
    remove_column :ndcs, :csv_drug_id, :integer
    remove_column :ndcs, :manufacturer_name, :string
    add_column    :ndcs, :generic_name, :string

    remove_column :locations, :csv_location_id, :integer
  end
end