
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
    
    // Fetch petitions directly from Luxembourg government API
    const response = await fetch('https://www.petitiounen.lu/petition-web-back-for-front/petitions', {
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

    // Check if data is an array or has a petitions property
    let petitionsData: any[] = [];
    
    if (Array.isArray(data)) {
      petitionsData = data;
    } else if (data.petitions && Array.isArray(data.petitions)) {
      petitionsData = data.petitions;
    } else if (data.data && Array.isArray(data.data)) {
      petitionsData = data.data;
    } else {
      console.warn('Unexpected API response structure:', data);
      petitionsData = [];
    }

    console.log(`Found ${petitionsData.length} petitions in API response`);

    // Map the API response to our Petition interface
    const petitions = petitionsData.map((petition: any, index: number) => {
      return {
        id: petition.id?.toString() || petition.petitionId?.toString() || `petition-${index}`,
        petition_nbr: petition.petitionNumber || petition.petition_nbr || petition.number || index + 1,
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

    // Filter for active petitions only
    const activePetitions = petitions.filter((petition: any) => 
      petition.status === 'SIGNATURE_EN_COURS' || 
      petition.status === 'SEUIL_ATTEINT' ||
      petition.status === 'ACTIVE' ||
      petition.status === 'OPEN'
    );

    console.log(`Returning ${activePetitions.length} active petitions`);
    
    // Return all petitions if no active ones found, otherwise return active ones
    const resultPetitions = activePetitions.length === 0 ? petitions : activePetitions;

    return new Response(JSON.stringify(resultPetitions), {
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
