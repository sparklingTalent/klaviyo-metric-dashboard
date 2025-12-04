const axios = require('axios');

class KlaviyoService {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.baseURL = 'https://a.klaviyo.com/api';
  }

  // Helper method to make authenticated requests using Klaviyo API v3
  async makeRequest(endpoint, method = 'GET', data = null, params = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.privateKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'revision': '2024-10-15' // Use latest API revision
        },
        params
      };

      if (data && method !== 'GET') {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      console.error('Klaviyo API Error:', errorData);
      
      // Extract error message from Klaviyo error format
      let errorMessage = error.message;
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors[0].detail || error.response.data.errors[0].title;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(`Klaviyo API Error: ${errorMessage}`);
    }
  }

  // Get account information (using v3 API)
  async getAccount() {
    try {
      // Try to get account info via profiles endpoint or account endpoint
      const response = await this.makeRequest('/accounts/', 'GET');
      return response;
    } catch (error) {
      // If accounts endpoint doesn't work, return basic info
      return { name: 'Klaviyo Account', contact_email: 'N/A' };
    }
  }

  // Get metrics (using v3 API)
  async getMetrics() {
    try {
      const response = await this.makeRequest('/metrics/', 'GET');
      return response;
    } catch (error) {
      return { data: [] };
    }
  }

  // Get campaigns (using v3 API)
  // Note: Klaviyo v3 requires a channel filter
  async getCampaigns() {
    try {
      // Fetch both email and SMS campaigns
      const [emailCampaigns, smsCampaigns] = await Promise.allSettled([
        this.makeRequest('/campaigns/', 'GET', null, {
          'filter': "equals(messages.channel,'email')"
        }).catch(() => ({ data: [] })),
        this.makeRequest('/campaigns/', 'GET', null, {
          'filter': "equals(messages.channel,'sms')"
        }).catch(() => ({ data: [] }))
      ]);

      const emailData = emailCampaigns.status === 'fulfilled' ? emailCampaigns.value : { data: [] };
      const smsData = smsCampaigns.status === 'fulfilled' ? smsCampaigns.value : { data: [] };

      // Combine both email and SMS campaigns
      const allCampaigns = [
        ...(emailData.data || []),
        ...(smsData.data || [])
      ];

      return { data: allCampaigns };
    } catch (error) {
      return { data: [] };
    }
  }

  // Get lists (using v3 API)
  async getLists() {
    try {
      const response = await this.makeRequest('/lists/', 'GET');
      return response;
    } catch (error) {
      return { data: [] };
    }
  }

  // Get profiles count (using v3 API)
  async getProfiles(params = {}) {
    try {
      const response = await this.makeRequest('/profiles/', 'GET', null, {
        'page[size]': 1,
        ...params
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get events (using v3 API)
  async getEvents(params = {}) {
    try {
      const response = await this.makeRequest('/events/', 'GET', null, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get campaign statistics/metrics
  async getCampaignMetrics(campaignId) {
    try {
      const response = await this.makeRequest(`/campaigns/${campaignId}/campaign-messages/`, 'GET');
      return response;
    } catch (error) {
      return null;
    }
  }

  // Get flows
  async getFlows() {
    try {
      const response = await this.makeRequest('/flows/', 'GET');
      return response;
    } catch (error) {
      return { data: [] };
    }
  }

  // Get specific metric data
  async getMetricData(metricId, params = {}) {
    try {
      const response = await this.makeRequest(`/metrics/${metricId}/`, 'GET', null, params);
      return response;
    } catch (error) {
      return null;
    }
  }

  // Get events by metric type
  async getEventsByMetric(metricName, params = {}) {
    try {
      const response = await this.makeRequest('/events/', 'GET', null, {
        'filter': `equals(metric.name,'${metricName}')`,
        ...params
      });
      return response;
    } catch (error) {
      return { data: [] };
    }
  }

  // Get dashboard metrics (combined data with detailed metrics)
  async getDashboardMetrics() {
    try {
      const [account, metrics, campaigns, lists, flows] = await Promise.allSettled([
        this.getAccount().catch(e => ({ error: e.message })),
        this.getMetrics().catch(e => ({ error: e.message })),
        this.getCampaigns().catch(e => ({ error: e.message })),
        this.getLists().catch(e => ({ error: e.message })),
        this.getFlows().catch(e => ({ error: e.message }))
      ]);

      // Get profile count and list membership
      let profileCount = 0;
      let listMembership = {};
      try {
        const profileResponse = await this.makeRequest('/profiles/', 'GET', null, {
          'page[size]': 100
        });
        if (profileResponse?.data) {
          profileCount = profileResponse.data.length;
        }
      } catch (e) {
        console.error('Error fetching profiles:', e.message);
      }

      // Get list membership counts
      const listsData = lists.status === 'fulfilled' && !lists.value.error ? lists.value : null;
      if (listsData?.data) {
        for (const list of listsData.data.slice(0, 10)) { // Limit to first 10 lists
          try {
            const listProfiles = await this.makeRequest(`/lists/${list.id}/profiles/`, 'GET', null, {
              'page[size]': 1
            });
            listMembership[list.attributes?.name || list.id] = listProfiles?.data?.length || 0;
          } catch (e) {
            // Skip if error
          }
        }
      }

      // Calculate campaign metrics
      const campaignsData = campaigns.status === 'fulfilled' && !campaigns.value.error ? campaigns.value : null;
      let campaignMetrics = {
        total: campaignsData?.data?.length || 0,
        opens: 0,
        clicks: 0,
        delivered: 0,
        bounces: 0,
        revenue: 0
      };

      // Get event metrics
      const eventMetrics = {
        placedOrder: 0,
        viewedProduct: 0,
        addedToCart: 0,
        activeOnSite: 0
      };

      try {
        // Fetch event counts for key metrics
        const [placedOrder, viewedProduct, addedToCart] = await Promise.allSettled([
          this.getEventsByMetric('Placed Order', { 'page[size]': 1 }).catch(() => ({ data: [] })),
          this.getEventsByMetric('Viewed Product', { 'page[size]': 1 }).catch(() => ({ data: [] })),
          this.getEventsByMetric('Added to Cart', { 'page[size]': 1 }).catch(() => ({ data: [] }))
        ]);

        // Note: These are sample counts. For accurate totals, you'd need to paginate
        eventMetrics.placedOrder = placedOrder.status === 'fulfilled' ? (placedOrder.value.data?.length || 0) : 0;
        eventMetrics.viewedProduct = viewedProduct.status === 'fulfilled' ? (viewedProduct.value.data?.length || 0) : 0;
        eventMetrics.addedToCart = addedToCart.status === 'fulfilled' ? (addedToCart.value.data?.length || 0) : 0;
      } catch (e) {
        console.error('Error fetching event metrics:', e.message);
      }

      // Get flow metrics
      const flowsData = flows.status === 'fulfilled' && !flows.value.error ? flows.value : null;
      const flowMetrics = {
        total: flowsData?.data?.length || 0,
        sends: 0,
        conversionRate: 0,
        revenue: 0
      };

      // Calculate revenue metrics
      let revenueMetrics = {
        totalRevenue: 0,
        revenueByEmail: 0,
        revenueOverTime: []
      };

      // Try to get revenue from metrics
      const metricsData = metrics.status === 'fulfilled' && !metrics.value.error ? metrics.value : null;
      if (metricsData?.data) {
        // Look for revenue-related metrics
        const revenueMetricsList = metricsData.data.filter(m => 
          m.attributes?.name?.toLowerCase().includes('revenue') ||
          m.attributes?.name?.toLowerCase().includes('order')
        );
        // This is a simplified approach - actual revenue would need metric aggregation
      }

      return {
        account: account.status === 'fulfilled' && !account.value.error ? account.value : null,
        metrics: metricsData,
        campaigns: campaignsData,
        lists: listsData,
        flows: flowsData,
        profileCount: profileCount,
        listMembership: listMembership,
        campaignMetrics: campaignMetrics,
        eventMetrics: eventMetrics,
        flowMetrics: flowMetrics,
        revenueMetrics: revenueMetrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = KlaviyoService;

