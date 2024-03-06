import { procedure, router } from '../api'

export const Router = router({
    example: procedure.GET.query(() => {
        return 'Hello' as const
    })
})

export type AppRouter = typeof Router
