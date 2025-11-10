// Type helper to fix Supabase update type issues
// This is a known issue with Supabase generated types where update() infers 'never'
// See: https://github.com/supabase/supabase/issues

export type SupabaseUpdate<T> = Partial<T>

