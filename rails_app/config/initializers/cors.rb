Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow all localhost origins for development
    origins '*'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end