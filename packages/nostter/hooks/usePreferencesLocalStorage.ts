import { useLocalStorage } from "./useLocalStorage";

type PreferencesLocalStorage = {
	primaryAccountPubkey: string;
};

export function usePreferencesLocalStorage() {
	const [ preferencesLocalStorage, setPreferencesLocalStorage, isPreferencesLocalStorageInitialLoading ] = useLocalStorage<PreferencesLocalStorage>({
		key: 'preferences',
	});

	const setPrimaryAccountPubkey = (primaryAccountPubkey: string) => {
		setPreferencesLocalStorage((oldPreferencesLocalStorage) => ({
			...oldPreferencesLocalStorage,
			primaryAccountPubkey,
		}));
	};

	return {
		preferencesLocalStorage,
		isPreferencesLocalStorageInitialLoading,

		setPrimaryAccountPubkey,
	};
}
