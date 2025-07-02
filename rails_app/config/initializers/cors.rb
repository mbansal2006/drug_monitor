Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    if Rails.env.development?
      # Allow all origins for development
      origins '*'
    else
      # Allow specific origins for production
      origins 'https://drug-monitor-frontend.fly.dev', /https:\/\/.*\.fly\.dev$/
    end
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end