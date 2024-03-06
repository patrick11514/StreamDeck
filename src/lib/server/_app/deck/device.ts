import { procedure } from '$lib/server/api'
import type { ResponseWithData } from '$types/types'
import { listStreamDecks } from '@elgato-stream-deck/node'

const devices = procedure.GET.query(async () => {
    const devices = await listStreamDecks()

    return {
        status: true,
        data: devices
    } satisfies ResponseWithData<typeof devices>
})

export default [devices]
