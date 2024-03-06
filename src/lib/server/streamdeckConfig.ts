import { configFileSchema, type ConfigFileSchema } from '$types/types'
import fs from 'node:fs'
import path from 'node:path'

export class StreamDeckConfig {
    private serial: string
    private filePath: string
    private content: ConfigFileSchema

    constructor(serial: string) {
        this.serial = serial
        this.filePath = path.join('configs', `${serial}.json`)

        if (!fs.existsSync('configs')) {
            fs.mkdirSync('configs')
        }

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(
                this.filePath,
                JSON.stringify({
                    serial,
                    brightness: 100
                } satisfies ConfigFileSchema)
            )
        }

        const data = fs.readFileSync(this.filePath, 'utf-8')

        const result = configFileSchema.safeParse(JSON.parse(data))

        if (!result.success) {
            throw new Error('Could not parse config file')
        }

        this.content = result.data
    }

    setBrightness(brightness: number) {
        const data = this.content
        data.brightness = brightness

        fs.writeFileSync(this.filePath, JSON.stringify(data))
    }
}
