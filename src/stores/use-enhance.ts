import { create } from 'zustand';
import { api } from '@/lib/api';
import { usePromptStore } from './use-prompt';
import { useAlertStore } from './use-alert';

interface EnhanceState {
	isEnhancing: boolean;
	enhanceRemaining: number;
	setIsEnhancing: (isEnhancing: boolean) => void;
	setEnhanceRemaining: (remaining: number) => void;
	enhancePrompt: () => Promise<void>;
}

export const useEnhanceStore = create<EnhanceState>()((set, get) => ({
	isEnhancing: false,
	enhanceRemaining: 0,
	setIsEnhancing: (isEnhancing) => set({ isEnhancing }),
	setEnhanceRemaining: (remaining) => set({ enhanceRemaining: remaining }),
	enhancePrompt: async () => {
		const { prompt, setPrompt } = usePromptStore.getState();
		const { showAlert } = useAlertStore.getState();

		set({ isEnhancing: true });

		try {
			const response = await api.post('/prompt-enhancement', { prompt });

			if (!response.data) return;

			if (!response.data.success) {
				showAlert(response.data.message || "Prompt geliştirme sırasında bir hata oluştu.");
				return;
			}

			if (response.data?.alert) {
				showAlert(
					response.data.alert.message,
					response.data.alert.duration
				);
			} else {
				showAlert("Prompt başarıyla geliştirildi!");
			}

			if (response.data?.remain) {
				set({ enhanceRemaining: response.data?.rateLimit?.remaining || 0 });
			}

			if (response.data?.prompt) {
				setPrompt(response.data.prompt as string);
			}
		} catch (error) {
			showAlert("Prompt geliştirme başarısız oldu. Lütfen tekrar deneyin.");
		} finally {
			set({ isEnhancing: false });
		}
	},
})); 