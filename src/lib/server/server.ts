import { APIServer } from '@patrick115/sveltekitapi'
import { Router } from './_app'
import { createContext } from './context'

export const Server = new APIServer({
    context: createContext,
    path: '/api',
    router: Router
})
