<script lang="ts">
  import { chatStore, type Message } from '../stores/chatStore';
  const props = $props<{ roomId: string }>();

  let container: HTMLDivElement;

  let messages = $state<Message[]>([]);

  // Subscribe to store updates and recompute when roomId changes
  $effect.root(() => {
    const unsubscribe = chatStore.subscribe(() => {
      messages = chatStore.getMessages(props.roomId);
    });

    // also recompute immediately and when roomId changes
    $effect(() => {
      props.roomId;
      messages = chatStore.getMessages(props.roomId);
    });

    return () => unsubscribe();
  });

  // Auto-scroll when messages update
  $effect(() => {
    messages;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });

  function avatar(name: string) {
    return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class="flex flex-col gap-2 p-1" bind:this={container}>
  {#each messages as m (m.id)}
    <article class="grid grid-cols-[36px,1fr] gap-2 items-start">
      <div class="w-9 h-9 rounded-full bg-slate-800 text-white grid place-items-center text-xs font-bold" aria-hidden="true">
        {avatar(m.author.name)}
      </div>
      <div class="border border-slate-200 rounded-md px-3 py-2 whitespace-pre-wrap"
        class:bg-indigo-50={m.author.type === 'agent'}
        class:bg-cyan-50={m.author.type === 'human'}
      >
        <header class="flex gap-2 items-baseline mb-1">
          <span class="font-semibold">{m.author.name}</span>
          <span class="text-xs text-slate-500">{new Date(m.createdAt).toLocaleTimeString()}</span>
        </header>
        <div>{m.content}</div>
      </div>
    </article>
  {/each}
  {#if messages.length === 0}
    <div class="text-center text-slate-500 mt-8">No messages yet. Say hi!</div>
  {/if}
  <div class="h-px"></div>
</div>
