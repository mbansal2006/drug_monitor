Rails.application.routes.draw do
  root 'dashboard#index'
  get 'dashboard/index'
  resources :drugs, only: [:index, :show]
  resources :manufacturers, only: [:index, :show]
  resources :ndcs, only: [:index, :show]
  resources :locations, only: [:index, :show]
  get 'up' => 'rails/health#show', as: :rails_health_check
end
