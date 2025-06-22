Rails.application.routes.draw do
  root 'dashboard#index'
  get 'dashboard/index'
  get 'up' => 'rails/health#show', as: :rails_health_check

  # HTML views (for Rails server-side pages, like /drugs)
  resources :drugs, only: [:index, :show]
  resources :manufacturers, only: [:index, :show]
  resources :ndcs, only: [:index, :show]
  resources :locations, only: [:index, :show]

  # JSON API routes (for React frontend to call)
  namespace :api do
    get 'locations/:id/ndc_summary', to: 'locations#ndc_summary'
    get 'ndcs/index'
    get 'ndcs/show'
    get 'locations/index'
    get 'locations/show'
    get 'manufacturers/index'
    get 'manufacturers/show'
    get 'drugs/index'
    get 'drugs/show'
    get 'ndc_location_links/index'
    get 'ndc_location_links/show'
    resources :drugs, only: [:index, :show]
    resources :manufacturers, only: [:index, :show]
    resources :locations, only: [:index, :show]
    resources :ndcs, only: [:index, :show]
    resources :ndc_location_links, only: [:index, :show]
  end
end