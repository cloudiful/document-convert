<script lang="ts">
	import { t } from '$lib/i18n';

	let {
		urlInput,
		onUrlInput,
		onSubmitUrl
	}: {
		urlInput: string;
		onUrlInput: (value: string) => void;
		onSubmitUrl: () => void | Promise<void>;
	} = $props();
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 prose prose-sm max-w-none">
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 not-prose">{$t.url.title}</h2>
	<form
		onsubmit={(event) => {
			event.preventDefault();
			void onSubmitUrl();
		}}
		class="space-y-4"
	>
		<div>
			<label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				{$t.url.title}
			</label>
			<input
				id="url"
				type="url"
				value={urlInput}
				oninput={(event) => onUrlInput((event.currentTarget as HTMLInputElement).value)}
				placeholder={$t.url.placeholder}
				class="form-input w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
				required
			/>
		</div>
		<button
			type="submit"
			disabled={!urlInput.trim()}
			class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
			{$t.url.submit}
		</button>
	</form>
</div>
