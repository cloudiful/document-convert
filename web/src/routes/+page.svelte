<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import FileUploadPanel from '$lib/components/FileUploadPanel.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import TaskSummary from '$lib/components/TaskSummary.svelte';
	import UrlSubmitPanel from '$lib/components/UrlSubmitPanel.svelte';
	import {
		deleteTask as deleteTaskRequest,
		fetchTasks as fetchTaskList,
		submitTaskUrl,
		uploadTaskFile
	} from '$lib/api/tasks';
	import { computeProgressStats, syncTaskStartTimes } from '$lib/tasks/stats';
	import { defaultTaskConfig, type Task, type TaskConfig } from '$lib/types/tasks';

	let tasks = $state<Task[]>([]);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let dragOver = $state(false);
	let urlInput = $state('');
	let showSettings = $state(false);
	let error = $state('');
	let taskStartTimes = $state<Record<string, Date>>({});
	let config = $state<TaskConfig>({ ...defaultTaskConfig });

	let progressStats = $derived(computeProgressStats(tasks, taskStartTimes));

	onMount(() => {
		void refreshTasks();
		const interval = setInterval(() => void refreshTasks(), 3000);
		return () => clearInterval(interval);
	});

	async function refreshTasks() {
		try {
			const newTasks = await fetchTaskList();
			taskStartTimes = syncTaskStartTimes(taskStartTimes, newTasks);
			tasks = newTasks;
		} catch (fetchError) {
			console.error('Failed to fetch tasks:', fetchError);
		}
	}

	function patchConfig(patch: Partial<TaskConfig>) {
		config = {
			...config,
			...patch
		};
	}

	async function handleFileSelected(file: File) {
		isUploading = true;
		uploadProgress = 0;
		error = '';

		try {
			await uploadTaskFile(file, config, (progress) => {
				uploadProgress = progress;
			});
			await refreshTasks();
		} catch (uploadError) {
			error = (uploadError as Error).message || 'Upload failed';
		} finally {
			isUploading = false;
			uploadProgress = 0;
		}
	}

	async function handleUrlSubmit() {
		if (!urlInput.trim()) {
			return;
		}

		try {
			await submitTaskUrl(urlInput, config);
			urlInput = '';
			await refreshTasks();
		} catch (submitError) {
			error = (submitError as Error).message || 'Failed to submit URL';
		}
	}

	async function handleDeleteTask(taskId: string) {
		try {
			await deleteTaskRequest(taskId);
			await refreshTasks();
		} catch (deleteError) {
			console.error('Failed to delete task:', deleteError);
		}
	}
</script>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	{#if error}
		<div
			class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
			transition:fade
		>
			<div class="flex items-center justify-between">
				<p class="text-red-800 dark:text-red-200">{error}</p>
				<button
					onclick={() => (error = '')}
					class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
					aria-label="Dismiss error"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<SettingsPanel
		show={showSettings}
		{config}
		onToggle={(value) => (showSettings = value)}
		onPatch={patchConfig}
	/>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
		<FileUploadPanel
			{isUploading}
			{uploadProgress}
			{dragOver}
			onDragChange={(value) => (dragOver = value)}
			onFileSelected={handleFileSelected}
		/>
		<UrlSubmitPanel
			{urlInput}
			onUrlInput={(value) => (urlInput = value)}
			onSubmitUrl={handleUrlSubmit}
		/>
	</div>

	<TaskSummary stats={progressStats} />
	<TaskList {tasks} onDeleteTask={handleDeleteTask} />
</main>
