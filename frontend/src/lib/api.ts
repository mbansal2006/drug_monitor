export interface Filters {
  country: string;
  riskScore: [number, number];
  alliance: '' | 'nato' | 'five_eyes' | 'oecd' | 'quad';
  sanctions: boolean;
  dumping: boolean;
  taa: boolean;
}

export function buildLocationQuery(filters: Filters, search: string = ''): string {
  const params = new URLSearchParams();
  if (filters.country) params.set('country', filters.country);
  if (filters.riskScore) {
    params.set('risk_min', String(filters.riskScore[0]));
    params.set('risk_max', String(filters.riskScore[1]));
  }
  if (filters.sanctions) params.set('ofac_sanctioned', 'true');
  if (filters.dumping) params.set('engages_in_dumping', 'true');
  if (filters.taa) params.set('taa_compliant', 'true');
  switch (filters.alliance) {
    case 'nato':
      params.set('is_nato', 'true');
      break;
    case 'five_eyes':
      params.set('is_five_eyes', 'true');
      break;
    case 'oecd':
      params.set('is_oecd', 'true');
      break;
    case 'quad':
      params.set('is_quad', 'true');
      break;
  }
  if (search) params.set('q', search);
  const query = params.toString();
  return query ? `/api/locations?${query}` : '/api/locations';
}
