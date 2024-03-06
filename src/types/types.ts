export type Response = {
    status: true
}

export type ResponseWithData<T> = Response & {
    data: T
}
