class AddRelatedEntitiesToLocations < ActiveRecord::Migration[7.1]
  def change
    add_column :locations, :related_entities, :text
  end
end
