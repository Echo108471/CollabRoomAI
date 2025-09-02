import { writable, get } from 'svelte/store';

export type Participant = {
  id: string;
  name: string;
  type: 'human' | 'agent';
};

export type Message = {
  id: string;
  roomId: string;
  author: Participant;
  content: string;
  createdAt: number;
};

type Room = {
  id: string;
  participants: Participant[];
  messages: Message[];
};

type State = {
  rooms: Record<string, Room>;
};

const state = writable<State>({ rooms: {} });

function uid(prefix = 'm') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function ensureRoom(id: string) {
  const s = get(state);
  if (!s.rooms[id]) {
    s.rooms[id] = { id, participants: [], messages: [] };
    state.set(s);
  }
}

export const chatStore = {
  subscribe: state.subscribe,
  initRoom(id: string, participants: Participant[]) {
    state.update((s) => {
      s.rooms[id] = s.rooms[id] ?? { id, participants: [], messages: [] };
      s.rooms[id].participants = participants;
      if (s.rooms[id].messages.length === 0) {
        // greeting from agents
        const now = Date.now();
        const agents = participants.filter((p) => p.type === 'agent');
        agents.forEach((a, i) => {
          s.rooms[id].messages.push({
            id: uid(),
            roomId: id,
            author: a,
            content: `Hi, I'm ${a.name}.` + (i === 0 ? ' How can I help today?' : ''),
            createdAt: now + i * 200
          });
        });
      }
      return s;
    });
  },
  getMessages(roomId: string) {
    const s = get(state);
    return s.rooms[roomId]?.messages ?? [];
  }
};

export function sendMessage({ roomId, authorId, content }: { roomId: string; authorId: string; content: string }) {
  ensureRoom(roomId);
  state.update((s) => {
    const room = s.rooms[roomId];
    const author = room.participants.find((p) => p.id === authorId) ?? { id: authorId, name: 'User', type: 'human' };
    room.messages.push({ id: uid(), roomId, author, content, createdAt: Date.now() });
    return s;
  });

  // Simulate AI agents responding
  const s = get(state);
  const room = s.rooms[roomId];
  const agents = room.participants.filter((p) => p.type === 'agent');
  agents.forEach((agent, idx) => {
    const delay = 500 + idx * 500;
    setTimeout(() => {
      state.update((s2) => {
        const r = s2.rooms[roomId];
        if (!r) return s2;
        const reply = generateAgentReply(agent, content, r.messages);
        r.messages.push({ id: uid(), roomId, author: agent, content: reply, createdAt: Date.now() });
        return s2;
      });
    }, delay);
  });
}

function generateAgentReply(agent: Participant, userMsg: string, history: Message[]): string {
  // stubbed rule-based reply to demonstrate multi-agent behavior
  if (agent.name.toLowerCase().includes('skeptic')) {
    return `Are we sure? "${userMsg}" might have edge cases. What constraints or data do we have?`;
  }
  if (/hello|hi|hey/i.test(userMsg)) {
    return `Hello! What are we working on?`;
  }
  if (/help|how/i.test(userMsg)) {
    return `Here's a plan: 1) clarify goal, 2) list tasks, 3) assign owners, 4) next step now.`;
  }
  const lastHuman = [...history].reverse().find((m) => m.author.type === 'human');
  if (lastHuman) {
    return `Got it: ${truncate(lastHuman.content, 120)}. I'd suggest one concrete next step: ${suggestNextStep(lastHuman.content)}`;
  }
  return `On it. Tell me more.`;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function suggestNextStep(text: string) {
  if (/bug|error|fail/i.test(text)) return 'reproduce the issue with a minimal example';
  if (/deploy|release/i.test(text)) return 'prepare a checklist and dry-run in staging';
  if (/design|ui/i.test(text)) return 'sketch wireframes and get quick feedback';
  return 'break the task into 3 tiny actions and start with the first one';
}
