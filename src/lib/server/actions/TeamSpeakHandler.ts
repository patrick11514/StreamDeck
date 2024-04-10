import { Client, TS5WSConnector } from 'ts5api'

export const TSActions = [
    //teamspeak
    // ['mute_mic', 'unmute_mic', 'toggle_mic', 'mute_output', 'unmute_output', 'toggle_output']
    'teamspeak:mute_mic',
    'teamspeak:unmute_mic',
    'teamspeak:toggle_mic',
    'teamspeak:mute_hearing',
    'teamspeak:unmute_hearing',
    'teamspeak:toggle_hearing'
] as const

export const TSNames = {
    'teamspeak:mute_mic': 'Mute Microphone (Teamspeak)',
    'teamspeak:unmute_mic': 'Unmute Microphone (Teamspeak)',
    'teamspeak:toggle_mic': 'Toggle Microphone (Teamspeak)',
    'teamspeak:mute_hearing': 'Mute Output (Teamspeak)',
    'teamspeak:unmute_hearing': 'Unmute Output (Teamspeak)',
    'teamspeak:toggle_hearing': 'Toggle Output (Teamspeak)'
} satisfies Record<(typeof TSActions)[number], string>

export class TeamSpeakHandler {
    connector: TS5WSConnector
    you!: Client

    constructor() {
        this.connector = new TS5WSConnector({
            name: 'StreamDeck',
            identifier: 'cz.patrick115.streamdeck',
            version: process.version,
            description: 'StreamDeck plugin for TeamSpeak 5'
        })

        this.connector.on('connect', (connection) => {
            this.you = connection.you
        })

        this.connector.connect()
    }

    public handlePress(action: (typeof TSActions)[number]) {
        const name = action.split(':')[1]

        this.you.pressButton(name)
    }

    public handleRelease(action: (typeof TSActions)[number]) {
        const name = action.split(':')[1]

        this.you.releaseButton(name)
    }
}
