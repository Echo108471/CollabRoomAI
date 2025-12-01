<script lang="ts">
	function emitSend(detail: string) {
		dispatchEvent(new CustomEvent('send', { detail }));
	}

	let value = $state('');
	let disabled = $state(false);

	function submit() {
		const text = value.trim();
		if (!text || disabled) return;
		emitSend(text);
		value = '';
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}
</script>

<div class="relative group">
	<div
		class="absolute inset-0 bg-indigo-500/5 rounded-xl blur-xl group-focus-within:bg-indigo-500/10 transition-colors"
	></div>
	<div
		class="relative flex items-end gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
	>
		<textarea
			class="flex-1 max-h-32 min-h-[44px] py-2.5 px-3 bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400"
			bind:value
			placeholder="Message #general..."
			rows={1}
			onkeydown={onKeydown}
		></textarea>

		<button
			class="mb-1 p-2 rounded-lg transition-all duration-200
        {value.trim()
				? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105'
				: 'bg-slate-100 text-slate-400 cursor-not-allowed'}"
			onclick={submit}
			disabled={!value.trim() || disabled}
			aria-label="Send"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-5 h-5"
			>
				<path
					d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"
				/>
			</svg>
		</button>
	</div>
	<div class="mt-2 text-xs text-slate-400 text-right px-1">
		Press <kbd
			class="font-sans px-1 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-500"
			>Enter</kbd
		> to send
	</div>
</div>
