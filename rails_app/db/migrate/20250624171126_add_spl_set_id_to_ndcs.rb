class AddSplSetIdToNdcs < ActiveRecord::Migration[7.1]
  def change
    add_column :ndcs, :spl_set_id, :string
  end
end
