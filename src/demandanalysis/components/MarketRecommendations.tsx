"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp, Truck, IndianRupee, Star, Lightbulb, Loader2 } from 'lucide-react';
import { MarketInfo, VehicleInfo, SeasonalPattern, LocationData } from '../types/market';
import { getCoordinates, calculateDistance } from '../utils/geocoding';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface MarketRecommendationsProps {
  markets: MarketInfo[];
  bestStateMarkets: MarketInfo[];
  variety: string;
  userLocation?: LocationData;
  vehicleInfo: VehicleInfo;
  seasonalPatterns: SeasonalPattern[];
  costPerKm: number;
}

const normalizeMarketName = (name: string): string => {
  // Removes text in parentheses like (F&V), (Sub Yard), etc. and trims whitespace
  return name.replace(/\s*\(.*\)\s*/g, '').trim();
};

type EnhancedMarketInfo = MarketInfo & {
  distance: number | null;
  transportCost: number;
  score: number;
};

export const MarketRecommendations: React.FC<MarketRecommendationsProps> = ({
  markets,
  bestStateMarkets,
  variety,
  userLocation,
  vehicleInfo,
  seasonalPatterns,
  costPerKm
}) => {
  const [geminiSuggestion, setGeminiSuggestion] = useState<string>('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [enhancedMarkets, setEnhancedMarkets] = useState<EnhancedMarketInfo[]>([]);
  const [isLoadingDistances, setIsLoadingDistances] = useState(false);

  useEffect(() => {
    const fetchGeminiSuggestion = async () => {
      // Check if we have the minimum required data
      if (!variety) {
        setGeminiSuggestion('Please select a crop variety to get AI recommendations.');
        return;
      }

      setLoadingSuggestion(true);
      setSuggestionError(null);
      setGeminiSuggestion('');

      try {
        // Build context from available data
        const overallMarketText = markets.length > 0 
          ? `Overall best markets: ${markets.slice(0, 3).map(m => `${m.market} (High: ₹${m.highPrice})`).join(', ')}.`
          : 'Market data is being analyzed.';
        
        const stateMarketText = bestStateMarkets.length > 0 
          ? `Top markets in the state: ${bestStateMarkets.slice(0, 3).map(m => `${m.market} (High: ₹${m.highPrice})`).join(', ')}.`
          : '';
        
        const seasonalText = seasonalPatterns.length > 0 
          ? `Seasonal trends: ${seasonalPatterns.slice(0, 6).map(p => `${p.month} (${p.recommendation})`).join(', ')}.`
          : 'Seasonal analysis is being processed.';

        const locationText = userLocation?.state ? `in ${userLocation.state}` : 'in your region';

        const prompt = `
          As an agricultural market expert, provide comprehensive farming and marketing advice for ${variety} ${locationText}.

          Available market data:
          1. ${overallMarketText}
          2. ${stateMarketText}
          3. ${seasonalText}

          Please provide:
          1. A brief market strategy summary (2-3 sentences)
          2. Detailed actionable recommendations covering:
             - Market timing and price optimization
             - Storage and post-harvest handling
             - Value addition opportunities
             - Risk management strategies
             - Government schemes and support
             - Cooperative marketing benefits

          Format your response clearly with the summary first, followed by numbered recommendations.
        `;

        // Try direct API call first (more reliable for development)
        let suggestion = '';
        
        try {
          console.log('Attempting Gemini API call...');
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBdcfzUa9q2FFZoslweResfdsYcpj0J0nI', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          
          console.log('API Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('API Response data:', data);
          
          suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (!suggestion) {
            console.warn('Empty suggestion from API response');
            throw new Error('Empty response from AI service');
          }
          
          console.log('Successfully got AI suggestion');
        } catch (apiError) {
          console.error('Direct API call failed, trying SDK approach:', apiError);
          
          // Fallback to SDK approach if available
          const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
          if (apiKey) {
            console.log('Trying GoogleGenerativeAI SDK...');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            suggestion = response.text();
            console.log('SDK approach successful');
          } else {
            console.log('No environment API key available, re-throwing error');
            throw apiError;
          }
        }
        
        if (suggestion && suggestion.trim()) {
          setGeminiSuggestion(suggestion);
        } else {
          throw new Error('Empty response from AI service');
        }
      } catch (err) {
        console.error('Gemini API Error:', err);
        
        // Provide fallback suggestions based on available data
        const fallbackSuggestion = `
Market Strategy for ${variety}:
Based on available data, focus on timing your sales during peak price periods and consider diversifying your market channels. ${markets.length > 0 ? `Current top markets show prices ranging from ₹${Math.min(...markets.map(m => m.lowPrice || 0))} to ₹${Math.max(...markets.map(m => m.highPrice || 0))}.` : ''}

Key Recommendations:
1. **Market Timing**: Monitor seasonal price patterns and plan harvests accordingly
2. **Quality Management**: Implement proper post-harvest handling to reduce losses
3. **Market Diversification**: Don't rely on a single market - explore multiple channels
4. **Storage Solutions**: Invest in proper storage to take advantage of price fluctuations
5. **Cooperative Marketing**: Join farmer groups for better bargaining power
6. **Value Addition**: Consider processing or packaging to increase profit margins
7. **Government Schemes**: Explore available subsidies and support programs
8. **Risk Management**: Consider crop insurance and forward contracts where available

Note: AI service temporarily unavailable. These are general recommendations based on market data.
        `;
        
        setGeminiSuggestion(fallbackSuggestion);
        setSuggestionError('Using fallback recommendations. AI service may be temporarily unavailable.');
      } finally {
        setLoadingSuggestion(false);
      }
    };

    fetchGeminiSuggestion();
  }, [markets, bestStateMarkets, seasonalPatterns, variety, userLocation]);

  useEffect(() => {
    const processMarkets = async () => {
      if (!markets.length || !userLocation?.latitude || !userLocation?.longitude) {
        setEnhancedMarkets([]);
        return;
      }

      setIsLoadingDistances(true);

      const userCoords = {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
      };

      const marketsWithDistances = await Promise.all(
        markets.map(async (market) => {
          const normalizedMarketName = normalizeMarketName(market.market);
          let distance: number | null = null;
          
          if (userCoords) {
            const placeNameMarket = `${normalizedMarketName}, ${market.district}, ${market.state}`;
            let marketCoords = await getCoordinates(placeNameMarket);
  
            if (!marketCoords) {
              console.warn(`Could not find coordinates for market: '${placeNameMarket}'. Falling back to district.`);
              const placeNameDistrict = `${market.district}, ${market.state}`;
              marketCoords = await getCoordinates(placeNameDistrict);
            }
            
            if (marketCoords) {
              distance = calculateDistance(
                userCoords.lat,
                userCoords.lon,
                marketCoords.lat,
                marketCoords.lon
              );
            }
          }

          // Fallback logic for when geocoding fails
          if (distance === null && userLocation) {
            if (market.state === userLocation.state) {
              distance = market.district === userLocation.district ? 50 : 150;
            } else {
              distance = 300;
            }
          }

          // If distance is 0, show 30km as a minimum.
          if (distance === 0) {
            distance = 30;
          }
          
          return { ...market, distance };
        })
      );

      const getRecommendationScore = (market: MarketInfo, distance: number | null): number => {
        const priceScore = (market.highPrice || 0) / 10000;
        
        let distanceScore = 4;
        const numericDistance = distance ?? 1000;
        if (numericDistance < 50) distanceScore = 10;
        else if (numericDistance < 200) distanceScore = 7;

        const arrivalScore = Math.min((market.arrivals || 0) / 10, 5);
        
        const score = (priceScore + distanceScore + arrivalScore) / 3;
        return Math.min(Math.round(score), 5);
      };

      const calculateTransportCost = (distance: number | null): number => {
        if (costPerKm === 0 || distance === null) {
          return 0;
        }
        return Math.round(costPerKm * distance);
      };

      const finalMarkets = marketsWithDistances
        .map(market => ({
          ...market,
          transportCost: calculateTransportCost(market.distance),
          score: getRecommendationScore(market, market.distance)
        }))
        .sort((a, b) => b.score - a.score);
      
      setEnhancedMarkets(finalMarkets);
      setIsLoadingDistances(false);
    };

    processMarkets();
  }, [markets, userLocation, vehicleInfo, costPerKm]);

  if (isLoadingDistances) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span className="text-gray-900 font-medium">Calculating exact distances to markets...</span>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Star className="mr-2 text-yellow-600" size={20} />
          Market Recommendations
        </h3>
        <p className="text-gray-600">No market data available for this crop.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Star className="mr-2 text-yellow-600" size={20} />
          Best Markets for {variety}
        </h3>
        <p className="text-sm text-gray-600">
          Showing top {Math.min(enhancedMarkets.length, 5)} recommendations
        </p>
      </div>

      <div className="space-y-4">
        {enhancedMarkets.slice(0, 5).map((market, index) => (
          <div 
            key={`${market.state}-${market.district}-${market.market}`}
            className={`p-4 rounded-lg border-2 ${
              index === 0 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {index === 0 && <Star className="text-yellow-500 mr-2" size={20} fill="currentColor" />}
                <div>
                  <h4 className="font-semibold text-gray-800">{market.market}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="mr-1" size={14} />
                    {market.district}, {market.state}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  High: ₹{market.highPrice || 0} <span className="text-sm font-medium text-gray-600">({market.highPriceMonth || 'N/A'})</span>
                </p>
                <p className="text-lg font-bold text-red-600">
                  Low: ₹{market.lowPrice || 0} <span className="text-sm font-medium text-gray-600">({market.lowPriceMonth || 'N/A'})</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Truck className="mr-2 text-blue-600" size={16} />
                <div>
                  <p className="text-gray-700 font-medium">Distance</p>
                  <p className="font-bold text-gray-900">
                    {market.distance !== null ? `${Math.round(market.distance)} km` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <IndianRupee className="mr-2 text-orange-600" size={16} />
                <div>
                  <p className="text-gray-700 font-medium">Transport Cost</p>
                  <p className="font-bold text-gray-900">₹{market.transportCost}</p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="mr-2 text-purple-600" size={16} />
                <div>
                  <p className="text-gray-700 font-medium">Market Activity</p>
                  <p className="font-bold text-gray-900">{market.arrivals.toFixed(1)}T</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Net Price (based on high): 
                  <span className="font-semibold text-green-600 ml-1">
                    ₹{(market.highPrice || 0) - market.transportCost}
                  </span>
                </p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Score:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < market.score ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {index === 0 && (
              <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                <strong>Recommended:</strong> Best combination of price, distance, and market activity
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Contact markets before traveling to confirm current prices</li>
          <li>• Consider grouping with other farmers to reduce transport costs</li>
          <li>• Check market timings and weekly schedules</li>
          <li>• Negotiate better prices for larger quantities</li>
        </ul>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
          <Lightbulb className="mr-2" size={16} />
          Gemini AI Market Suggestion
        </h4>
        {loadingSuggestion ? (
          <p className="text-yellow-700">Loading suggestion...</p>
        ) : suggestionError ? (
          <p className="text-red-600">{suggestionError}</p>
        ) : (
          <p className="text-yellow-700 whitespace-pre-wrap">{geminiSuggestion}</p>
        )}
      </div>
    </div>
  );
};