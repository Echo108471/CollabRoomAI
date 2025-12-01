<script lang="ts">
	import { chatStore, type Message } from '../stores/chatStore';
	const { roomId } = $props<{ roomId: string }>();

	let container: HTMLDivElement;

	let messages = $state<Message[]>([]);

	// Subscribe to store updates and recompute when roomId changes
	$effect.root(() => {
		const unsubscribe = chatStore.subscribe(() => {
			messages = chatStore.getMessages(roomId);
			console.log('MessageList updated, count:', messages.length);
		});

		// also recompute immediately and when roomId changes
		$effect(() => {
			void roomId;
			messages = chatStore.getMessages(roomId);
		});

		return () => unsubscribe();
	});

	// Auto-scroll when messages update
	$effect(() => {
		void messages;
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	});

	function avatar(name: string) {
		return name
			.split(' ')
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	}
</script>

<div class="flex flex-col gap-6 pb-4" bind:this={container}>
	{#each messages as m (m.id)}
		<article
			class="group flex gap-4 items-start animate-slide-up"
			class:flex-row-reverse={m.author.type === 'human'}
		>
			<!-- Avatar -->
			<div
				class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
        {m.author.type === 'human'
					? 'bg-indigo-600 text-white'
					: 'bg-white border border-slate-200 text-slate-700'}"
			>
				{avatar(m.author.name)}
			</div>

			<!-- Message Bubble -->
			<div
				class="flex flex-col max-w-[75%] {m.author.type === 'human' ? 'items-end' : 'items-start'}"
			>
				<div class="flex items-baseline gap-2 mb-1 px-1">
					<span class="text-sm font-semibold text-slate-900">{m.author.name}</span>
					<span class="text-xs text-slate-400"
						>{new Date(m.createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}</span
					>
				</div>

				<div
					class="px-5 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap
          {m.author.type === 'human'
						? 'bg-indigo-600 text-white rounded-tr-none'
						: 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}"
				>
					{m.content}
				</div>
			</div>
		</article>
	{/each}

	{#if messages.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-center opacity-50">
			<div
				class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl"
			>
				👋
			</div>
			<h3 class="text-lg font-medium text-slate-900">Welcome to the room!</h3>
			<p class="text-slate-500">Start the conversation with your AI teammates.</p>
		</div>
	{/if}
</div>
