
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
  if (!dateStr || dateStr.trim() === '') {
    return '';
  }
  
  // Handle DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    if (day && month && year && !isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Handle YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  return '';
};

const parseNumber = (numStr: string): number => {
  if (!numStr || numStr.trim() === '' || numStr.toLowerCase() === 'null' || numStr.toLowerCase() === 'undefined') {
    return 0;
  }
  
  const cleaned = numStr.replace(/[^\d.-]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

const cleanText = (text: string): string => {
  if (!text) return '';
  return text.replace(/^["']|["']$/g, '').trim();
};

const isValidText = (text: string): boolean => {
  return text && text.trim().length > 0 && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined';
};

const mapCsvToPetition = (values: string[], headers: string[], rowIndex: number): PetitionData | null => {
  try {
    // Find column indices
    const getColumnValue = (columnName: string): string => {
      const index = headers.indexOf(columnName);
      return index >= 0 && index < values.length ? cleanText(values[index]) : '';
    };

    // Extract and clean values
    const petitionNbrStr = getColumnValue('petition_nbr') || getColumnValue('numéro de pétition') || values[0] || '';
    const filingDateStr = getColumnValue('filing_date') || getColumnValue('date de dépôt') || values[1] || '';
    const officialTitle = getColumnValue('official_title') || getColumnValue('titre officiel') || values[2] || '';
    const type = getColumnValue('type') || values[3] || '';
    const status = getColumnValue('status') || getColumnValue('statut') || values[4] || '';
    const associationRole = getColumnValue('association_role') || getColumnValue('rôle de l\'association') || values[5] || '';
    const associationName = getColumnValue('association_name') || getColumnValue('nom de l\'association') || values[6] || '';
    const residencyCountry = getColumnValue('residency_country') || getColumnValue('pays de résidence') || values[7] || '';
    const goal = getColumnValue('goal') || getColumnValue('objet') || values[8] || '';
    const signElectronicStr = getColumnValue('sign_nbr_electronic') || getColumnValue('nombre de signatures électroniques') || values[9] || '0';
    const signPaperStr = getColumnValue('sign_nbr_paper') || getColumnValue('nombre de signatures papier') || values[10] || '0';
    const motivation = getColumnValue('motivation') || values[11] || '';

    // Validate required fields
    if (!isValidText(officialTitle)) {
      console.warn(`Row ${rowIndex}: Missing or invalid official_title: "${officialTitle}"`);
      return null;
    }

    const parsedDate = parseDate(filingDateStr);
    if (!parsedDate) {
      console.warn(`Row ${rowIndex}: Missing or invalid filing_date: "${filingDateStr}"`);
      return null;
    }

    if (!isValidText(residencyCountry)) {
      console.warn(`Row ${rowIndex}: Missing or invalid residency_country: "${residencyCountry}"`);
      return null;
    }

    if (!isValidText(type)) {
      console.warn(`Row ${rowIndex}: Missing or invalid type: "${type}"`);
      return null;
    }

    if (!isValidText(status)) {
      console.warn(`Row ${rowIndex}: Missing or invalid status: "${status}"`);
      return null;
    }

    // Parse petition number
    const petitionNbr = parseNumber(petitionNbrStr);
    if (petitionNbr === 0) {
      console.warn(`Row ${rowIndex}: Invalid petition_nbr: "${petitionNbrStr}"`);
      return null;
    }

    // Build the petition object
    const petition: PetitionData = {
      petition_nbr: petitionNbr,
      filing_date: parsedDate,
      official_title: officialTitle,
      type: type,
      status: status,
      association_role: isValidText(associationRole) ? associationRole : null,
      association_name: isValidText(associationName) ? associationName : null,
      residency_country: residencyCountry,
      goal: isValidText(goal) ? goal : null,
      sign_nbr_electronic: parseNumber(signElectronicStr),
      sign_nbr_paper: parseNumber(signPaperStr),
      motivation: isValidText(motivation) ? motivation : null,
    };

    console.log(`Row ${rowIndex}: Successfully parsed petition ${petition.petition_nbr}`);
    return petition;

  } catch (error) {
    console.error(`Row ${rowIndex}: Parsing error:`, error);
    return null;
  }
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

    // Get headers from first line and normalize them
    const rawHeaders = parseCsvLine(lines[0]);
    const headers = rawHeaders.map(h => {
      const cleaned = cleanText(h).toLowerCase();
      // Map French headers to English equivalents
      const headerMap: { [key: string]: string } = {
        'numéro de pétition': 'petition_nbr',
        'date de dépôt': 'filing_date',
        'titre officiel': 'official_title',
        'type': 'type',
        'statut': 'status',
        'rôle de l\'association': 'association_role',
        'nom de l\'association': 'association_name',
        'pays de résidence': 'residency_country',
        'objet': 'goal',
        'nombre de signatures électroniques': 'sign_nbr_electronic',
        'nombre de signatures papier': 'sign_nbr_paper',
        'motivation': 'motivation'
      };
      return headerMap[cleaned] || cleaned;
    });
    
    console.log('CSV headers:', headers);

    // Parse data rows
    const petitionsData: PetitionData[] = [];
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      
      // Skip completely empty lines
      if (values.every(v => !v.trim())) {
        skippedCount++;
        continue;
      }

      const petition = mapCsvToPetition(values, headers, i + 1);
      if (petition) {
        petitionsData.push(petition);
      } else {
        errorCount++;
      }
    }

    console.log(`Parsing completed: ${petitionsData.length} valid petitions, ${errorCount} errors, ${skippedCount} empty rows skipped`);

    if (petitionsData.length === 0) {
      throw new Error('No valid petition data found in CSV');
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
    const batchSize = 50; // Reduced batch size for better error handling
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
                console.error(`Failed to insert petition ${petition.petition_nbr}:`, singleError);
                insertErrors++;
              } else {
                insertedCount++;
              }
            } catch (singleErr) {
              console.error(`Exception inserting petition ${petition.petition_nbr}:`, singleErr);
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
        message: `Successfully imported ${insertedCount} petitions`,
        totalRows: lines.length - 1,
        parsed: petitionsData.length,
        parseErrors: errorCount,
        skipped: skippedCount,
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
