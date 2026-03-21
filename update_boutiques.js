const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateBoutiques() {
  const { data: boutiques, error: fetchError } = await supabase.from('boutiques').select('*');
  
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  console.log('Current boutiques:', boutiques);

  // Assuming we only have 2 boutiques, or we can map them by name
  // If we have specific IDs, I would use them.
  // Since I don't see the IDs yet, I'll update by their common previous names or simply in order.
  
  if (boutiques.length >= 2) {
    const { error: error1 } = await supabase.from('boutiques').update({ name: "Ets la championne Ségbé" }).eq('id', boutiques[0].id);
    const { error: error2 } = await supabase.from('boutiques').update({ name: "Ets la championne Sanguera" }).eq('id', boutiques[1].id);
    
    if (error1) console.error('Update 1 error:', error1);
    if (error2) console.error('Update 2 error:', error2);
    
    if (!error1 && !error2) {
      console.log('Successfully updated both boutiques.');
    }
  } else {
    console.log('Not enough boutiques found.');
  }
}

updateBoutiques();
