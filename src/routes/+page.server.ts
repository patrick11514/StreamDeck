import { Server } from '$lib/server/server'
import type { PageServerLoad } from './$types'

export const load = (async (ev) => {
    return {
        devices: await Server.ssr.deck.device.GET(ev)
    }
}) satisfies PageServerLoad
