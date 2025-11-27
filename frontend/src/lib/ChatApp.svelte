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

<div class="flex h-dvh bg-surface-50 text-slate-800 font-sans overflow-hidden">
  <!-- Sidebar -->
  <aside class="w-64 bg-surface-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-20">
    <div class="p-4 border-b border-slate-800 flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
        CR
      </div>
      <span class="font-bold text-white tracking-tight">CollabRoom</span>
    </div>

    <div class="flex-1 overflow-y-auto py-4">
      <div class="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Rooms</div>
      <nav class="space-y-0.5 px-2">
        <button class="w-full text-left px-3 py-2 rounded-md bg-slate-800 text-white font-medium flex items-center gap-2 transition-colors">
          <span class="text-slate-400">#</span> {roomId}
        </button>
        <button class="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2">
          <span class="text-slate-500">#</span> random
        </button>
      </nav>

      <div class="px-4 mt-8 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Team</div>
      <div class="space-y-1 px-2">
        <div class="px-3 py-2 flex items-center gap-3 opacity-75">
          <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span>You</span>
        </div>
        <div class="px-3 py-2 flex items-center gap-3 opacity-75">
          <div class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          <span>HelperBot</span>
        </div>
        <div class="px-3 py-2 flex items-center gap-3 opacity-75">
          <div class="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
          <span>SkepticBot</span>
        </div>
      </div>
    </div>
    
    <div class="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
      v0.1.0 • Connected
    </div>
  </aside>

  <!-- Main Chat Area -->
  <div class="flex-1 flex flex-col min-w-0 bg-white relative">
    <!-- Glassmorphic Header -->
    <header class="h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold text-slate-800"># {roomId}</span>
        <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">General Discussion</span>
      </div>
      <div class="flex -space-x-2">
        <!-- Avatars overlap -->
        <div class="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600" title="HelperBot">HB</div>
        <div class="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-purple-600" title="SkepticBot">SB</div>
      </div>
    </header>

    <main class="flex-1 overflow-hidden relative">
      <div class="absolute inset-0 overflow-y-auto p-6 scroll-smooth">
        <MessageList roomId={roomId} />
      </div>
    </main>

    <footer class="p-6 bg-white border-t border-slate-100">
      <div class="max-w-4xl mx-auto">
        <MessageInput on:send={(e) => onSend(e.detail)} />
      </div>
    </footer>
  </div>
</div>
