import { router } from '../api'
import { deck } from './deck'
import { upload } from './upload'

export const Router = router({
    deck,
    upload
})

export type AppRouter = typeof Router
