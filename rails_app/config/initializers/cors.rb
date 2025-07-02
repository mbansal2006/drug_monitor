Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins [
      'https://drug-monitor-vyip.vercel.app',
      'https://drug-monitor-vyip-git-main-mbansal2006s-projects.vercel.app',
      'https://drug-monitor-vyip-8deh49v07-mbansal2006s-projects.vercel.app',
      'http://localhost:8080'
    ]

    resource '*',
      headers: :any,
      methods: [:get, :post, :options]
  end
end