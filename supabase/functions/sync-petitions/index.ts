
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LuxembourgPetition {
  petition_nbr: number;
  official_title: string;
  type: string;
  status: string;
  filing_date: string;
  goal?: string;
  motivation?: string;
  association_name?: string;
  association_role?: string;
  residency_country: string;
  sign_nbr_electronic?: number;
  sign_nbr_paper?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting petition sync from Luxembourg government API...')

    // Fetch petitions from Luxembourg government API
    const apiUrl = 'https://data.public.lu/api/1/datasets/petitions-publiques/'
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Fetched data from Luxembourg API:', data.resources?.length || 0, 'resources found')

    // Find the most recent CSV resource
    const csvResource = data.resources?.find((resource: any) => 
      resource.format?.toLowerCase() === 'csv' && resource.url
    )

    if (!csvResource) {
      throw new Error('No CSV resource found in the API response')
    }

    console.log('Found CSV resource:', csvResource.url)

    // Fetch the CSV data
    const csvResponse = await fetch(csvResource.url)
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status}`)
    }

    const csvText = await csvResponse.text()
    console.log('CSV data length:', csvText.length)

    // Parse CSV manually (simple parsing for this specific format)
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    console.log('CSV headers:', headers)

    const petitions: LuxembourgPetition[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV parsing - handle quoted fields
      const values = []
      let currentValue = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim()) // Don't forget the last value

      if (values.length >= headers.length) {
        const petition: any = {}
        
        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, '') || ''
          
          switch (header.toLowerCase()) {
            case 'petition_nbr':
            case 'petition number':
              petition.petition_nbr = parseInt(value) || 0
              break
            case 'official_title':
            case 'title':
              petition.official_title = value
              break
            case 'type':
              petition.type = value || 'PUBLIC'
              break
            case 'status':
              petition.status = value || 'SIGNATURE_EN_COURS'
              break
            case 'filing_date':
            case 'date':
              petition.filing_date = value
              break
            case 'goal':
              petition.goal = value
              break
            case 'motivation':
              petition.motivation = value
              break
            case 'association_name':
              petition.association_name = value
              break
            case 'association_role':
              petition.association_role = value
              break
            case 'residency_country':
            case 'country':
              petition.residency_country = value || 'Luxembourg'
              break
            case 'sign_nbr_electronic':
            case 'electronic_signatures':
              petition.sign_nbr_electronic = parseInt(value) || 0
              break
            case 'sign_nbr_paper':
            case 'paper_signatures':
              petition.sign_nbr_paper = parseInt(value) || 0
              break
          }
        })

        if (petition.petition_nbr && petition.official_title) {
          petitions.push(petition as LuxembourgPetition)
        }
      }
    }

    console.log('Parsed petitions:', petitions.length)

    if (petitions.length === 0) {
      throw new Error('No valid petitions found in CSV data')
    }

    // Insert/update petitions in batches to avoid conflicts
    let insertedCount = 0
    let updatedCount = 0
    
    for (const petition of petitions) {
      try {
        // Try to upsert the petition
        const { data, error } = await supabaseClient
          .from('petitions')
          .upsert(petition, { 
            onConflict: 'petition_nbr',
            ignoreDuplicates: false 
          })
          .select()

        if (error) {
          console.error('Error upserting petition:', error, petition.petition_nbr)
          continue
        }

        if (data && data.length > 0) {
          insertedCount++
        }
      } catch (err) {
        console.error('Exception upserting petition:', err, petition.petition_nbr)
        continue
      }
    }

    console.log(`Sync completed: ${insertedCount} petitions processed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: insertedCount,
        total: petitions.length,
        message: `Successfully synced ${insertedCount} petitions from Luxembourg government API`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in sync-petitions function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
