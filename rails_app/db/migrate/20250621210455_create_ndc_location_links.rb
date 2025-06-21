class CreateNdcLocationLinks < ActiveRecord::Migration[7.1]
  def change
    create_table :ndc_location_links do |t|
      t.references :ndc, null: false, foreign_key: true
      t.references :location, null: false, foreign_key: true

      t.timestamps
    end
  end
end
