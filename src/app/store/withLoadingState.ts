import {signalStoreFeature, withComputed, withState} from "@ngrx/signals";
import {computed} from "@angular/core";

export type LoadingState = 'busy' | 'idle' | { error: string };

export function withLoadingState() {
    return signalStoreFeature(
        withState<{loadingState: LoadingState}>({loadingState: 'idle'}),
        withComputed(({loadingState}) => ({
            busy: computed(() => loadingState() === 'busy'),
            error: computed(() => {
                const state = loadingState();
                return typeof state === 'object' ? state.error : null
            })
        }))
    )
}

export function setBusy(): {loadingState: LoadingState} {
    return {loadingState: 'busy'};
}
export function setIdle(): {loadingState: LoadingState} {
    return {loadingState: 'idle'};
}
export function setError(error: string): {loadingState: LoadingState} {
    return {loadingState: {error}};
}
