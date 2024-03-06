import { router } from '../api'
import { deck } from './deck'

export const Router = router({
    deck
})

export type AppRouter = typeof Router
