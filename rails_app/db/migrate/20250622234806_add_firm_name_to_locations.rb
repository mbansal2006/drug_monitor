class AddFirmNameToLocations < ActiveRecord::Migration[7.1]
  def change
    add_column :locations, :firm_name, :string
  end
end
