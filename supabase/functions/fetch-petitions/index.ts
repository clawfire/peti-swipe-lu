
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

// Enhanced user agents that match real browsers exactly
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

// Enhanced session management with realistic browser fingerprinting
class SessionManager {
  private sessions = new Map();
  
  getSession(identifier: string) {
    if (!this.sessions.has(identifier)) {
      this.sessions.set(identifier, {
        userAgent: this.getRandomUserAgent(),
        cookies: [],
        sessionId: this.generateSessionId(),
        requestCount: 0,
        lastRequestTime: 0
      });
    }
    return this.sessions.get(identifier);
  }
  
  updateSession(identifier: string, cookies: string[]) {
    const session = this.getSession(identifier);
    session.cookies = cookies;
    session.requestCount++;
    session.lastRequestTime = Date.now();
    this.sessions.set(identifier, session);
  }
  
  getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }
  
  generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

const sessionManager = new SessionManager();

// Rate limiting check
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimits.has(identifier)) {
    rateLimits.set(identifier, []);
  }
  
  const requests = rateLimits.get(identifier).filter((time: number) => time > windowStart);
  
  if (requests.length >= 20) { // Reduced from 30 to be more conservative
    console.log(`Rate limit exceeded for ${identifier}`);
    return false;
  }
  
  requests.push(now);
  rateLimits.set(identifier, requests);
  return true;
}

// Realistic delay between requests
async function humanDelay() {
  const delay = 1000 + Math.random() * 2000; // 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, delay));
}

// Enhanced browser simulation strategy
async function makeBrowserLikeRequest(url: string, sessionId: string): Promise<Response> {
  const session = sessionManager.getSession(sessionId);
  
  console.log('Attempting browser-like request with enhanced simulation...');
  
  // Step 1: Make initial request to main site to establish session
  try {
    console.log('Step 1: Establishing session with main site...');
    const mainSiteResponse = await fetch('https://www.petitiounen.lu/', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': session.userAgent,
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
      redirect: 'follow',
    });
    
    console.log(`Main site response: ${mainSiteResponse.status}`);
    
    // Extract cookies from main site
    const setCookies = mainSiteResponse.headers.get('set-cookie');
    if (setCookies) {
      sessionManager.updateSession(sessionId, setCookies.split(','));
      console.log('Extracted cookies from main site');
    }
    
    // Wait like a human would
    await humanDelay();
    
  } catch (error) {
    console.log('Main site request failed, continuing anyway:', error.message);
  }
  
  // Step 2: Make request to petitions page to simulate navigation
  try {
    console.log('Step 2: Navigating to petitions page...');
    const petitionsPageResponse = await fetch('https://www.petitiounen.lu/petitions', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.petitiounen.lu/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': session.userAgent,
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        ...(session.cookies.length > 0 && { 'Cookie': session.cookies.join('; ') }),
      },
      redirect: 'follow',
    });
    
    console.log(`Petitions page response: ${petitionsPageResponse.status}`);
    
    // Wait like a human would
    await humanDelay();
    
  } catch (error) {
    console.log('Petitions page request failed, continuing anyway:', error.message);
  }
  
  // Step 3: Make the actual API request as if initiated by JavaScript on the page
  console.log('Step 3: Making API request...');
  const apiResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'Pragma': 'no-cache',
      'Referer': 'https://www.petitiounen.lu/petitions',
      'Origin': 'https://www.petitiounen.lu',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': session.userAgent,
      'X-Requested-With': 'XMLHttpRequest',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      ...(session.cookies.length > 0 && { 'Cookie': session.cookies.join('; ') }),
    },
    redirect: 'follow',
  });
  
  return apiResponse;
}

