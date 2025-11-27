<script lang="ts">
  import { chatStore, sendMessage } from './stores/chatStore';
  import MessageList from './components/MessageList.svelte';
  import MessageInput from './components/MessageInput.svelte';

  let roomId = $state('general');
  let displayName = $state('You');

  $effect.root(() => {
    // initialize room connection
    chatStore.initRoom(roomId, { id: 'u1', name: displayName, type: 'human' });
  });

  function onSend(text: string) {
    sendMessage({ roomId, authorId: 'u1', content: text });
  }
</script>

<div class="grid grid-rows-[auto,1fr,auto] h-dvh">
  <header class="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
    <div class="font-bold">CollabRoomAI</div>
    <div class="text-slate-500 text-sm"># {roomId}</div>
  </header>

  <main class="p-2 overflow-auto">
    <MessageList roomId={roomId} />
  </main>

  <footer class="border-t border-slate-200 bg-white p-2">
    <MessageInput on:send={(e) => onSend(e.detail)} />
  </footer>
</div>
