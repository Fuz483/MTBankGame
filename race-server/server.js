/**
 * MTBank Formula 1 Racing - Multiplayer WebSocket Server
 *
 * Architecture:
 * - Up to 8 players per race room
 * - Minimum 3 bots; rest filled by players
 * - Bots follow waypoints with simple AI
 * - Server ticks at 20Hz, broadcasting world state
 * - Place rewards: 25,18,15,12,10,8,6,4 base * car_coefficient
 */

import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 8080;
const TICK_RATE = 20; // Hz
const MAX_PLAYERS_PER_ROOM = 8;
const MIN_BOTS = 3;
const PLACE_REWARDS = [25, 18, 15, 12, 10, 8, 6, 4];
const WAIT_TIMEOUT_MS = 30000; // start race after 30s even if not full

function getCarCoefficient(carId) {
  return 1 + carId * 0.03;
}

function calcCoins(place, carId) {
  const base = PLACE_REWARDS[Math.min(place - 1, 7)] ?? 4;
  return Math.round(base * getCarCoefficient(carId));
}

// ─── Bot AI ────────────────────────────────────────────────────────────────

const BOT_NAMES = [
  'Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta',
  'Bot Epsilon', 'Bot Zeta', 'Bot Eta', 'Bot Theta',
];

function createBot(id) {
  return {
    id: `bot_${id}`,
    name: BOT_NAMES[id % BOT_NAMES.length],
    isBot: true,
    carId: Math.ceil(Math.random() * 5), // bots use cars 1-5
    x: 0.15 + ((id % 4) * 0.18),
    progress: 0.04 + id * 0.06,
    speed: 0,
    baseSpeed: 80 + Math.random() * 60,
    finished: false,
    finishTime: null,
    place: null,
  };
}

function updateBot(bot, dt) {
  if (bot.finished) return;
  bot.speed += 2.0 * dt;
  if (bot.speed > bot.baseSpeed / 60) bot.speed = bot.baseSpeed / 60;
  // random slight variation
  bot.speed *= (0.97 + Math.random() * 0.06);
  bot.progress += bot.speed * dt;
  // random x drift for visual variety
  bot.x += (Math.random() - 0.5) * 0.003;
  bot.x = Math.min(Math.max(bot.x, 0.13), 0.87);
}

// ─── Room ─────────────────────────────────────────────────────────────────

class Room {
  constructor(id) {
    this.id = id;
    this.players = new Map(); // playerId -> { ws, state }
    this.bots = [];
    this.started = false;
    this.finishOrder = []; // { id, name, isBot, place, coinsEarned }
    this.tickInterval = null;
    this.waitTimeout = null;
    this.createdAt = Date.now();
  }

  get playerCount() { return this.players.size; }
  get totalParticipants() { return this.players.size + this.bots.length; }

  addPlayer(playerId, ws, carId, username) {
    this.players.set(playerId, {
      ws,
      state: {
        id: playerId,
        name: username,
        isBot: false,
        carId: carId ?? 1,
        x: 0.5,
        progress: 0,
        speed: 0,
        finished: false,
        finishTime: null,
        place: null,
      },
    });

    // Send current room state to the new player
    this.send(ws, {
      type: 'room_joined',
      roomId: this.id,
      playerId,
      players: this.getPlayersSnapshot(),
      bots: this.getBotsSnapshot(),
      started: this.started,
    });

    // Notify others
    this.broadcast({
      type: 'player_joined',
      playerId,
      username,
      carId,
    }, playerId);

    // Start wait timer if first player
    if (this.playerCount === 1 && !this.started) {
      this.waitTimeout = setTimeout(() => this.startRace(), WAIT_TIMEOUT_MS);
    }

    // Start immediately if full
    if (this.playerCount >= MAX_PLAYERS_PER_ROOM && !this.started) {
      this.startRace();
    }
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.broadcast({ type: 'player_left', playerId });
    if (this.playerCount === 0 && !this.started) {
      clearTimeout(this.waitTimeout);
    }
  }

  startRace() {
    if (this.started) return;
    this.started = true;
    clearTimeout(this.waitTimeout);

    // Fill remaining slots with bots (min 3 bots, always 8 total)
    const botCount = Math.max(MIN_BOTS, MAX_PLAYERS_PER_ROOM - this.playerCount);
    for (let i = 0; i < botCount; i++) {
      this.bots.push(createBot(i));
    }

    this.broadcast({
      type: 'race_start',
      bots: this.getBotsSnapshot(),
      countdown: 3,
    });

    // Begin tick loop
    const dt = 1 / TICK_RATE;
    this.tickInterval = setInterval(() => this.tick(dt), 1000 / TICK_RATE);

    console.log(`[Room ${this.id}] Race started. Players: ${this.playerCount}, Bots: ${this.bots.length}`);
  }

