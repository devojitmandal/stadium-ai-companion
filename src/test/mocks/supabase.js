/**
 * Shared factory for mocking the Supabase client in Vitest/Jest.
 * * Allows test files to declaratively define expected table responses 
 * without manually reconstructing complex .from().select() chains.
 *
 * @example
 * vi.mock('../lib/supabase', () => ({
 * supabase: createSupabaseMock({
 * stadium_state: { data: [{ id: 1 }], error: null },
 * notifications: { data: [], error: null },
 * }),
 * }));
 */
export function createSupabaseMock(tableResponses = {}) {
  // Helper to safely resolve the mock data for a requested table
  const resolveTable = (tableName) =>
    Promise.resolve(tableResponses[tableName] ?? { data: [], error: null });

  return {
    from: (tableName) => ({
      
      // --- READ OPERATIONS ---
      select: () => {
        const queryChain = {
          
          // Handles .select().eq(...)
          eq: () => ({
            order: () => resolveTable(tableName),
            // Resolves if the chain ends immediately after .eq()
            then: (onFulfilled) => resolveTable(tableName).then(onFulfilled), 
          }),
          
          // Handles .select().order(...)
          order: () => ({
            limit: () => resolveTable(tableName),
            // Resolves if the chain ends immediately after .order()
            then: (onFulfilled) => resolveTable(tableName).then(onFulfilled), 
          }),

          // Resolves if the chain ends immediately after .select()
          then: (onFulfilled) => resolveTable(tableName).then(onFulfilled),
        };
        
        return queryChain;
      },

      // --- WRITE OPERATIONS ---
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      
      insert: () => Promise.resolve({ error: null }),
    }),
  };
}