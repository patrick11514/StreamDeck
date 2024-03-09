import type { StreamDeck } from '@elgato-stream-deck/node'
import fs from 'node:fs/promises'
import Path from 'node:path'
import sharp from 'sharp'
import type { StreamDeckConfig } from './streamdeckConfig'

export const DYNAMIC_IMAGES_FOLDER = 'images'
export const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'] as const

//inputExt stats with .
export const isValidExtension = (inputExt: string): boolean => {
    return allowedExtensions.includes(inputExt.slice(1) as (typeof allowedExtensions)[number])
}

export const initializeDevice = async (device: StreamDeck, db: StreamDeckConfig) => {
    //clear panel
    await device.clearPanel()

    //add listeners
    device.addListener('down', (data) => {
        console.log('down', data)
    })
    device.addListener('up', (data) => {
        console.log('up', data)
    })

    //load icons
    const keys = db.getKeys()

    if (keys) {
        const promises: Promise<void>[] = []

        for (const key in keys) {
            //@todo
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const data = keys[key]

            if (data.icon) {
                promises.push(
                    (async () => {
                        const file = await fs.readFile(Path.join(DYNAMIC_IMAGES_FOLDER, db.serial, key + '.png'))
                        const data = await sharp(file).flatten().resize(device.ICON_SIZE, device.ICON_SIZE).raw().toBuffer()
                        await device.fillKeyBuffer(parseInt(key), data)
                    })()
                )
            }
        }

        Promise.all(promises)
    }
}
