
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JsonPetitionData, ImportResponse, ImportRequest } from './types.ts';
import { mapJsonToPetition } from './petitionMapper.ts';
import { clearExistingPetitions, insertPetitionsInBatches } from './databaseOperations.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    let bucketName = 'petitions-file';
    let fileName = 'petitions.json';
    
    try {
      const body: ImportRequest = await req.json();
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
    let petitionsArray: JsonPetitionData[];
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
    let thresholdReachedCount = 0;

    for (let i = 0; i < petitionsArray.length; i++) {
      const petition = mapJsonToPetition(petitionsArray[i], i + 1);
      if (petition) {
        petitionsData.push(petition);
        if (petition.status === 'SEUIL_ATTEINT') {
          thresholdReachedCount++;
        }
      } else {
        errorCount++;
      }
    }

    console.log(`Parsing completed: ${petitionsData.length} valid petitions, ${errorCount} errors, ${thresholdReachedCount} reached threshold`);

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
    await clearExistingPetitions(supabase);

    // Insert new petitions in batches
    const { insertedCount, insertErrors } = await insertPetitionsInBatches(supabase, petitionsData);

    console.log(`Import completed. Total petitions imported: ${insertedCount}, insert errors: ${insertErrors}, petitions with threshold reached: ${thresholdReachedCount}`);

    const response: ImportResponse = {
      success: true,
      message: `Successfully imported ${insertedCount} petitions from JSON`,
      totalRecords: petitionsArray.length,
      parsed: petitionsData.length,
      parseErrors: errorCount,
      imported: insertedCount,
      insertErrors: insertErrors,
      thresholdReached: thresholdReachedCount
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import error:', error);
    
    const errorResponse: ImportResponse = {
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
