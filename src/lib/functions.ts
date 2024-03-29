import { browser } from '$app/environment'
import { writable } from 'svelte/store'
import Swal, { type SweetAlertOptions } from 'sweetalert2'

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const SwalAlert = async (data: SweetAlertOptions) => {
    if (!browser) {
        return {
            isConfirmed: false
        }
    }

    return Swal.fire({
        toast: true,
        position: 'top-end',
        timer: 2000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
        ...data
    })
}

export const defferedWritable = <T>(defaultValue: T, callback: (param: T) => void, time: number) => {
    const store = writable<T>(defaultValue)

    let timer: NodeJS.Timeout

    store.subscribe((value) => {
        clearTimeout(timer)
        timer = setTimeout(() => callback(value), time)
    })

    return store
}
