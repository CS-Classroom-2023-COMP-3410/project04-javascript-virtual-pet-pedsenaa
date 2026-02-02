const pet = document.getElementById("pet");
const clockEl = document.getElementById("clock");
const msgEl = document.getElementById("message");

const healthText = document.getElementById("healthText");
const energyText = document.getElementById("energyText");
const hungerText = document.getElementById("hungerText");
const happyText  = document.getElementById("happyText");
const petText = document.getElementById("pet-text");

document.getElementById("playBtn").addEventListener("click", () => act("play"));
document.getElementById("feedBtn").addEventListener("click", () => act("feed"));
document.getElementById("sleepBtn").addEventListener("click", () => act("sleep"));

let time = 0;

const SAVE_KEY = "virtualPet_save_v1";

let stats = {
  health: 80,
  energy: 70,
  hunger: 30,
  happiness: 70
};

let lastAction = "";
let spamCount = 0;

function clamp(x) {
  if (x < 0) return 0;
  if (x > 100) return 100;
  return x;
}

let clearMsgTimeout = null;

function setMsg(text) {
  msgEl.textContent = text;

  if (clearMsgTimeout) clearTimeout(clearMsgTimeout);
  if (ms > 0) {
    clearMsgTimeout = setTimeout(() => {
      msgEl.textContent = "";
    }, ms);
  }
}

function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      time,
      stats,
      lastAction,
      spamCount,
      savedAt: Date.now()
    }));
}

function render() {
  clockEl.textContent = `Time: ${time}s`;

  healthText.textContent = Math.round(stats.health);
  energyText.textContent = Math.round(stats.energy);
  hungerText.textContent = Math.round(stats.hunger);
  happyText.textContent  = Math.round(stats.happiness);

  if (stats.health <= 20) {
    pet.className = "sick";
    petText.textContent = "I'm sick";
  }
  else if (stats.energy <= 25 && stats.hunger >= 60) {
    pet.className = "anxious";
    petText.textContent = "I'm anxious";
  }
  else if (stats.energy <= 25) {
    pet.className = "sleepy";
    petText.textContent = "I'm tired";
  }
  else if (stats.hunger >= 70) {
    pet.className = "hungry";
    petText.textContent = "I'm hungry";
  }
  else if (stats.happiness <= 25) {
    pet.className = "sad";
    petText.textContent = "I'm sad";
  }
  else if (stats.happiness <= 45) {
    pet.className = "bored";
    petText.textContent = "I'm bored";
  }
  else {
    pet.className = "happy";
    petText.textContent = "I'm happy";
  }
}

function tick() {
  time++;

  stats.energy -= 1;
  stats.hunger += 1;
  stats.happiness -= 0.5;

  if (stats.hunger >= 80 || stats.energy <= 15) stats.health -= 1;
  else if (stats.hunger <= 50 && stats.energy >= 40) stats.health += 0.2;

  stats.health = clamp(stats.health);
  stats.energy = clamp(stats.energy);
  stats.hunger = clamp(stats.hunger);
  stats.happiness = clamp(stats.happiness);

  if (stats.health === 0) setMsg("Your pet is doing really bad... refresh to restart.");

  render();
}

function act(type) {
  if (stats.health === 0) return;

  if (type === lastAction) spamCount++;
  else spamCount = 0;

  lastAction = type;

  const overdoing = spamCount >= 2;

  if (type === "sleep") {
    if (!overdoing) {
      stats.energy += 18;
      stats.happiness += 6;
      stats.health += 4;
      stats.hunger += 8;
      setMsg("Sleep (good)");
    } else {
      stats.energy += 6;
      stats.happiness -= 8;
      stats.health -= 6;
      stats.hunger += 10;
      setMsg("Too much sleep... (bad)");
    }
  }

  if (type === "play") {
    if (!overdoing) {
      stats.happiness += 14;
      stats.health += 4;
      stats.energy -= 12;
      stats.hunger += 10;
      setMsg("Play (good)");
    } else {
      stats.happiness -= 8;
      stats.health -= 8;
      stats.energy -= 10;
      stats.hunger += 12;
      setMsg("Too much play... (bad)");
    }
  }

  if (type === "feed") {
    const notHungry = stats.hunger <= 25;

    if (!overdoing && !notHungry) {
      stats.hunger -= 22;
      stats.energy += 6;
      stats.happiness += 6;
      stats.health += 4;
      setMsg("Feed (good)");
    } else {
      stats.hunger -= 8;
      stats.energy += 2;
      stats.happiness -= 6;
      stats.health -= 8;
      setMsg("Too much food... (bad)");
    }
  }

  stats.health = clamp(stats.health);
  stats.energy = clamp(stats.energy);
  stats.hunger = clamp(stats.hunger);
  stats.happiness = clamp(stats.happiness);

  render();
  save();
}


// load once
const saved = localStorage.getItem(SAVE_KEY);
if (saved) {
  const data = JSON.parse(saved);
  time = data.time;
  stats = data.stats;
}

render();

// main loop
setInterval(() => {
  tick();
  save();
}, 1000); 
