import type { AsyncReturnType, CreateContext } from '@patrick115/sveltekitapi'

export const createContext = (async () => {
    return {}
}) satisfies CreateContext

export type Context = AsyncReturnType<typeof createContext>
