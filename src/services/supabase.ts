import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://txvqxjrjbmjwhgddztma.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dnF4anJqYm1qd2hnZGR6dG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODEyMzIsImV4cCI6MjA4Nzc1NzIzMn0.P4gDgIMdxkHvvCLQa0B2UzpbICW8M4Z6AgEswnRGaPE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
