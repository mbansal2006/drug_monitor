class CreateNdcs < ActiveRecord::Migration[7.1]
  def change
    create_table :ndcs do |t|
      t.references :drug, null: false, foreign_key: true
      t.string :ndc_code
      t.string :manufacturer_name
      t.string :proprietary_name
      t.string :drug_dosage
      t.string :drug_strength
      t.references :manufacturer, null: false, foreign_key: true

      t.timestamps
    end
  end
end
