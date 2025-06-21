class CreateDrugs < ActiveRecord::Migration[7.1]
  def change
    create_table :drugs do |t|
      t.string :drug_name
      t.boolean :fda_essential
      t.string :reason
      t.date :shortage_end
      t.date :shortage_start
      t.text :therapeutic_categories
      t.date :update_date
      t.string :update_type

      t.timestamps
    end
  end
end
