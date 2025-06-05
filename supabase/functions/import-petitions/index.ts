
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PetitionData {
  petition_nbr: number;
  filing_date: string;
  official_title: string;
  type: string;
  status: string;
  association_role?: string;
  association_name?: string;
  residency_country: string;
  goal?: string;
  sign_nbr_electronic: number;
  sign_nbr_paper: number;
  motivation?: string;
}

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const parseDate = (dateStr: string): string => {
  // Handle DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Handle YYYY-MM-DD format
  return dateStr;
};

const cleanText = (text: string): string => {
  return text.replace(/^["']|["']$/g, '').trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting petition import process...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch CSV data
    console.log('Fetching CSV data from Luxembourg open data portal...');
    const csvResponse = await fetch('https://data.public.lu/fr/datasets/r/6c43ab5c-8fc2-493b-822a-35793ac1c840');
    
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status} ${csvResponse.statusText}`);
    }

    const csvText = await csvResponse.text();
    console.log(`CSV data fetched successfully. Size: ${csvText.length} characters`);

    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Get headers from first line
    const headers = parseCsvLine(lines[0]).map(h => cleanText(h).toLowerCase());
    console.log('CSV headers:', headers);

    // Parse data rows
    const petitionsData: PetitionData[] = [];
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        
        // Skip empty lines
        if (values.every(v => !v.trim())) continue;

        // Map CSV columns to database fields
        const petition: PetitionData = {
          petition_nbr: parseInt(cleanText(values[headers.indexOf('numéro de pétition')] || values[0])) || 0,
          filing_date: parseDate(cleanText(values[headers.indexOf('date de dépôt')] || values[1] || '')),
          official_title: cleanText(values[headers.indexOf('titre officiel')] || values[2] || ''),
          type: cleanText(values[headers.indexOf('type')] || values[3] || ''),
          status: cleanText(values[headers.indexOf('statut')] || values[4] || ''),
          association_role: cleanText(values[headers.indexOf('rôle de l\'association')] || values[5] || '') || null,
          association_name: cleanText(values[headers.indexOf('nom de l\'association')] || values[6] || '') || null,
          residency_country: cleanText(values[headers.indexOf('pays de résidence')] || values[7] || ''),
          goal: cleanText(values[headers.indexOf('objet')] || values[8] || '') || null,
          sign_nbr_electronic: parseInt(cleanText(values[headers.indexOf('nombre de signatures électroniques')] || values[9] || '0')) || 0,
          sign_nbr_paper: parseInt(cleanText(values[headers.indexOf('nombre de signatures papier')] || values[10] || '0')) || 0,
          motivation: cleanText(values[headers.indexOf('motivation')] || values[11] || '') || null,
        };

        // Validate required fields
        if (!petition.official_title || !petition.filing_date || !petition.residency_country) {
          console.warn(`Skipping row ${i + 1}: Missing required fields`);
          errorCount++;
          continue;
        }

        petitionsData.push(petition);
      } catch (error) {
        console.error(`Error parsing row ${i + 1}:`, error);
        errorCount++;
      }
    }

    console.log(`Parsed ${petitionsData.length} valid petitions, ${errorCount} errors`);

    if (petitionsData.length === 0) {
      throw new Error('No valid petition data found in CSV');
    }

    // Begin transaction by clearing existing data and inserting new data
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
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < petitionsData.length; i += batchSize) {
      const batch = petitionsData.slice(i, i + batchSize);
      
      const { data, error: insertError } = await supabase
        .from('petitions')
        .insert(batch)
        .select('id');

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to insert batch starting at index ${i}: ${insertError.message}`);
      }

      insertedCount += data?.length || 0;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(petitionsData.length / batchSize)}: ${data?.length} records`);
    }

    console.log(`Import completed successfully. Total petitions imported: ${insertedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${insertedCount} petitions`,
        parsed: petitionsData.length,
        errors: errorCount,
        imported: insertedCount
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
