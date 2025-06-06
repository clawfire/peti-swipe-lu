
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JsonPetitionData {
  id?: string;
  petitionNumber?: number;
  filingDate?: string;
  officialTitle?: {
    de?: string;
    en?: string;
    fr?: string;
  };
  type?: string;
  status?: string;
  associationRole?: string;
  associationName?: string;
  residencyCountry?: string;
  purpose?: {
    de?: string;
    en?: string;
    fr?: string;
  };
  signatureStartDate?: string;
  signatureEndDate?: string;
  signaturesRequired?: number;
  electronicSignatures?: number;
  paperSignatures?: number;
  motivation?: string;
  isClosed?: boolean;
  url?: string;
}

const parseDate = (dateStr: string | undefined): string | null => {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  // Handle various date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

const mapJsonToPetition = (jsonData: JsonPetitionData, index: number): any | null => {
  try {
    // Validate required fields
    if (!jsonData.officialTitle?.fr && !jsonData.officialTitle?.en && !jsonData.officialTitle?.de) {
      console.warn(`Record ${index}: Missing official title`);
      return null;
    }

    if (!jsonData.filingDate) {
      console.warn(`Record ${index}: Missing filing date`);
      return null;
    }

    if (!jsonData.residencyCountry) {
      console.warn(`Record ${index}: Missing residency country`);
      return null;
    }

    if (!jsonData.type) {
      console.warn(`Record ${index}: Missing type`);
      return null;
    }

    if (!jsonData.status) {
      console.warn(`Record ${index}: Missing status`);
      return null;
    }

    const parsedFilingDate = parseDate(jsonData.filingDate);
    if (!parsedFilingDate) {
      console.warn(`Record ${index}: Invalid filing date: "${jsonData.filingDate}"`);
      return null;
    }

    // Build the petition object
    const petition = {
      external_id: jsonData.id || null,
      petition_nbr: jsonData.petitionNumber || null,
      filing_date: parsedFilingDate,
      official_title: jsonData.officialTitle?.fr || jsonData.officialTitle?.en || jsonData.officialTitle?.de || '',
      title_de: jsonData.officialTitle?.de || null,
      title_en: jsonData.officialTitle?.en || null,
      title_fr: jsonData.officialTitle?.fr || null,
      type: jsonData.type,
      status: jsonData.status,
      association_role: jsonData.associationRole || null,
      association_name: jsonData.associationName || null,
      residency_country: jsonData.residencyCountry,
      purpose: jsonData.purpose?.fr || jsonData.purpose?.en || jsonData.purpose?.de || null,
      purpose_de: jsonData.purpose?.de || null,
      purpose_en: jsonData.purpose?.en || null,
      purpose_fr: jsonData.purpose?.fr || null,
      signature_start_date: parseDate(jsonData.signatureStartDate),
      signature_end_date: parseDate(jsonData.signatureEndDate),
      signatures_required: jsonData.signaturesRequired || null,
      sign_nbr_electronic: jsonData.electronicSignatures || 0,
      sign_nbr_paper: jsonData.paperSignatures || 0,
      motivation: jsonData.motivation || null,
      is_closed: jsonData.isClosed || false,
      url: jsonData.url || null,
    };

    console.log(`Record ${index}: Successfully parsed petition ${petition.external_id || petition.petition_nbr}`);
    return petition;

  } catch (error) {
    console.error(`Record ${index}: Parsing error:`, error);
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting JSON petition import process...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body to see if a specific file was requested
    let bucketName = 'petitions';
    let fileName = 'petitions.json';
    
    try {
      const body = await req.json();
      if (body.bucketName) bucketName = body.bucketName;
      if (body.fileName) fileName = body.fileName;
    } catch {
      // Use defaults if no body or invalid JSON
    }

    console.log(`Fetching JSON data from storage bucket: ${bucketName}/${fileName}`);
    
    // Fetch JSON data from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (fileError) {
      throw new Error(`Failed to fetch JSON file: ${fileError.message}`);
    }

    const jsonText = await fileData.text();
    console.log(`JSON data fetched successfully. Size: ${jsonText.length} characters`);

    // Parse JSON
    let jsonData;
    try {
      jsonData = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }

    // Ensure data is an array
    const petitionsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    if (petitionsArray.length === 0) {
      throw new Error('JSON file contains no petition data');
    }

    console.log(`Found ${petitionsArray.length} petition records in JSON`);

    // Parse data
    const petitionsData: any[] = [];
    let errorCount = 0;

    for (let i = 0; i < petitionsArray.length; i++) {
      const petition = mapJsonToPetition(petitionsArray[i], i + 1);
      if (petition) {
        petitionsData.push(petition);
      } else {
        errorCount++;
      }
    }

    console.log(`Parsing completed: ${petitionsData.length} valid petitions, ${errorCount} errors`);

    if (petitionsData.length === 0) {
      throw new Error('No valid petition data found in JSON');
    }

    // Show sample of parsed data for debugging
    if (petitionsData.length > 0) {
      console.log('Sample parsed petition:', JSON.stringify(petitionsData[0], null, 2));
    }

    // Begin database transaction
    console.log('Starting database transaction...');
    
    // Delete existing petitions
    const { error: deleteError } = await supabase
      .from('petitions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      throw new Error(`Failed to clear existing data: ${deleteError.message}`);
    }

    console.log('Existing petition data cleared');

    // Insert new petitions in batches
    const batchSize = 50;
    let insertedCount = 0;
    let insertErrors = 0;

    for (let i = 0; i < petitionsData.length; i += batchSize) {
      const batch = petitionsData.slice(i, i + batchSize);
      
      try {
        const { data, error: insertError } = await supabase
          .from('petitions')
          .insert(batch)
          .select('id');

        if (insertError) {
          console.error(`Insert error for batch ${Math.floor(i / batchSize) + 1}:`, insertError);
          insertErrors++;
          
          // Try inserting individual records to identify problematic ones
          for (const petition of batch) {
            try {
              const { data: singleData, error: singleError } = await supabase
                .from('petitions')
                .insert([petition])
                .select('id');
              
              if (singleError) {
                console.error(`Failed to insert petition ${petition.external_id || petition.petition_nbr}:`, singleError);
                insertErrors++;
              } else {
                insertedCount++;
              }
            } catch (singleErr) {
              console.error(`Exception inserting petition ${petition.external_id || petition.petition_nbr}:`, singleErr);
              insertErrors++;
            }
          }
        } else {
          insertedCount += data?.length || 0;
          console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(petitionsData.length / batchSize)}: ${data?.length} records`);
        }
      } catch (batchError) {
        console.error(`Batch insert exception for batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        insertErrors++;
      }
    }

    console.log(`Import completed. Total petitions imported: ${insertedCount}, insert errors: ${insertErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${insertedCount} petitions from JSON`,
        totalRecords: petitionsArray.length,
        parsed: petitionsData.length,
        parseErrors: errorCount,
        imported: insertedCount,
        insertErrors: insertErrors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
