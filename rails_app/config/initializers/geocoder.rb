Geocoder.configure(
  lookup: :nominatim,
  http_headers: { 'User-Agent' => 'DrugMonitorRails' },
  timeout: 10
)
