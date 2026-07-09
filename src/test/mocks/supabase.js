/**
 * Shared factory for mocking the Supabase client in Vitest/Jest.
 *
 * Allows test files to declaratively define expected table responses
 * without manually reconstructing complex .from().select() chains.
 *
 * @example
 * vi.mock('../lib/supabase', () => ({
 *   supabase: createSupabaseMock({
 *     stadium_state: { data: [{ id: 1 }], error: null },
 *     notifications: { data: [], error: null },
 *   }),
 * }));
 */
export function createSupabaseMock(tableResponses = {}) {
  const resolveTable = (tableName) =>
    Promise.resolve(tableResponses[tableName] ?? { data: [], error: null });

  return {
    from: (tableName) => ({
      select: () => {
        const queryChain = {
          eq: () => ({
            order: () => resolveTable(tableName),
            then: (onFulfilled) => resolveTable(tableName).then(onFulfilled),
          }),
          order: () => ({
            limit: () => resolveTable(tableName),
            then: (onFulfilled) => resolveTable(tableName).then(onFulfilled),
          }),
          then: (onFulfilled) => resolveTable(tableName).then(onFulfilled),
        };
        return queryChain;
      },
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      insert: () => Promise.resolve({ error: null }),
    }),

    channel: () => ({
      on: function () { return this; },
      subscribe: function () { return this; },
    }),
    removeChannel: () => {},
  };
}