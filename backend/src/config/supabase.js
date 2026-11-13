
const { createClient } = require("@supabase/supabase-js");

// Get credentials from backend/.env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Make sure credentials exist
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables!");
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
