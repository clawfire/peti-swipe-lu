
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== DIAGNOSTIC LOGGING START ===');
    console.log('Fetching petitions from Luxembourg API via Edge Function...');
    
    // Parse query parameters from the request URL
    const url = new URL(req.url);
    const language = url.searchParams.get('language') || 'FR';
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    console.log(`API request params: language=${language}, page=${page}, size=${size}`);
    
    // Construct the Luxembourg government API URL with required parameters
    const apiUrl = new URL('https://www.petitiounen.lu/petition-web-back-for-front/petitions');
    apiUrl.searchParams.set('language', language.toUpperCase());
    apiUrl.searchParams.set('petitionGroup', 'SIGNABLE');
    apiUrl.searchParams.set('count', 'false');
    apiUrl.searchParams.set('page', page.toString());
    apiUrl.searchParams.set('size', size.toString());
    apiUrl.searchParams.set('sort', 'NUMBER,desc');
    
    console.log('Final API URL:', apiUrl.toString());
    
    // Enhanced headers with browser-like user agent
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://www.petitiounen.lu/',
      'Origin': 'https://www.petitiounen.lu',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    // Fetch petitions directly from Luxembourg government API
    console.log('Making fetch request...');
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: headers,
    });
    
    console.log('Response received:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log('- URL:', response.url);
    console.log('- Redirected:', response.redirected);
    
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      
      // Try to read the response body as text to see what we're getting
      const errorText = await response.text();
      console.log('Error response body (first 500 chars):', errorText.substring(0, 500));
      
      throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`);
    }

    // Get the content type to understand what we're receiving
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    
    // Read response as text first to inspect what we're getting
    const responseText = await response.text();
    console.log('Response body length:', responseText.length);
    console.log('Response body start (first 200 chars):', responseText.substring(0, 200));
    console.log('Response body type check:');
    console.log('- Starts with <!DOCTYPE:', responseText.trim().startsWith('<!DOCTYPE'));
    console.log('- Starts with <html:', responseText.trim().startsWith('<html'));
    console.log('- Starts with {:', responseText.trim().startsWith('{'));
    console.log('- Starts with [:', responseText.trim().startsWith('['));
    
    // Check if we received HTML instead of JSON
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('PROBLEM IDENTIFIED: API returned HTML instead of JSON');
      console.log('This suggests the API endpoint is not accessible or returning an error page');
      
      // Try to extract error information from HTML if possible
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) {
        console.log('HTML page title:', titleMatch[1]);
      }
      
      throw new Error('API returned HTML error page instead of JSON data. The endpoint may be inaccessible or require different authentication.');
    }
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('JSON parsing successful');
      console.log('Parsed data structure:');
      console.log('- Type:', typeof data);
      console.log('- Is Array:', Array.isArray(data));
      console.log('- Keys:', Object.keys(data));
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError.message);
      console.log('Response is not valid JSON. Raw response:', responseText);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    // Check if data has the expected structure
    let petitionsData: any[] = [];
    let totalElements = 0;
    let totalPages = 0;
    
    console.log('Analyzing response structure...');
    
    if (data.content && Array.isArray(data.content)) {
      console.log('Found Spring Boot pagination format');
      petitionsData = data.content;
      totalElements = data.totalElements || 0;
      totalPages = data.totalPages || 0;
    } else if (Array.isArray(data)) {
      console.log('Found direct array format');
      petitionsData = data;
      totalElements = data.length;
      totalPages = 1;
    } else if (data.petitions && Array.isArray(data.petitions)) {
      console.log('Found petitions array format');
      petitionsData = data.petitions;
      totalElements = data.total || data.petitions.length;
      totalPages = Math.ceil(totalElements / size);
    } else if (data.data && Array.isArray(data.data)) {
      console.log('Found data array format');
      petitionsData = data.data;
      totalElements = data.total || data.data.length;
      totalPages = Math.ceil(totalElements / size);
    } else {
      console.warn('Unexpected API response structure:', JSON.stringify(data, null, 2));
      petitionsData = [];
    }

    console.log(`Found ${petitionsData.length} petitions in API response (total: ${totalElements})`);
    
    if (petitionsData.length > 0) {
      console.log('Sample petition structure:', JSON.stringify(petitionsData[0], null, 2));
    }

    // Map the API response to our Petition interface
    const petitions = petitionsData.map((petition: any, index: number) => {
      return {
        id: petition.id?.toString() || petition.petitionId?.toString() || `petition-${page}-${index}`,
        petition_nbr: petition.petitionNumber || petition.petition_nbr || petition.number || (page * size) + index + 1,
        filing_date: petition.filingDate || petition.filing_date || petition.createdAt || petition.created_at || new Date().toISOString().split('T')[0],
        official_title: petition.title || petition.official_title || petition.name || petition.subject || 'No title available',
        type: petition.type || petition.petitionType || 'PUBLIC',
        status: petition.status || petition.state || 'SIGNATURE_EN_COURS',
        association_role: petition.associationRole || petition.association_role || null,
        association_name: petition.associationName || petition.association_name || petition.organization || null,
        residency_country: petition.residencyCountry || petition.residency_country || petition.country || 'Luxembourg',
        goal: petition.goal || petition.objective || petition.description || null,
        sign_nbr_electronic: petition.electronicSignatures || petition.sign_nbr_electronic || petition.signatureCount || 0,
        sign_nbr_paper: petition.paperSignatures || petition.sign_nbr_paper || 0,
        motivation: petition.motivation || petition.reason || petition.details || null,
        created_at: petition.createdAt || petition.created_at || new Date().toISOString(),
        updated_at: petition.updatedAt || petition.updated_at || new Date().toISOString()
      };
    });

    console.log(`Successfully mapped ${petitions.length} petitions for page ${page}`);
    console.log('=== DIAGNOSTIC LOGGING END ===');
    
    // Return petitions with pagination metadata
    const response_data = {
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

    return new Response(JSON.stringify(response_data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR IN FETCH-PETITIONS FUNCTION ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch petitions',
      message: error.message,
      diagnostic: 'Check function logs for detailed information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
