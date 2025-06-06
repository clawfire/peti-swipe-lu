import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JsonPetitionData {
  // Handle various possible field names from different JSON structures
  id?: string;
  number?: number; // Updated to match actual JSON field
  petitionNumber?: number;
  petition_number?: number;
  petition_nbr?: number;
  filingDate?: string;
  filing_date?: string;
  date?: string;
  depositDate?: string; // Added for deposit date
  officialTitle?: string;
  official_title?: string;
  title?: string;
  type?: string;
  status?: string;
  associationRole?: string;
  association_role?: string;
  associationName?: string;
  association_name?: string;
  residencyCountry?: string;
  residency_country?: string;
  country?: string;
  goal?: string;
  purpose?: string;
  signatureStartDate?: string;
  signature_start_date?: string;
  signatureFrom?: string; // Added for signature start
  signatureEndDate?: string;
  signature_end_date?: string;
  signatureTo?: string; // Added for signature end
  signaturesRequired?: number;
  signatures_required?: number;
  electronicalSignatureCount?: number; // Updated to match actual JSON field
  electronicSignatures?: number;
  electronic_signatures?: number;
  sign_nbr_electronic?: number;
  paperSignatureCount?: number; // Updated to match actual JSON field
  paperSignatures?: number;
  paper_signatures?: number;
  sign_nbr_paper?: number;
  motivation?: string;
  isClosed?: boolean;
  is_closed?: boolean;
  closed?: boolean;
  url?: string;
  [key: string]: any; // Allow for additional fields
}

const parseDate = (dateStr: string | undefined): string | null => {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  // Handle ISO date strings with time
  if (dateStr.includes('T')) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
  }
  
  // Handle various date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

const getFieldValue = (data: JsonPetitionData, ...fieldNames: string[]): any => {
  for (const fieldName of fieldNames) {
    if (data[fieldName] !== undefined && data[fieldName] !== null && data[fieldName] !== '') {
      return data[fieldName];
    }
  }
  return null;
};

const mapJsonToPetition = (jsonData: JsonPetitionData, index: number): any | null => {
  try {
    console.log(`Processing record ${index}:`, JSON.stringify(jsonData, null, 2));

    // Get title from multiple possible field names
    const officialTitle = getFieldValue(jsonData, 'officialTitle', 'official_title', 'title');
    if (!officialTitle) {
      console.warn(`Record ${index}: Missing official title`);
      return null;
    }

    // Get date from multiple possible field names - try depositDate first, then others
    const filingDateStr = getFieldValue(jsonData, 'depositDate', 'filingDate', 'filing_date', 'date');
    let parsedFilingDate = null;
    
    if (filingDateStr) {
      parsedFilingDate = parseDate(filingDateStr);
      if (!parsedFilingDate) {
        console.warn(`Record ${index}: Invalid filing date: "${filingDateStr}"`);
      }
    }

    // If no filing date is found, use current date as fallback
    if (!parsedFilingDate) {
      parsedFilingDate = new Date().toISOString().split('T')[0];
      console.warn(`Record ${index}: No valid filing date found, using current date as fallback`);
    }

    // Get other fields with fallbacks
    const type = getFieldValue(jsonData, 'type') || 'Unknown';
    const status = getFieldValue(jsonData, 'status') || 'Unknown';
    const residencyCountry = getFieldValue(jsonData, 'residencyCountry', 'residency_country', 'country') || 'Luxembourg';

    // Build the petition object
    const petition = {
      external_id: getFieldValue(jsonData, 'id') || null,
      petition_nbr: getFieldValue(jsonData, 'number', 'petitionNumber', 'petition_number', 'petition_nbr') || null, // Updated field order
      filing_date: parsedFilingDate,
      official_title: officialTitle,
      title: officialTitle, // Map to the single title field
      type: type,
      status: status,
      association_role: getFieldValue(jsonData, 'associationRole', 'association_role') || null,
      association_name: getFieldValue(jsonData, 'associationName', 'association_name') || null,
      residency_country: residencyCountry,
      purpose: getFieldValue(jsonData, 'goal', 'purpose') || null, // Simplified to single purpose field
      signature_start_date: parseDate(getFieldValue(jsonData, 'signatureFrom', 'signatureStartDate', 'signature_start_date')),
      signature_end_date: parseDate(getFieldValue(jsonData, 'signatureTo', 'signatureEndDate', 'signature_end_date')),
      signatures_required: getFieldValue(jsonData, 'signaturesRequired', 'signatures_required') || null,
      sign_nbr_electronic: getFieldValue(jsonData, 'electronicalSignatureCount', 'electronicSignatures', 'electronic_signatures', 'sign_nbr_electronic') || 0, // Updated field order
      sign_nbr_paper: getFieldValue(jsonData, 'paperSignatureCount', 'paperSignatures', 'paper_signatures', 'sign_nbr_paper') || 0, // Updated field order
      motivation: getFieldValue(jsonData, 'motivation') || null,
      is_closed: getFieldValue(jsonData, 'isClosed', 'is_closed', 'closed') || false,
      url: getFieldValue(jsonData, 'url') || null,
    };

    console.log(`Record ${index}: Successfully parsed petition:`, JSON.stringify(petition, null, 2));
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
    let bucketName = 'petitions-file'; // Changed default to match your bucket
    let fileName = 'petitions.json';
    
    try {
      const body = await req.json();
      if (body.bucketName) bucketName = body.bucketName;
      if (body.fileName) fileName = body.fileName;
      console.log(`Using bucket: ${bucketName}, file: ${fileName}`);
    } catch {
      console.log(`Using default bucket: ${bucketName}, file: ${fileName}`);
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

    // Handle different JSON structures - could be array or object with array property
    let petitionsArray;
    if (Array.isArray(jsonData)) {
      petitionsArray = jsonData;
    } else if (jsonData.petitions && Array.isArray(jsonData.petitions)) {
      petitionsArray = jsonData.petitions;
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      petitionsArray = jsonData.data;
    } else {
      // If it's a single object, wrap it in an array
      petitionsArray = [jsonData];
    }
    
    if (petitionsArray.length === 0) {
      throw new Error('JSON file contains no petition data');
    }

    console.log(`Found ${petitionsArray.length} petition records in JSON`);

    // Show sample of first record for debugging
    if (petitionsArray.length > 0) {
      console.log('Sample raw record:', JSON.stringify(petitionsArray[0], null, 2));
    }

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