  tick(dt) {
    // Update bots
    for (const bot of this.bots) {
      updateBot(bot, dt);
      if (!bot.finished && bot.progress >= 1.0) {
        bot.finished = true;
        bot.finishTime = Date.now();
        this.finishOrder.push({ id: bot.id, name: bot.name, isBot: true });
      }
    }

    // Check player finishes
    for (const [pid, p] of this.players) {
      if (!p.state.finished && p.state.progress >= 1.0) {
        p.state.finished = true;
        p.state.finishTime = Date.now();
        this.finishOrder.push({ id: pid, name: p.state.name, isBot: false });
      }
    }

    // Assign places to newly finished
    this.finishOrder.forEach((entry, idx) => {
      if (entry.place == null) {
        entry.place = idx + 1;
        if (!entry.isBot) {
          const p = this.players.get(entry.id);
          if (p) {
            const coins = calcCoins(entry.place, p.state.carId);
            p.state.place = entry.place;
            this.send(p.ws, {
              type: 'finished',
              place: entry.place,
              coinsEarned: coins,
              carId: p.state.carId,
            });
          }
        }
      }
    });

    // Broadcast world state
    this.broadcast({
      type: 'tick',
      players: this.getPlayersSnapshot(),
      bots: this.getBotsSnapshot(),
    });

    // Check if all finished
    const allDone = [...this.players.values()].every(p => p.state.finished)
      && this.bots.every(b => b.finished);
    if (allDone) this.endRace();
  }

  endRace() {
    clearInterval(this.tickInterval);
    this.broadcast({
      type: 'race_end',
      results: this.finishOrder,
    });
    console.log(`[Room ${this.id}] Race ended.`);
    // Clean up room after 10s
    setTimeout(() => rooms.delete(this.id), 10000);
  }

  handlePlayerUpdate(playerId, data) {
    const p = this.players.get(playerId);
    if (!p) return;
    p.state.x = Math.min(Math.max(parseFloat(data.x) || 0.5, 0.1), 0.9);
    p.state.progress = Math.min(parseFloat(data.progress) || 0, 1.0);
    p.state.speed = Math.min(parseFloat(data.speed) || 0, 6);
  }

  getPlayersSnapshot() {
    return Object.fromEntries(
      [...this.players.entries()].map(([id, p]) => [id, { ...p.state }])
    );
  }

  getBotsSnapshot() {
    return this.bots.map(b => ({ ...b }));
  }

  send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data, excludeId = null) {
    const msg = JSON.stringify(data);
    for (const [pid, p] of this.players) {
      if (pid !== excludeId && p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(msg);
      }
    }
  }
}

// ─── Room manager ─────────────────────────────────────────────────────────

const rooms = new Map();
let nextRoomId = 1;

function findOrCreateRoom() {
  // Find a room that has space and hasn't started
  for (const room of rooms.values()) {
    if (!room.started && room.playerCount < MAX_PLAYERS_PER_ROOM) {
      return room;
    }
  }
  // Create new room
  const room = new Room(`room_${nextRoomId++}`);
  rooms.set(room.id, room);
  return room;
}

// ─── WebSocket Server ──────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: PORT });
let nextPlayerId = 1;

wss.on('connection', (ws) => {
  const playerId = `player_${nextPlayerId++}`;
  let currentRoom = null;

  console.log(`[+] ${playerId} connected`);

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return; }

    switch (data.type) {
      case 'join': {
        const room = findOrCreateRoom();
        currentRoom = room;
        room.addPlayer(playerId, ws, data.carId ?? 1, data.username ?? playerId);
        break;
      }
      case 'update': {
        if (currentRoom) currentRoom.handlePlayerUpdate(playerId, data);
        break;
      }
      case 'ready': {
        // Player signals they're ready; could trigger early start
        if (currentRoom && !currentRoom.started && currentRoom.playerCount >= 2) {
          currentRoom.startRace();
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    console.log(`[-] ${playerId} disconnected`);
    if (currentRoom) currentRoom.removePlayer(playerId);
  });

  ws.on('error', (err) => {
    console.error(`[!] ${playerId} error:`, err.message);
  });

  // Send ping to confirm connection
  ws.send(JSON.stringify({ type: 'connected', playerId }));
});

console.log(`MTBank Race Server running on ws://0.0.0.0:${PORT}`);
console.log(`Max ${MAX_PLAYERS_PER_ROOM} players per room, min ${MIN_BOTS} bots`);
