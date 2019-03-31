export function createSyncActionConfig<HasPayload extends boolean = true>(
    type: string,
    hasPayload: HasPayload = true as HasPayload
) {
    return {
        type,
        hasPayload: hasPayload ? (true as true) : (false as false),
        async: (false as false)
    } as HasPayload extends true
        ? { type: string, hasPayload: true, async: false }
        : { type: string, hasPayload: false, async: false };
}
export function createAsyncActionConfig<HasPayload extends boolean = true>(
    type: string,
    hasPayload: HasPayload = true as HasPayload
) {
    return {
        type,
        hasPayload: hasPayload ? (true as true) : (false as false),
        async: (true as true)
    } as HasPayload extends true
        ? { type: string, hasPayload: true, async: true }
        : { type: string, hasPayload: false, async: true };    
}
