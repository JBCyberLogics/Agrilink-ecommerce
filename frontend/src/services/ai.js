/**
 * AI service adapter — integration boundary for future AI backend endpoints.
 *
 * No AI provider, model, or API contract has been selected yet. Every
 * function below returns an honest "not configured" result until a real
 * backend is connected. No API keys, model credentials, or secrets are
 * stored here.
 */

export const AI_SERVICE_NOT_CONFIGURED =
  'AI features require backend integration. This AI service is not connected yet.'

/**
 * Generic AI request wrapper. Future implementation should replace the body
 * with a real fetch() to the AI backend endpoint.
 */
export async function aiRequest(endpoint, payload) {
  return {
    ok: false,
    error: AI_SERVICE_NOT_CONFIGURED,
    endpoint,
    payload,
    timestamp: new Date().toISOString(),
  }
}

/* ------------------------------------------------------------- shared */
export const aiMarketAdvisor = async (params) =>
  aiRequest('/ai/market-advisor', params)
export const aiAgriculturalAssistant = async (message, conversationHistory) =>
  aiRequest('/ai/agricultural-assistant', { message, conversationHistory })
export const aiRecommendations = async (params) =>
  aiRequest('/ai/recommendations', params)

/* ----------------------------------------------------------- farmer */
export const aiCropInsights = async (params) =>
  aiRequest('/ai/crop-insights', params)
export const aiPriceRecommendation = async (params) =>
  aiRequest('/ai/price-recommendation', params)
export const aiListingImprovement = async (params) =>
  aiRequest('/ai/listing-improvement', params)
export const aiBuyerMatching = async (params) =>
  aiRequest('/ai/buyer-matching', params)
export const aiHarvestPlanner = async (params) =>
  aiRequest('/ai/harvest-planner', params)

/* ------------------------------------------------------------ buyer */
export const aiProduceFinder = async (params) =>
  aiRequest('/ai/produce-finder', params)
export const aiSupplierMatching = async (params) =>
  aiRequest('/ai/supplier-matching', params)
export const aiPurchasePlanning = async (params) =>
  aiRequest('/ai/purchase-planning', params)
