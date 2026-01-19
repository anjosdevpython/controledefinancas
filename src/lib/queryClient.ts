import { QueryClient, MutationCache } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 3,
            retryDelay: 1000,
        }
    },
    mutationCache: new MutationCache({
        onSuccess: () => {
            // Logic to refetch relevant queries could go here for mutations
        }
    })
});

export const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'OFFLINE_CACHE',
});
