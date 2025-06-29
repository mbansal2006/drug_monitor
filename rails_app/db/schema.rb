# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_06_24_171328) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "drugs", force: :cascade do |t|
    t.string "drug_name"
    t.boolean "fda_essential"
    t.string "reason"
    t.date "shortage_end"
    t.date "shortage_start"
    t.text "therapeutic_categories"
    t.date "update_date"
    t.string "update_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "locations", force: :cascade do |t|
    t.string "address"
    t.string "country"
    t.string "state_or_region"
    t.string "postal_code"
    t.string "full_country_name"
    t.float "latitude"
    t.float "longitude"
    t.string "duns_number"
    t.integer "risk_score"
    t.integer "oai_count"
    t.boolean "engages_in_dumping"
    t.boolean "has_bis_ns1"
    t.boolean "has_bis_rs1"
    t.boolean "has_export_ban_history"
    t.boolean "is_five_eyes"
    t.boolean "is_mnna"
    t.boolean "is_nato"
    t.boolean "is_oecd"
    t.boolean "is_quad"
    t.boolean "ofac_sanctioned"
    t.boolean "quality_risk_flag"
    t.boolean "taa_compliant"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "related_entities"
    t.string "firm_name"
  end

  create_table "manufacturers", force: :cascade do |t|
    t.string "manufacturer_name"
    t.string "temp_property"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ndc_location_links", force: :cascade do |t|
    t.bigint "ndc_id", null: false
    t.bigint "location_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["location_id"], name: "index_ndc_location_links_on_location_id"
    t.index ["ndc_id"], name: "index_ndc_location_links_on_ndc_id"
  end

  create_table "ndcs", force: :cascade do |t|
    t.bigint "drug_id", null: false
    t.string "ndc_code"
    t.string "proprietary_name"
    t.string "drug_dosage"
    t.string "drug_strength"
    t.bigint "manufacturer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "spl_set_id"
    t.string "generic_name"
    t.index ["drug_id"], name: "index_ndcs_on_drug_id"
    t.index ["manufacturer_id"], name: "index_ndcs_on_manufacturer_id"
  end

  add_foreign_key "ndc_location_links", "locations"
  add_foreign_key "ndc_location_links", "ndcs"
  add_foreign_key "ndcs", "drugs"
  add_foreign_key "ndcs", "manufacturers"
end
