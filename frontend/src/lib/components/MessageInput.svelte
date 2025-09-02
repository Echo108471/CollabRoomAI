<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ send: string }>();

  let value = $state('');
  let disabled = $state(false);

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    dispatch('send', text);
    value = '';
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
</script>

<div class="grid grid-cols-[1fr,auto] gap-2">
  <textarea
    class="resize-none px-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    bind:value
    placeholder="Type a message..."
    rows={1}
    onkeydown={onKeydown}
  ></textarea>
  <button
    class="px-3 py-2 border border-slate-800 bg-slate-800 text-white rounded-md hover:bg-slate-700"
    onclick={submit}
    aria-label="Send"
  >
    Send
  </button>
</div>
