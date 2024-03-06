import { type StreamDeck } from '@elgato-stream-deck/node'
import type { AsyncReturnType, CreateContext } from '@patrick115/sveltekitapi'
import { StreamDeckConfig } from './streamdeckConfig'

export let device: undefined | StreamDeck = undefined
export let db: undefined | StreamDeckConfig = undefined

export const updateDevice = (newDevice: StreamDeck) => {
    device = newDevice
}

export const openDB = (serial: string) => {
    db = new StreamDeckConfig(serial)
}

export const closeDevice = () => {
    device = undefined
}

export const createContext = (async () => {
    if (!device || !db) {
        return {
            connected: false
        }
    }

    try {
        await device.getSerialNumber()

        return {
            connected: true,
            device,
            db
        }
    } catch (_) {
        closeDevice()

        return {
            connected: false
        }
    }
}) satisfies CreateContext

export type Context = AsyncReturnType<typeof createContext>
