import type { StreamDeck } from '@elgato-stream-deck/node'
import fs from 'node:fs/promises'
import Path from 'node:path'
import sharp from 'sharp'
import { TeamSpeakHandler } from './actions/TeamSpeakHandler'
import { device } from './context'
import type { StreamDeckConfig } from './streamdeckConfig'

export const DYNAMIC_IMAGES_FOLDER = 'images'
export const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'] as const

//inputExt stats with .
export const isValidExtension = (inputExt: string): boolean => {
    return allowedExtensions.includes(inputExt.slice(1) as (typeof allowedExtensions)[number])
}

let teamspeakHandler: TeamSpeakHandler

export const initializeDevice = async (device: StreamDeck, db: StreamDeckConfig) => {
    //clear panel
    await device.clearPanel()

    if (teamspeakHandler) {
        teamspeakHandler.connector.disconnect()
    }

    teamspeakHandler = new TeamSpeakHandler()

    //add listeners
    device.addListener('down', (data) => {
        if (!db.existsKey(data)) {
            return
        }

        const keyData = db.getKey(data)

        if (!keyData || keyData.action === undefined) {
            return
        }

        //handle action
        if (keyData.action.startsWith('teamspeak')) {
            teamspeakHandler.handlePress(keyData.action)
        }
    })
    device.addListener('up', (data) => {
        if (!db.existsKey(data)) {
            return
        }

        const keyData = db.getKey(data)

        if (!keyData || keyData.action === undefined) {
            return
        }

        //handle action
        if (keyData.action.startsWith('teamspeak')) {
            teamspeakHandler.handleRelease(keyData.action)
        }
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

//If application stops/crashes, reset streamdeck back to logo
export const setupCleanUpFunctions = () => {
    // do app specific cleaning before exiting
    process.on('exit', function () {
        if (device !== undefined) {
            device.resetToLogo()
        }
    })

    // catch ctrl+c event and exit normally
    process.on('SIGINT', function () {
        process.exit(2)
    })

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function (e) {
        console.log(e.stack)
        process.exit(99)
    })
}

setupCleanUpFunctions()
