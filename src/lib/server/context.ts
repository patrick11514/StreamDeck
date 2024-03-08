import { type StreamDeck } from '@elgato-stream-deck/node'
import type { AsyncReturnType, CreateContext } from '@patrick115/sveltekitapi'
import { StreamDeckConfig } from './streamdeckConfig'
import { initializeDevice } from './variables'

export let device: undefined | StreamDeck = undefined
export let db: undefined | StreamDeckConfig = undefined
let serial = ''

export const updateDevice = async (newDevice: StreamDeck) => {
    device = newDevice
    serial = await device.getSerialNumber()

    await initializeDevice(device, openDB(serial))
}

export const openDB = (serial: string) => {
    return (db = new StreamDeckConfig(serial))
}

export const closeDevice = async () => {
    device?.removeAllListeners()
    device?.resetToLogo()
    device = undefined
}

export const createContext = (async (): Promise<
    | {
          connected: false
      }
    | {
          connected: true
          device: StreamDeck
          db: StreamDeckConfig
          serial: string
      }
> => {
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
            db,
            serial
        }
    } catch (_) {
        closeDevice()

        return {
            connected: false
        }
    }
}) satisfies CreateContext

export type Context = AsyncReturnType<typeof createContext>
