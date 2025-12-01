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
	connected: boolean;
};

const state = writable<State>({ rooms: {}, connected: false });
let socket: WebSocket | null = null;

function ensureRoom(id: string) {
	const s = get(state);
	if (!s.rooms[id]) {
		s.rooms[id] = { id, participants: [], messages: [] };
		state.set(s);
	}
}

export const chatStore = {
	subscribe: state.subscribe,

	initRoom(id: string, user: Participant) {
		console.log('initRoom called for', id);
		ensureRoom(id);
		// Add the user to the room participants if not already present
		state.update((s) => {
			const room = s.rooms[id] || { id, participants: [], messages: [] };
			if (!room.participants.find((p) => p.id === user.id)) {
				room.participants.push(user);
			}
			s.rooms[id] = room;
			return s;
		});

		// Connect to WebSocket
		if (socket) socket.close();

		socket = new WebSocket('ws://localhost:8080/ws');

		socket.onopen = () => {
			console.log('Connected to chat server');
			state.update((s) => ({ ...s, connected: true }));

			// Send initial join message or just start listening
			// For this prototype, we just start listening
		};

		socket.onmessage = (event) => {
			try {
				console.log('Received message:', event.data);
				const msg: Message = JSON.parse(event.data);
				state.update((s) => {
					const oldRoom = s.rooms[msg.roomId] || { id: msg.roomId, participants: [], messages: [] };
					const room = { ...oldRoom };

					// Add message
					if (!room.messages.find((m) => m.id === msg.id)) {
						room.messages = [...room.messages, msg];
					}

					// Update participants if new
					if (!room.participants.find((p) => p.id === msg.author.id)) {
						room.participants = [...room.participants, msg.author];
					}

					return {
						...s,
						rooms: {
							...s.rooms,
							[msg.roomId]: room
						}
					};
				});
			} catch (e) {
				console.error('Failed to parse message', e);
			}
		};

		socket.onclose = () => {
			console.log('Disconnected from chat server');
			state.update((s) => ({ ...s, connected: false }));
		};
	},

	getMessages(roomId: string) {
		const s = get(state);
		return s.rooms[roomId]?.messages ?? [];
	}
};

export function sendMessage({
	roomId,
	authorId,
	content
}: {
	roomId: string;
	authorId: string;
	content: string;
}) {
	console.log('sendMessage called with:', content);
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.error('Socket not connected');
		return;
	}

	const msg = {
		roomId,
		author: { id: authorId, name: 'You', type: 'human' }, // Simplified for now
		content,
		createdAt: Date.now() // Server will overwrite/confirm this
	};

	socket.send(JSON.stringify(msg));
}
