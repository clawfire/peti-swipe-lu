
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced cache for storing successful responses
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting storage
const rateLimits = new Map();

// Multiple proxy endpoints for failover
const PROXY_ENDPOINTS = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
];

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
];

// Enhanced session management
class SessionManager {
  private sessions = new Map();
  
  getSession(identifier: string) {
    return this.sessions.get(identifier) || { cookies: [], userAgent: this.getRandomUserAgent() };
  }
  
  updateSession(identifier: string, cookies: string[]) {
    const session = this.getSession(identifier);
    session.cookies = cookies;
    this.sessions.set(identifier, session);
  }
  
  getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }
}

const sessionManager = new SessionManager();

// Advanced retry logic with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Rate limiting check
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimits.has(identifier)) {
    rateLimits.set(identifier, []);
  }
  
  const requests = rateLimits.get(identifier).filter((time: number) => time > windowStart);
  
  if (requests.length >= 30) { // 30 requests per minute
    console.log(`Rate limit exceeded for ${identifier}`);
    return false;
  }
  
  requests.push(now);
  rateLimits.set(identifier, requests);
  return true;
}

// Enhanced request with multiple strategies
async function makeEnhancedRequest(url: string, sessionId: string): Promise<Response> {
  const session = sessionManager.getSession(sessionId);
  
  // Strategy 1: Direct request with enhanced headers
  const directStrategy = async (): Promise<Response> => {
    console.log('Trying direct request strategy...');
    
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'DNT': '1',
      'Origin': 'https://www.petitiounen.lu',
      'Pragma': 'no-cache',
      'Referer': 'https://www.petitiounen.lu/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
      'User-Agent': session.userAgent,
      'X-Requested-With': 'XMLHttpRequest',
    };
    
    if (session.cookies.length > 0) {
      headers['Cookie'] = session.cookies.join('; ');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      redirect: 'follow',
    });
    
    // Update session with new cookies
    const setCookies = response.headers.get('set-cookie');
    if (setCookies) {
      sessionManager.updateSession(sessionId, setCookies.split(','));
    }
    
    return response;
  };
  
  // Strategy 2: Proxy requests with fallback
  const proxyStrategy = async (): Promise<Response> => {
    console.log('Trying proxy strategy...');
    
    for (const proxyUrl of PROXY_ENDPOINTS) {
      try {
        console.log(`Attempting proxy: ${proxyUrl}`);
        
        let requestUrl: string;
        let headers: Record<string, string> = {
          'User-Agent': session.userAgent,
        };
        
        if (proxyUrl.includes('allorigins.win')) {
          requestUrl = `${proxyUrl}${encodeURIComponent(url)}`;
        } else {
          requestUrl = `${proxyUrl}${url}`;
          headers['X-Requested-With'] = 'XMLHttpRequest';
        }
        
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: headers,
        });
        
        if (response.ok) {
          // Handle allorigins.win response format
          if (proxyUrl.includes('allorigins.win')) {
            const data = await response.json();
            return new Response(data.contents, {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return response;
        }
      } catch (error) {
        console.log(`Proxy ${proxyUrl} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All proxy endpoints failed');
  };
  
  // Strategy 3: Delayed request with session warmup
  const sessionWarmupStrategy = async (): Promise<Response> => {
    console.log('Trying session warmup strategy...');
    
    // First, make a request to the main site to establish session
    try {
      await fetch('https://www.petitiounen.lu/', {
        headers: {
          'User-Agent': session.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      
      // Wait a bit to simulate human behavior
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Now make the actual request
      return await directStrategy();
    } catch (error) {
      throw new Error(`Session warmup failed: ${error.message}`);
    }
  };
  
  // Try strategies in order
  const strategies = [directStrategy, proxyStrategy, sessionWarmupStrategy];
  
  for (const strategy of strategies) {
    try {
      const response = await strategy();
      if (response.ok) {
        console.log('Strategy succeeded:', strategy.name);
        return response;
      }
    } catch (error) {
      console.log(`Strategy ${strategy.name} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All request strategies failed');
}

// Cache management
function getCachedResponse(cacheKey: string) {
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('Returning cached response');
    return cached.data;
  }
  return null;
}

function setCachedResponse(cacheKey: string, data: any) {
  responseCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ENHANCED PETITION FETCHER START ===');
    
    // Extract client info for session management
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const sessionId = `session_${clientIP}`;
    
    // Rate limiting check
    if (!checkRateLimit(sessionId)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const language = url.searchParams.get('language') || 'FR';
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    console.log(`Request params: language=${language}, page=${page}, size=${size}, session=${sessionId}`);
    
    // Create cache key
    const cacheKey = `petitions_${language}_${page}_${size}`;
    
    // Check cache first
    const cachedResult = getCachedResponse(cacheKey);
    if (cachedResult) {
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Construct the Luxembourg government API URL
    const apiUrl = new URL('https://www.petitiounen.lu/petition-web-back-for-front/petitions');
    apiUrl.searchParams.set('language', language.toUpperCase());
    apiUrl.searchParams.set('petitionGroup', 'SIGNABLE');
    apiUrl.searchParams.set('count', 'false');
    apiUrl.searchParams.set('page', page.toString());
    apiUrl.searchParams.set('size', size.toString());
    apiUrl.searchParams.set('sort', 'NUMBER,desc');
    
    console.log('Target API URL:', apiUrl.toString());
    
    // Enhanced request with retry logic
    const response = await retryWithBackoff(
      () => makeEnhancedRequest(apiUrl.toString(), sessionId),
      3, // max retries
      2000 // base delay
    );
    
    console.log('Final response status:', response.status);
    console.log('Final response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Process response
    const responseText = await response.text();
    console.log('Response length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 200));
    
    // Check for HTML error pages
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('Received HTML instead of JSON - API may be blocking requests');
      throw new Error('API returned HTML error page instead of JSON data');
    }
    
    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('JSON parsing successful');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError.message);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    // Extract petitions data
    let petitionsData: any[] = [];
    let totalElements = 0;
    let totalPages = 0;
    
    if (data.content && Array.isArray(data.content)) {
      petitionsData = data.content;
      totalElements = data.totalElements || 0;
      totalPages = data.totalPages || 0;
    } else if (Array.isArray(data)) {
      petitionsData = data;
      totalElements = data.length;
      totalPages = 1;
    } else if (data.petitions && Array.isArray(data.petitions)) {
      petitionsData = data.petitions;
      totalElements = data.total || data.petitions.length;
      totalPages = Math.ceil(totalElements / size);
    } else {
      console.warn('Unexpected API response structure');
      petitionsData = [];
    }

    console.log(`Extracted ${petitionsData.length} petitions`);

    // Map to standardized format
    const petitions = petitionsData.map((petition: any, index: number) => {
      return {
        id: petition.id?.toString() || petition.petitionId?.toString() || `petition-${page}-${index}`,
        petition_nbr: petition.petitionNumber || petition.petition_nbr || petition.number || (page * size) + index + 1,
        filing_date: petition.filingDate || petition.filing_date || petition.createdAt || new Date().toISOString().split('T')[0],
        official_title: petition.title || petition.official_title || petition.name || 'No title available',
        type: petition.type || petition.petitionType || 'PUBLIC',
        status: petition.status || petition.state || 'SIGNATURE_EN_COURS',
        association_role: petition.associationRole || petition.association_role || null,
        association_name: petition.associationName || petition.association_name || null,
        residency_country: petition.residencyCountry || petition.residency_country || 'Luxembourg',
        goal: petition.goal || petition.objective || petition.description || null,
        sign_nbr_electronic: petition.electronicSignatures || petition.sign_nbr_electronic || 0,
        sign_nbr_paper: petition.paperSignatures || petition.sign_nbr_paper || 0,
        motivation: petition.motivation || petition.reason || null,
        created_at: petition.createdAt || new Date().toISOString(),
        updated_at: petition.updatedAt || new Date().toISOString()
      };
    });

    const responseData = {
      petitions: petitions,
      pagination: {
        page: page,
        size: size,
        totalElements: totalElements,
        totalPages: totalPages,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0
      }
    };

    // Cache successful response
    setCachedResponse(cacheKey, responseData);
    
    console.log(`Successfully processed ${petitions.length} petitions`);
    console.log('=== ENHANCED PETITION FETCHER END ===');
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ENHANCED PETITION FETCHER ERROR ===');
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch petitions',
      message: error.message,
      timestamp: new Date().toISOString(),
      diagnostic: 'Enhanced proxy request failed - check function logs for details'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
