Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow localhost for development
    origins 'localhost:8080', 'http://localhost:8080', 'https://localhost:8080'
    
    # Allow production frontend domain (update with your actual Fly.io frontend URL)
    origins /https:\/\/.*\.fly\.dev$/
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end