// Alternative API endpoints to try
async function tryAlternativeEndpoints(baseParams: URLSearchParams, sessionId: string): Promise<Response | null> {
  const alternativeEndpoints = [
    // Try without petitionGroup filter
    () => {
      const url = new URL('https://www.petitiounen.lu/petition-web-back-for-front/petitions');
      url.searchParams.set('language', baseParams.get('language') || 'FR');
      url.searchParams.set('page', baseParams.get('page') || '0');
      url.searchParams.set('size', baseParams.get('size') || '10');
      url.searchParams.set('sort', 'NUMBER,desc');
      return url.toString();
    },
    // Try with different sort
    () => {
      const url = new URL('https://www.petitiounen.lu/petition-web-back-for-front/petitions');
      url.searchParams.set('language', baseParams.get('language') || 'FR');
      url.searchParams.set('petitionGroup', 'ALL');
      url.searchParams.set('page', baseParams.get('page') || '0');
      url.searchParams.set('size', baseParams.get('size') || '10');
      url.searchParams.set('sort', 'FILING_DATE,desc');
      return url.toString();
    },
    // Try minimal parameters
    () => {
      const url = new URL('https://www.petitiounen.lu/petition-web-back-for-front/petitions');
      url.searchParams.set('language', baseParams.get('language') || 'FR');
      url.searchParams.set('page', '0');
      url.searchParams.set('size', '5');
      return url.toString();
    }
  ];
  
  for (const [index, getEndpoint] of alternativeEndpoints.entries()) {
    try {
      const endpoint = getEndpoint();
      console.log(`Trying alternative endpoint ${index + 1}: ${endpoint}`);
      
      const response = await makeBrowserLikeRequest(endpoint, sessionId);
      
      if (response.ok) {
        const responseText = await response.text();
        
        // Check if response contains JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          console.log(`Alternative endpoint ${index + 1} returned JSON data`);
          return new Response(responseText, {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Wait between attempts
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`Alternative endpoint ${index + 1} failed:`, error.message);
    }
  }
  
  return null;
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 3000
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
    const sessionId = `session_${clientIP}_${Date.now()}`;
    
    console.log(`Session ID: ${sessionId}`);
    
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
    
    console.log(`Request params: language=${language}, page=${page}, size=${size}`);
    
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
    
    let response: Response | null = null;
    
    // Strategy 1: Try the browser-like request with enhanced simulation
    try {
      response = await retryWithBackoff(
        () => makeBrowserLikeRequest(apiUrl.toString(), sessionId),
        2, // max retries
        3000 // base delay
      );
      
      console.log('Browser-like response status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Response length:', responseText.length);
        console.log('Response preview:', responseText.substring(0, 200));
        
        // Check if response contains JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          console.log('Primary strategy succeeded - got JSON data');
          
          // Parse and process the JSON
          const data = JSON.parse(responseText);
          const processedData = processApiResponse(data, page, size);
          
          // Cache successful response
          setCachedResponse(cacheKey, processedData);
          
          return new Response(JSON.stringify(processedData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.log('Primary strategy returned HTML instead of JSON');
          response = null;
        }
      }
    } catch (error) {
      console.log('Primary strategy failed:', error.message);
      response = null;
    }
    
    // Strategy 2: Try alternative endpoints
    if (!response) {
      console.log('Trying alternative endpoints...');
      response = await tryAlternativeEndpoints(apiUrl.searchParams, sessionId);
      
      if (response) {
        console.log('Alternative endpoint succeeded');
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        const processedData = processApiResponse(data, page, size);
        
        // Cache successful response
        setCachedResponse(cacheKey, processedData);
        
        return new Response(JSON.stringify(processedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // If all strategies failed, return mock data with a clear message
    console.log('All strategies failed, returning fallback data');
    
    const fallbackData = {
      petitions: [],
      pagination: {
        page: page,
        size: size,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      },
      message: 'The Luxembourg petition API is currently not accessible. This may be due to maintenance or access restrictions.',
      fallback: true
    };
    
    return new Response(JSON.stringify(fallbackData), {
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
      diagnostic: 'Enhanced proxy request failed - the Luxembourg API may be restricting access'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to process API response
function processApiResponse(data: any, page: number, size: number) {
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

  return {
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
}
