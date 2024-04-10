import type { Response, ResponseWithData } from '$/types/types'
import { z } from 'zod'
import { TSActions, TSNames } from '../../actions/TeamSpeakHandler'
import { protectedProcedure } from '../../api'

const actions = [...TSActions] as const

type RemoveReadonly<T> = {
    -readonly [P in keyof T]: T[P]
}

export type Actions = RemoveReadonly<typeof actions>

const actionNames = {
    ...TSNames
} satisfies Record<Actions[number], string>

export const actionSchema = z.enum(actions)
const schema = z.object({
    key: z.number(),
    action: actionSchema
})

const getActions = protectedProcedure.GET.query(async () => {
    return {
        status: true,
        data: {
            names: actionNames,
            actions: actions as Actions
        }
    } satisfies ResponseWithData<{
        names: typeof actionNames
        actions: Actions
    }>
})

const action = protectedProcedure.POST.input(schema).query(async ({ ctx, input }) => {
    ctx.db.setKeyData(input.key, 'action', input.action)

    return {
        status: true
    } satisfies Response
})

const removeAction = protectedProcedure.DELETE.input(z.number()).query(async ({ ctx, input }) => {
    ctx.db.setKeyData(input, 'action', undefined)

    return {
        status: true
    } satisfies Response
})

export default [action, getActions, removeAction]
