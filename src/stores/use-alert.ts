import { create } from 'zustand';

interface AlertState {
	alert: string | null;
	alertDuration: number;
	setAlert: (message: string | null) => void;
	setAlertDuration: (duration: number) => void;
	clearAlert: () => void;
	showAlert: (message: string, duration?: number) => void;
}

export const useAlertStore = create<AlertState>()((set, get) => ({
	alert: null,
	alertDuration: 5000,
	setAlert: (message) => set({ alert: message }),
	setAlertDuration: (duration) => set({ alertDuration: duration }),
	clearAlert: () => set({ alert: null, alertDuration: 5000 }),
	showAlert: (message, duration = 5000) => {
		set({ alert: message, alertDuration: duration });

		setTimeout(() => {
			const currentAlert = get().alert;
			if (currentAlert === message) {
				set({ alert: null, alertDuration: 5000 });
			}
		}, duration);
	},
})); 