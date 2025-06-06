
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const clearExistingPetitions = async (supabase: any) => {
  console.log('Clearing existing petition data...');
  
  const { error: deleteError } = await supabase
    .from('petitions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (deleteError) {
    throw new Error(`Failed to clear existing data: ${deleteError.message}`);
  }

  console.log('Existing petition data cleared');
};

export const insertPetitionsInBatches = async (supabase: any, petitionsData: any[]) => {
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

  return { insertedCount, insertErrors };
};
