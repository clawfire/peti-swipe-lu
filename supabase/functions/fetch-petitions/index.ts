
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
    
    console.log('Fetching from URL:', apiUrl.toString());
    
    // Fetch petitions directly from Luxembourg government API
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response received, processing...');

    // Check if data has the expected structure
    let petitionsData: any[] = [];
    let totalElements = 0;
    let totalPages = 0;
    
    if (data.content && Array.isArray(data.content)) {
      // Spring Boot pagination format
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
    } else if (data.data && Array.isArray(data.data)) {
      petitionsData = data.data;
      totalElements = data.total || data.data.length;
      totalPages = Math.ceil(totalElements / size);
    } else {
      console.warn('Unexpected API response structure:', data);
      petitionsData = [];
    }

    console.log(`Found ${petitionsData.length} petitions in API response (total: ${totalElements})`);

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

    console.log(`Returning ${petitions.length} petitions for page ${page}`);
    
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
    console.error('Error in fetch-petitions function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch petitions',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
