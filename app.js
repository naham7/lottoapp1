const LAYERS = [
  { key: "constant", name: "우주 상수", color: "#e5b96f" },
  { key: "celestial", name: "천체 각도", color: "#69cbd3" },
  { key: "zodiac", name: "황도축", color: "#d97970" },
  { key: "saju", name: "사주 오행", color: "#8ac98f" },
  { key: "bio", name: "생체 주기", color: "#b7a4f4" },
  { key: "number", name: "수리 진동", color: "#f0d28e" },
  { key: "event", name: "사건 중력", color: "#f08a5d" },
  { key: "repel", name: "최근 번호 반발", color: "#8fa4b8" },
  { key: "entropy", name: "제한 엔트로피", color: "#ffffff" }
];

const ZODIAC_AXES = [
  ["양자리", 1, 3, "변동성"],
  ["황소자리", 4, 6, "안정성"],
  ["쌍둥이자리", 7, 9, "이중성"],
  ["게자리", 10, 12, "축적"],
  ["사자자리", 13, 15, "정점"],
  ["처녀자리", 16, 18, "정밀"],
  ["천칭자리", 19, 21, "균형"],
  ["전갈자리", 22, 24, "압축"],
  ["사수자리", 25, 27, "확장"],
  ["염소자리", 28, 30, "밀도"],
  ["물병자리", 31, 36, "이상점"],
  ["물고기자리", 37, 45, "확산"]
];

const EVENT_RULES = [
  { keyword: "경제", title: "경제 변동", magnitude: 0.3, note: "시장 압축과 반등이 통합장을 위로 밀어 올립니다." },
  { keyword: "위기", title: "글로벌 위기", magnitude: 0.8, note: "강한 외부 충격으로 사건 중력 비중이 커집니다." },
  { keyword: "전쟁", title: "전쟁/분쟁", magnitude: 0.75, note: "충돌성이 파동장을 날카롭게 압축합니다." },
  { keyword: "기술", title: "기술 돌파", magnitude: 0.45, note: "확장 방향의 공명값이 증가합니다." },
  { keyword: "스포츠", title: "스포츠 결승", magnitude: 0.25, note: "집단 집중 에너지가 짧게 반영됩니다." }
];

const state = {
  result: null,
  selectedSetIndex: 0,
  selectedTrace: null,
  waveTick: 0,
  waveTimer: null,
  three: null
};

[
  ["우주 상수", "#e5b96f"],
  ["천체 각도", "#69cbd3"],
  ["황도축", "#d97970"],
  ["사주 오행", "#8ac98f"],
  ["생체 주기", "#b7a4f4"],
  ["수리 진동", "#f0d28e"],
  ["사건 중력", "#f08a5d"],
  ["최근 번호 반발", "#8fa4b8"],
  ["제한 엔트로피", "#ffffff"]
].forEach(([name, color], index) => {
  LAYERS[index].name = name;
  LAYERS[index].color = color;
});

[
  ["양자리", 1, 3, "변동성"],
  ["황소자리", 4, 6, "안정성"],
  ["쌍둥이자리", 7, 9, "이중성"],
  ["게자리", 10, 12, "축적"],
  ["사자자리", 13, 15, "정점"],
  ["처녀자리", 16, 18, "정밀"],
  ["천칭자리", 19, 21, "균형"],
  ["전갈자리", 22, 24, "압축"],
  ["사수자리", 25, 27, "확장"],
  ["염소자리", 28, 30, "밀도"],
  ["물병자리", 31, 36, "이상점"],
  ["물고기자리", 37, 45, "확산"]
].forEach((axis, index) => {
  ZODIAC_AXES[index] = axis;
});

EVENT_RULES.splice(
  0,
  EVENT_RULES.length,
  { keyword: "경제", title: "경제 변동", magnitude: 0.3, note: "시장 압축과 반등이 통합장을 위로 밀어 올립니다." },
  { keyword: "위기", title: "글로벌 위기", magnitude: 0.8, note: "강한 외부 충격으로 사건 중력 비중이 커집니다." },
  { keyword: "전쟁", title: "전쟁/분쟁", magnitude: 0.75, note: "충돌성이 파동장을 날카롭게 압축합니다." },
  { keyword: "기술", title: "기술 돌파", magnitude: 0.45, note: "확장 방향의 공명값이 증가합니다." },
  { keyword: "스포츠", title: "스포츠 결승", magnitude: 0.25, note: "집단 집중 에너지가 짧게 반영됩니다." }
);

const form = document.querySelector("#engineForm");
const timestampInput = document.querySelector("#timestamp");

function pad(value, size = 2) {
  return String(value).padStart(size, "0");
}

function localDateTimeValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function fract(value) {
  return value - Math.floor(value);
}

function normalizeWave(value) {
  return (Math.sin(value) + Math.cos(value * 0.61803398875) + 2) / 4;
}

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicNoise(seed, index) {
  return fract(Math.abs(Math.sin((seed + 1) * (index + 17) * 12.9898) * 43758.5453));
}

function normalizeBirthDate(text) {
  const cleaned = text.trim().replace(/[./년월\s]/g, "-").replace(/일/g, "").replace(/-+/g, "-");
  const parts = cleaned.split("-").filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0].padStart(4, "0")}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  }
  return "1995-10-11";
}

function normalizeBirthTime(text) {
  const trimmed = text.trim();
  if (!trimmed) return "00:00";
  const match = trimmed.match(/(\d{1,2})\D?(\d{2})?/);
  if (!match) return "00:00";
  const hour = Math.min(23, Number(match[1] || 0));
  const minute = Math.min(59, Number(match[2] || 0));
  return `${pad(hour)}:${pad(minute)}`;
}

function formatBirthDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  const year = digits.slice(0, 4);
  const rawMonth = digits.slice(4, 6);
  const month = rawMonth.length === 2 ? pad(Math.min(12, Math.max(1, Number(rawMonth)))) : rawMonth;
  if (digits.length <= 6) return `${year}-${month}`;
  const rawDay = digits.slice(6);
  const day = rawDay.length === 2 ? pad(Math.min(31, Math.max(1, Number(rawDay)))) : rawDay;
  return `${year}-${month}-${day}`;
}

function formatBirthTimeInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits.length === 2 ? pad(Math.min(23, Number(digits))) : digits;
  }
  const hour = pad(Math.min(23, Number(digits.slice(0, 2))));
  const minute = digits.length === 4 ? pad(Math.min(59, Number(digits.slice(2)))) : digits.slice(2);
  return `${hour}:${minute}`;
}

function dateParts(dateText) {
  const [year, month, day] = normalizeBirthDate(dateText).split("-").map(Number);
  return { year, month, day };
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function setTimestamp(date) {
  timestampInput.value = localDateTimeValue(date);
}

function todayDrawTime() {
  const target = new Date();
  target.setHours(20, 35, 0, 0);
  return target;
}

function nextSaturdayDrawTime(from = new Date()) {
  const target = new Date(from);
  const days = (6 - target.getDay() + 7) % 7;
  target.setDate(target.getDate() + days);
  target.setHours(20, 35, 0, 0);
  if (target <= from) target.setDate(target.getDate() + 7);
  return target;
}

function parseRecentDraws(text) {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/[, ]+/).map((value) => Number(value.trim())))
    .filter((number) => Number.isInteger(number) && number >= 1 && number <= 45);
}

function parseEventText(text) {
  const source = text.trim() || "무사건";
  const matched = EVENT_RULES.find((rule) => source.includes(rule.keyword));
  const base = matched || { title: source, magnitude: 0.18, note: "사용자 입력 사건을 약한 외부장으로 반영합니다." };
  const hashBoost = deterministicNoise(hashString(source), 4) * 0.12;
  const magnitude = Math.min(0.95, base.magnitude + hashBoost);
  const damping = 0.7;
  return {
    name: base.title,
    raw: source,
    magnitude,
    damping,
    field: magnitude * damping,
    note: base.note
  };
}

function constantField(seed) {
  const constants = `${Math.PI}${Math.E}${(1 + Math.sqrt(5)) / 2}299792458384400`;
  const digits = constants.replace(/\D/g, "");
  let total = 0;
  for (let i = 0; i < digits.length; i += 1) {
    total += Number(digits[i]) * normalizeWave(seed / (i + 3));
  }
  return fract(total / digits.length);
}

function celestialMap(now) {
  const d = dayOfYear(now);
  const bodies = [88, 225, 365.256, 687, 4332.59, 10759.22, 30688.5];
  const aspects = [90, 120, 180];
  let field = 0;
  let resistance = 0;
  bodies.forEach((period, index) => {
    const angle = ((d % period) / period) * 360;
    field += Math.sin((angle * Math.PI) / 180) + Math.cos(((angle + index * 17) * Math.PI) / 180);
    aspects.forEach((aspect) => {
      resistance += 1 / (1 + Math.abs(((angle - aspect + 540) % 360) - 180));
    });
  });
  return normalizeWave(field + resistance * 9.7);
}

function zodiacGrid(month, day) {
  const ordinal = ((month * 31 + day) % 45) + 1;
  const axis = ZODIAC_AXES.find(([, min, max]) => ordinal >= min && ordinal <= max) || ZODIAC_AXES[0];
  return { value: normalizeWave(ordinal * axis[1] + axis[2]), axis, ordinal };
}

function sajuField(year, month, day, timeText) {
  const hour = Number(normalizeBirthTime(timeText).slice(0, 2));
  const stems = [year % 10, month % 10, day % 10, hour % 10];
  const branches = [year % 12, month % 12, day % 12, hour % 12];
  const forces = [0, 1, 2, 3, 4].map((index) => {
    const stemForce = stems.filter((value) => value % 5 === index).length;
    const branchForce = branches.filter((value) => value % 5 === index).length;
    return stemForce * 1.2 + branchForce;
  });
  const total = forces.reduce((a, b) => a + b, 0) || 1;
  const vector = forces.map((value) => value / total);
  const value = vector.reduce((sum, force, index) => sum + force * Math.sin((index + 1) * 1.618), 0);
  return { value: normalizeWave(value * 9), vector };
}

function biometricValues(birthDate, now) {
  const ageDays = Math.max(1, Math.floor((now - birthDate) / 86400000));
  return {
    ageDays,
    physical: Math.sin((2 * Math.PI * ageDays) / 23),
    emotional: Math.sin((2 * Math.PI * ageDays) / 28),
    intellectual: Math.sin((2 * Math.PI * ageDays) / 33)
  };
}

function biometricCycles(birthDate, now) {
  const bio = biometricValues(birthDate, now);
  return normalizeWave(bio.physical * 1.4 + bio.emotional + bio.intellectual * 1.2);
}

function numerologyField(year, month, day) {
  const root = `${year}${month}${day}`.split("").map(Number).reduce((a, b) => a + b, 0);
  const harmonic = Array.from({ length: 9 }, (_, index) => Math.sin((root * (index + 1)) / 9));
  return normalizeWave(harmonic.reduce((a, b) => a + b, 0));
}

function causalityRepulsion(draws) {
  if (!draws.length) return 0.11;
  const frequency = draws.reduce((map, number) => map.set(number, (map.get(number) || 0) + 1), new Map());
  const pressure = [...frequency.entries()].reduce((sum, [number, count]) => {
    return sum + (count / draws.length) * normalizeWave(number * count);
  }, 0);
  return Math.min(0.82, pressure);
}

function collectInput() {
  const birthDate = normalizeBirthDate(document.querySelector("#birthDate").value);
  const birthTime = normalizeBirthTime(document.querySelector("#birthTime").value);
  return {
    birthDate,
    birthTime,
    timestamp: timestampInput.value,
    event: parseEventText(document.querySelector("#majorEventText").value),
    recentDraws: parseRecentDraws(document.querySelector("#recentDraws").value)
  };
}

function buildField(input, variant = 0) {
  const { year, month, day } = dateParts(input.birthDate);
  const now = new Date(input.timestamp);
  const birth = new Date(`${input.birthDate}T${input.birthTime || "00:00"}`);
  const seed = hashString(`${input.birthDate}|${input.birthTime}|${input.timestamp}|${input.event.raw}|${variant}`);
  const zodiac = zodiacGrid(month, day);
  const saju = sajuField(year, month, day, input.birthTime);
  const eventMultiplier = variant === 1 ? 1.35 : 1;
  const resonanceMultiplier = variant === 2 ? 1.16 : 1;
  const layerValues = [
    constantField(seed),
    celestialMap(now),
    zodiac.value,
    saju.value,
    biometricCycles(birth, now),
    numerologyField(year, month, day),
    input.event.field * eventMultiplier,
    -causalityRepulsion(input.recentDraws),
    (deterministicNoise(seed, 91) * 0.2 + 0.15) * resonanceMultiplier
  ];
  const weights = [0.14, 0.13, 0.1, 0.11, 0.11, 0.1, 0.13, 0.1, 0.08];
  const weighted = layerValues.map((value, index) => value * weights[index]);
  const base = weighted.reduce((sum, value) => sum + value * 9, 0);
  const final = base * Math.sin(base + variant * 0.777);
  return { final, layerValues, weights, weighted, zodiac, saju, seed, event: input.event, bio: biometricValues(birth, now) };
}

function dominantLayer(field, offset) {
  let best = 0;
  let bestScore = -Infinity;
  field.layerValues.forEach((value, index) => {
    const score = Math.abs(Math.sin(value * (offset + 1) * 9.41) * field.weights[index]);
    if (score > bestScore) {
      best = index;
      bestScore = score;
    }
  });
  return best;
}

function topLayerIndexes(field, offset) {
  return field.layerValues
    .map((value, index) => ({ index, score: Math.abs(Math.sin(value * (offset + 1) * 9.41) * field.weights[index]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.index);
}

function extractSet(field, label, scale) {
  const numbers = [];
  const traces = [];
  let cursor = 0;
  while (numbers.length < 6 && cursor < 90) {
    const layerPulse = field.layerValues[cursor % field.layerValues.length] || 0;
    const raw = Math.abs((field.final + layerPulse) * (cursor + 1) * scale + deterministicNoise(field.seed, cursor) * 45);
    const number = Math.floor(raw % 45) + 1;
    if (!numbers.includes(number)) {
      traces.push({
        number,
        cursor,
        raw,
        dominant: dominantLayer(field, cursor),
        topLayers: topLayerIndexes(field, cursor),
        formula: `|F + L${(cursor % field.layerValues.length) + 1}| x ${cursor + 1} x ${Math.round(scale)}`
      });
      numbers.push(number);
    }
    cursor += 1;
  }
  numbers.sort((a, b) => a - b);
  traces.sort((a, b) => a.number - b.number);
  let bonus = Math.floor(Math.abs(field.final * scale * 1.909 + deterministicNoise(field.seed, 700) * 45) % 45) + 1;
  while (numbers.includes(bonus)) bonus = (bonus % 45) + 1;
  return { label, numbers, bonus, traces, field };
}

function runEngine(input) {
  const fields = [buildField(input, 0), buildField(input, 1), buildField(input, 2)];
  const sets = [
    extractSet(fields[0], "결정론 세트", 777.31),
    extractSet(fields[1], "이벤트 왜곡 세트", 913.17),
    extractSet(fields[2], "공명 세트", 1088.53)
  ];
  const basis = fields[0].weighted.map((value) => Math.abs(value));
  const total = basis.reduce((a, b) => a + b, 0) || 1;
  const contributions = basis.map((value, index) => ({
    ...LAYERS[index],
    percent: Math.round((value / total) * 100)
  }));
  const lookup = Object.fromEntries(contributions.map((item) => [item.key, item.percent]));
  const alignment = Math.round(Math.min(100, Math.max(0, Math.abs(Math.sin(fields[0].final)) * 72 + lookup.celestial + lookup.event * 0.65)));
  const instability = Math.round(Math.min(100, Math.max(0, lookup.event * 1.7 + lookup.entropy * 2.4 - lookup.saju * 0.5)));
  const nextWindow = new Date(new Date(input.timestamp).getTime() + (45 + Math.round(Math.abs(fields[0].final) * 137)) * 60000);
  return { sets, contributions, alignment, instability, nextWindow, field: fields[0], input };
}

function drawLine(ctx, points, color, width = 2, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.restore();
}

function makeOrbitLine(radius, color, tiltX, tiltZ) {
  const points = [];
  for (let i = 0; i <= 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.38 });
  const line = new THREE.Line(geometry, material);
  line.rotation.x = tiltX;
  line.rotation.z = tiltZ;
  return line;
}

function drawThreeFallback(result) {
  const canvas = document.querySelector("#threeField");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#070a0f";
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  result.contributions.forEach((layer, index) => {
    const radius = 42 + index * 13 + layer.percent * 0.6;
    ctx.strokeStyle = layer.color;
    ctx.globalAlpha = 0.24 + layer.percent / 180;
    ctx.lineWidth = index === 6 ? 2.4 : 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.55, radius * 0.62, index * 0.23, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 78);
  glow.addColorStop(0, "#f0d28e");
  glow.addColorStop(0.55, "rgba(95,201,213,.35)");
  glow.addColorStop(1, "rgba(95,201,213,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4f0e8";
  ctx.font = "700 14px system-ui";
  ctx.fillText("3D 라이브러리 대기 중: 2D 궤도 모드", 18, 28);
}

function initThreeField() {
  const canvas = document.querySelector("#threeField");
  if (!canvas || !window.THREE) return null;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 2.2, 7.2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0xf0d28e,
      emissive: 0x7a4d12,
      roughness: 0.32,
      metalness: 0.18
    })
  );
  scene.add(core);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.08, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x69cbd3, transparent: true, opacity: 0.12, wireframe: true })
  );
  scene.add(halo);
  const light = new THREE.PointLight(0xf0d28e, 3.4, 18);
  light.position.set(2.8, 3.6, 4.2);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x6d91a8, 1.15));
  const group = new THREE.Group();
  scene.add(group);
  const particles = new THREE.Group();
  scene.add(particles);
  const beams = new THREE.Group();
  scene.add(beams);
  const numberGroup = new THREE.Group();
  scene.add(numberGroup);
  state.three = { canvas, renderer, scene, camera, core, halo, group, particles, beams, numberGroup, layerMeshes: [], numberMeshes: [], layerData: [] };
  return state.three;
}

function updateThreeField(result) {
  const three = state.three || initThreeField();
  if (!three) {
    drawThreeFallback(result);
    renderThreeMeaning(result);
    return;
  }
  const activeSet = result.sets[state.selectedSetIndex] || result.sets[0];
  const activeTrace = state.selectedTrace || activeSet.traces[0];
  const activeLayers = new Set(activeTrace.topLayers);
  const rect = three.canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  three.renderer.setSize(width, height, false);
  three.camera.aspect = width / height;
  three.camera.updateProjectionMatrix();
  three.group.clear();
  three.particles.clear();
  three.beams.clear();
  three.numberGroup.clear();
  three.layerMeshes = [];
  three.numberMeshes = [];
  three.layerData = result.contributions;
  result.contributions.forEach((layer, index) => {
    const color = new THREE.Color(layer.color);
    const isActive = activeLayers.has(index);
    const radius = 1.18 + index * 0.17 + layer.percent * 0.022;
    const tiltX = 0.82 + index * 0.15;
    const tiltZ = index * 0.34;
    const orbit = makeOrbitLine(radius, color, tiltX, tiltZ);
    orbit.material.opacity = isActive ? 0.82 : 0.22;
    orbit.material.linewidth = isActive ? 3 : 1;
    three.group.add(orbit);
    const node = new THREE.Mesh(
      new THREE.SphereGeometry((isActive ? 0.12 : 0.075) + layer.percent * 0.004, 24, 24),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: isActive ? 0.62 : 0.25, roughness: 0.42 })
    );
    three.group.add(node);
    let beam = null;
    if (isActive) {
      const beamGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const beamMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.78 });
      beam = new THREE.Line(beamGeometry, beamMaterial);
      three.beams.add(beam);
    }
    three.layerMeshes.push({ node, orbit, beam, radius, tiltX, tiltZ, speed: 0.0045 + index * 0.0009, phase: index * 0.7, layer, isActive });
  });
  activeSet.traces.forEach((trace, index) => {
    const angle = -Math.PI / 2 + (index / activeSet.traces.length) * Math.PI * 2;
    const selected = trace.number === activeTrace.number;
    const material = new THREE.MeshStandardMaterial({
      color: selected ? 0xf0d28e : 0x243449,
      emissive: selected ? 0xb36b18 : 0x0c1722,
      emissiveIntensity: selected ? 0.62 : 0.18,
      roughness: 0.35
    });
    const numberNode = new THREE.Mesh(new THREE.SphereGeometry(selected ? 0.16 : 0.095, 24, 24), material);
    numberNode.position.set(Math.cos(angle) * 0.92, selected ? 0.72 : 0.52, Math.sin(angle) * 0.92);
    three.numberGroup.add(numberNode);
    three.numberMeshes.push({ node: numberNode, trace, selected, phase: angle });
  });
  const particleGeometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 220; i += 1) {
    const r = 1.2 + deterministicNoise(result.field.seed, i) * 3.8;
    const a = deterministicNoise(result.field.seed + 3, i) * Math.PI * 2;
    const y = (deterministicNoise(result.field.seed + 7, i) - 0.5) * 3.6;
    positions.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }
  particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({ color: 0xd7deea, size: 0.018, transparent: true, opacity: 0.42 });
  three.particles.add(new THREE.Points(particleGeometry, particleMaterial));
  renderThreeMeaning(result);
}

function animateThreeField() {
  const three = state.three;
  if (!three) return;
  const t = performance.now();
  three.core.rotation.y += 0.01;
  three.halo.rotation.x += 0.006;
  three.halo.rotation.y -= 0.004;
  three.group.rotation.y += 0.0028;
  three.particles.rotation.y -= 0.0009;
  three.layerMeshes.forEach((mesh, index) => {
    const angle = t * mesh.speed + mesh.phase;
    const local = new THREE.Vector3(Math.cos(angle) * mesh.radius, 0, Math.sin(angle) * mesh.radius);
    local.applyEuler(new THREE.Euler(mesh.tiltX, 0, mesh.tiltZ));
    mesh.node.position.copy(local);
    mesh.node.scale.setScalar(1 + Math.sin(t * 0.002 + index) * (mesh.isActive ? 0.24 : 0.12));
    if (mesh.beam) {
      const positions = mesh.beam.geometry.attributes.position;
      positions.setXYZ(0, local.x, local.y, local.z);
      positions.setXYZ(1, 0, 0, 0);
      positions.needsUpdate = true;
    }
  });
  three.numberMeshes.forEach((mesh, index) => {
    mesh.node.position.y = (mesh.selected ? 0.72 : 0.52) + Math.sin(t * 0.0025 + index) * 0.04;
    mesh.node.rotation.y += 0.02;
  });
  three.renderer.render(three.scene, three.camera);
}

function renderThreeMeaning(result) {
  const target = document.querySelector("#threeMeaning");
  if (!target) return;
  const set = result.sets[state.selectedSetIndex] || result.sets[0];
  const trace = state.selectedTrace || set.traces[0];
  const layer = LAYERS[trace.dominant];
  const topLayers = trace.topLayers.map((index) => result.contributions[index]).filter(Boolean);
  target.innerHTML = `
    <strong>${trace.number}번의 3D 경로</strong>
    <p>큰 궤도는 기여도가 높은 레이어입니다. 밝은 빔은 이 번호를 만든 상위 간섭 3개입니다.</p>
    <div class="three-layer-list">
      ${topLayers.map((item) => `
        <div class="three-layer-item">
          <span>${item.name}</span>
          <div class="three-layer-track"><div class="three-layer-fill" style="width:${item.percent}%; background:${item.color}"></div></div>
          <b>${item.percent}%</b>
        </div>
      `).join("")}
    </div>
    <p>지배 레이어: <b style="color:${layer.color}">${layer.name}</b> · 사건장 ${result.input.event.field.toFixed(2)}</p>
  `;
}

function drawWaveCanvas(result) {
  const canvas = document.querySelector("#waveCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#070a0f";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  for (let y = 40; y < h; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const tick = state.waveTick;
  const composite = [];
  LAYERS.forEach((layer, index) => {
    const amp = Math.abs(result.field.layerValues[index] * result.field.weights[index]) * 190;
    const freq = 1 + index * 0.23;
    const points = [];
    for (let x = 0; x <= w; x += 8) {
      const phase = x / 84 * freq + tick * 0.035 + index;
      const y = h / 2 + Math.sin(phase) * amp;
      points.push({ x, y });
      composite[x] = (composite[x] || 0) + Math.sin(phase) * amp;
    }
    drawLine(ctx, points, layer.color, 1.2, index === 6 ? 0.75 : 0.32);
  });
  const compositePoints = [];
  for (let x = 0; x <= w; x += 8) {
    compositePoints.push({ x, y: h / 2 + (composite[x] || 0) * 0.36 });
  }
  drawLine(ctx, compositePoints, "#f0d28e", 4, 0.95);
  ctx.fillStyle = "#f4f0e8";
  ctx.font = "700 18px system-ui";
  ctx.fillText("합성파 F x sin(F)", 24, 34);
  ctx.fillStyle = "#aeb7c8";
  ctx.font = "13px system-ui";
  ctx.fillText("얇은 선 9개가 레이어 파동, 굵은 선이 최종 합성장입니다.", 24, 56);
}

function drawBioCanvas(result) {
  const canvas = document.querySelector("#bioCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#070a0f";
  ctx.fillRect(0, 0, w, h);
  const waves = [
    { label: "육체 23일", period: 23, color: "#69cbd3", value: result.field.bio.physical },
    { label: "감성 28일", period: 28, color: "#d97970", value: result.field.bio.emotional },
    { label: "지성 33일", period: 33, color: "#b7a4f4", value: result.field.bio.intellectual }
  ];
  waves.forEach((wave, waveIndex) => {
    const points = [];
    for (let x = 0; x <= w; x += 5) {
      const y = h / 2 + Math.sin((x / w) * Math.PI * 4 + result.field.bio.ageDays / wave.period) * (28 - waveIndex * 3);
      points.push({ x, y: y + waveIndex * 12 - 12 });
    }
    drawLine(ctx, points, wave.color, 2.4, 0.95);
    ctx.fillStyle = wave.color;
    ctx.font = "700 12px system-ui";
    ctx.fillText(`${wave.label}: ${Math.round(wave.value * 100)}%`, 18, 24 + waveIndex * 20);
  });
}

function renderZodiacGrid(result) {
  document.querySelector("#zodiacGrid").innerHTML = ZODIAC_AXES.map((axis) => {
    const active = axis[0] === result.field.zodiac.axis[0];
    return `<div class="zodiac-cell ${active ? "active" : ""}">
      <strong>${axis[0]}</strong>
      <span>${axis[1]}-${axis[2]} · ${axis[3]}</span>
    </div>`;
  }).join("");
}

function renderEventImpact(result) {
  const event = result.input.event;
  document.querySelector("#eventImpactLabel").textContent = `${event.name} 분석`;
  document.querySelector("#eventSummary").textContent =
    `${event.raw} → 크기 ${event.magnitude.toFixed(2)} x 완충 0.70 = 사건장 ${event.field.toFixed(2)}`;
  document.querySelector("#eventImpact").innerHTML = `
    <div class="impact-step"><strong>1</strong><span>입력 사건</span><b>${event.raw}</b></div>
    <div class="impact-step"><strong>2</strong><span>내부 크기</span><b>${event.magnitude.toFixed(2)}</b></div>
    <div class="impact-step"><strong>3</strong><span>완충 적용</span><b>${event.magnitude.toFixed(2)} x 0.70 = ${event.field.toFixed(2)}</b></div>
    <div class="impact-step"><strong>4</strong><span>최종장 이동</span><b>F_final = (F + ${event.field.toFixed(2)}) x sin(F)</b></div>
    <p>${event.note}</p>
  `;
}

function renderVisual(result) {
  const svg = document.querySelector("#fieldVisual");
  svg.setAttribute("viewBox", window.innerWidth < 560 ? "120 0 520 430" : "0 0 760 430");
  const set = result.sets[state.selectedSetIndex];
  const trace = state.selectedTrace || set.traces[0];
  document.querySelector("#activeSetLabel").textContent = set.label;
  const cx = 380;
  const cy = 210;
  const layerNodes = result.contributions.map((item, index) => {
    const angle = -Math.PI / 2 + (index / result.contributions.length) * Math.PI * 2;
    const radius = 155 + item.percent * 1.2;
    return { ...item, index, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, active: trace.topLayers.includes(index) };
  });
  const numberNodes = set.traces.map((item, index) => {
    const angle = -Math.PI / 2 + (index / set.traces.length) * Math.PI * 2;
    return { ...item, x: cx + Math.cos(angle) * 76, y: cy + Math.sin(angle) * 76, selected: item.number === trace.number };
  });
  svg.innerHTML = `
    <defs><radialGradient id="coreGlow"><stop offset="0%" stop-color="#f0d28e" stop-opacity=".95" /><stop offset="100%" stop-color="#69cbd3" stop-opacity="0" /></radialGradient></defs>
    <rect width="760" height="430" rx="8" fill="rgba(5,7,11,.42)" />
    <circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="rgba(255,255,255,.08)" />
    <circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="rgba(255,255,255,.11)" />
    <circle cx="${cx}" cy="${cy}" r="62" fill="url(#coreGlow)" />
    ${layerNodes.map((node) => `<line x1="${node.x}" y1="${node.y}" x2="${cx}" y2="${cy}" stroke="${node.color}" stroke-width="${node.active ? 3 : 1}" opacity="${node.active ? .85 : .22}" />`).join("")}
    ${layerNodes.map((node) => `<g><circle cx="${node.x}" cy="${node.y}" r="${10 + node.percent * .34}" fill="${node.color}" opacity="${node.active ? .92 : .42}" /><text x="${node.x}" y="${node.y - 22}" text-anchor="middle" fill="#d7deea" font-size="12">${node.name}</text><text x="${node.x}" y="${node.y + 4}" text-anchor="middle" fill="#111723" font-size="11" font-weight="800">${node.percent}</text></g>`).join("")}
    ${numberNodes.map((node) => `<line x1="${cx}" y1="${cy}" x2="${node.x}" y2="${node.y}" stroke="${node.selected ? "#f0d28e" : "rgba(255,255,255,.22)"}" stroke-width="${node.selected ? 4 : 1.5}" /><g class="visual-number" data-number="${node.number}"><circle cx="${node.x}" cy="${node.y}" r="${node.selected ? 22 : 18}" fill="${node.selected ? "#f0d28e" : "#1d2737"}" stroke="${node.selected ? "#fff" : "rgba(255,255,255,.25)"}" /><text x="${node.x}" y="${node.y + 5}" text-anchor="middle" fill="${node.selected ? "#111723" : "#f4f0e8"}" font-size="15" font-weight="800">${node.number}</text></g>`).join("")}
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#f4f0e8" font-size="13" font-weight="800">통합장 F</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#aeb7c8" font-size="11">F x sin(F)</text>
  `;
  svg.querySelectorAll(".visual-number").forEach((node) => {
    node.addEventListener("mouseenter", () => selectNumber(Number(node.dataset.number), result));
    node.addEventListener("click", () => selectNumber(Number(node.dataset.number), result));
  });
}

function selectNumber(number, result) {
  const set = result.sets[state.selectedSetIndex];
  state.selectedTrace = set.traces.find((trace) => trace.number === number);
  renderResult(result, false);
}

function renderSets(result) {
  document.querySelector("#sets").innerHTML = result.sets.map((set, setIndex) => `
    <article class="set-card ${state.selectedSetIndex === setIndex ? "selected" : ""}" data-set-index="${setIndex}">
      <div class="set-title">${set.label}</div>
      <div class="set-kind">번호에 마우스를 올리면 영향 레이어가 표시됩니다</div>
      <div class="balls">
        ${set.traces.map((trace) => `<button class="ball" type="button" data-set-index="${setIndex}" data-number="${trace.number}" title="${LAYERS[trace.dominant].name} 영향">${trace.number}</button>`).join("")}
        <span class="ball bonus">${set.bonus}</span>
      </div>
    </article>
  `).join("");
  document.querySelectorAll(".set-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedSetIndex = Number(card.dataset.setIndex);
      state.selectedTrace = result.sets[state.selectedSetIndex].traces[0];
      renderResult(result, false);
    });
  });
  document.querySelectorAll(".ball[data-number]").forEach((button) => {
    button.addEventListener("mouseenter", (event) => {
      event.stopPropagation();
      state.selectedSetIndex = Number(button.dataset.setIndex);
      state.selectedTrace = result.sets[state.selectedSetIndex].traces.find((trace) => trace.number === Number(button.dataset.number));
      renderResult(result, false);
    });
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedSetIndex = Number(button.dataset.setIndex);
      state.selectedTrace = result.sets[state.selectedSetIndex].traces.find((trace) => trace.number === Number(button.dataset.number));
      renderResult(result, false);
    });
  });
}

function renderContributions(result) {
  document.querySelector("#contributionTable").innerHTML = result.contributions.map((item) => `
    <div class="bar-row">
      <span>${item.name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${item.percent}%; background:${item.color}"></div></div>
      <strong>${item.percent}%</strong>
    </div>
  `).join("");
}

function renderTiming(result) {
  document.querySelector("#timingEngine").innerHTML = `
    <div class="timing-row"><span>정렬 점수</span><strong>${result.alignment}/100</strong></div>
    <div class="timing-row"><span>불안정 지수</span><strong>${result.instability}/100</strong></div>
    <div class="timing-row"><span>최적 구매 시점</span><strong>${result.nextWindow.toLocaleString("ko-KR")}</strong></div>
    <div class="timing-row"><span>지배 황도축</span><strong>${result.field.zodiac.axis[0]} · ${result.field.zodiac.axis[3]}</strong></div>
  `;
}

function renderExplanation(result) {
  const set = result.sets[state.selectedSetIndex];
  const trace = state.selectedTrace || set.traces[0];
  const layer = LAYERS[trace.dominant];
  const top = trace.topLayers.map((index) => LAYERS[index].name).join(" + ");
  document.querySelector("#numberExplain").innerHTML = `
    <strong>${trace.number}번</strong>
    <p>${set.label}에서 <b style="color:${layer.color}">${layer.name}</b> 레이어가 가장 강하게 작용했습니다.</p>
    <p>주요 간섭: ${top}</p>
    <p>추출식: ${trace.formula} → 45칸 압축 → ${trace.number}</p>
  `;
}

function renderResult(result, resetSelection = true) {
  state.result = result;
  if (resetSelection) {
    state.selectedSetIndex = 0;
    state.selectedTrace = result.sets[0].traces[0];
  }
  document.querySelector("#alignmentScore").textContent = result.alignment;
  updateThreeField(result);
  drawWaveCanvas(result);
  drawCleanWaveCaption();
  drawBioCanvas(result);
  drawCleanBioCaption(result);
  renderZodiacGrid(result);
  renderEventImpact(result);
  renderVisual(result);
  renderSets(result);
  renderContributions(result);
  renderTiming(result);
  renderExplanation(result);
  document.querySelector("#narrativeText").textContent =
    `${result.input.event.name}은 사건 중력 레이어에 ${result.input.event.field.toFixed(2)}만큼 더해졌습니다. 이 값은 번호를 하나로 지정하지 않고 통합 파동장 전체를 이동시켜 F_final을 바꾸며, 바뀐 F_final이 1부터 45까지의 좌표로 압축되면서 현재 번호들이 나타납니다. 이 앱은 시각화용 계산 엔진이며 실제 추첨 확률을 바꾸지는 않습니다.`;
}

function drawBackground() {
  const canvas = document.querySelector("#fieldCanvas");
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#07090d";
  ctx.fillRect(0, 0, w, h);
  for (let ring = 0; ring < 9; ring += 1) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${95 + ring * 14}, ${170 - ring * 8}, ${190 - ring * 4}, ${0.08 + ring * 0.01})`;
    ctx.lineWidth = 1;
    const radius = Math.min(w, h) * (0.16 + ring * 0.055);
    ctx.ellipse(w * 0.62, h * 0.48, radius * 1.55, radius, ring * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawCleanWaveCaption() {
  const canvas = document.querySelector("#waveCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#070a0f";
  ctx.fillRect(0, 0, canvas.width, 70);
  ctx.fillStyle = "#f4f0e8";
  ctx.font = "700 18px system-ui";
  ctx.fillText("\ud569\uc131\ud30c F x sin(F)", 24, 34);
  ctx.fillStyle = "#aeb7c8";
  ctx.font = "13px system-ui";
  ctx.fillText("\uc587\uc740 \uc120 9\uac1c\uac00 \ub808\uc774\uc5b4 \ud30c\ub3d9, \uad75\uc740 \uc120\uc774 \ucd5c\uc885 \ud569\uc131\uc7a5\uc785\ub2c8\ub2e4.", 24, 56);
}

function drawCleanBioCaption(result) {
  const canvas = document.querySelector("#bioCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#070a0f";
  ctx.fillRect(10, 8, 170, 64);
  const rows = [
    ["육체 23일", result.field.bio.physical, "#69cbd3"],
    ["감성 28일", result.field.bio.emotional, "#d97970"],
    ["지성 33일", result.field.bio.intellectual, "#b7a4f4"]
  ];
  rows.forEach(([label, value, color], index) => {
    ctx.fillStyle = color;
    ctx.font = "700 12px system-ui";
    ctx.fillText(`${label}: ${Math.round(value * 100)}%`, 18, 24 + index * 20);
  });
}

function renderSets(result) {
  document.querySelector("#sets").innerHTML = result.sets.map((set, setIndex) => `
    <article class="set-card ${state.selectedSetIndex === setIndex ? "selected" : ""}" data-set-index="${setIndex}">
      <div class="set-title">${set.label}</div>
      <div class="set-kind">번호에 마우스를 올리면 영향 레이어가 표시됩니다</div>
      <div class="balls">
        ${set.traces.map((trace) => `<button class="ball" type="button" data-set-index="${setIndex}" data-number="${trace.number}" title="${LAYERS[trace.dominant].name} 영향">${trace.number}</button>`).join("")}
        <span class="ball bonus">${set.bonus}</span>
      </div>
    </article>
  `).join("");
  document.querySelectorAll(".set-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedSetIndex = Number(card.dataset.setIndex);
      state.selectedTrace = result.sets[state.selectedSetIndex].traces[0];
      renderResult(result, false);
    });
  });
  document.querySelectorAll(".ball[data-number]").forEach((button) => {
    const pick = (event) => {
      event.stopPropagation();
      state.selectedSetIndex = Number(button.dataset.setIndex);
      state.selectedTrace = result.sets[state.selectedSetIndex].traces.find((trace) => trace.number === Number(button.dataset.number));
      renderResult(result, false);
    };
    button.addEventListener("mouseenter", pick);
    button.addEventListener("click", pick);
  });
}

function renderTiming(result) {
  document.querySelector("#timingEngine").innerHTML = `
    <div class="timing-row"><span>정렬 점수</span><strong>${result.alignment}/100</strong></div>
    <div class="timing-row"><span>불안정 지수</span><strong>${result.instability}/100</strong></div>
    <div class="timing-row"><span>최적 구매 시점</span><strong>${result.nextWindow.toLocaleString("ko-KR")}</strong></div>
    <div class="timing-row"><span>지배 황도축</span><strong>${result.field.zodiac.axis[0]} · ${result.field.zodiac.axis[3]}</strong></div>
  `;
}

function renderExplanation(result) {
  const set = result.sets[state.selectedSetIndex];
  const trace = state.selectedTrace || set.traces[0];
  const layer = LAYERS[trace.dominant];
  const top = trace.topLayers.map((index) => LAYERS[index].name).join(" + ");
  document.querySelector("#numberExplain").innerHTML = `
    <strong>${trace.number}번</strong>
    <p>${set.label}에서 <b style="color:${layer.color}">${layer.name}</b> 레이어가 가장 강하게 작용했습니다.</p>
    <p>주요 간섭: ${top}</p>
    <p>추출식: ${trace.formula} → 45칸 압축 → ${trace.number}</p>
  `;
}

function normalizeResultLabels(result) {
  ["결정론 세트", "이벤트 왜곡 세트", "공명 세트"].forEach((label, index) => {
    if (result.sets[index]) result.sets[index].label = label;
  });
}

function recalc() {
  const result = runEngine(collectInput());
  normalizeResultLabels(result);
  renderResult(result);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  recalc();
  document.querySelector("#sets")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#birthDate").addEventListener("input", (event) => {
  event.target.value = formatBirthDateInput(event.target.value);
  recalc();
});

document.querySelector("#birthTime").addEventListener("input", (event) => {
  event.target.value = formatBirthTimeInput(event.target.value);
  recalc();
});

["majorEventText", "recentDraws"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("input", recalc);
});

document.querySelector("#sampleDraws").addEventListener("click", () => {
  document.querySelector("#recentDraws").value = "6, 13, 18, 22, 35, 40\n1, 9, 16, 28, 31, 44\n4, 11, 21, 29, 37, 45";
  recalc();
});

document.querySelector("#useNow").addEventListener("click", () => {
  setTimestamp(new Date());
  recalc();
});

document.querySelector("#useDrawTime").addEventListener("click", () => {
  setTimestamp(todayDrawTime());
  recalc();
});

document.querySelector("#useNextSaturday").addEventListener("click", () => {
  setTimestamp(nextSaturdayDrawTime());
  recalc();
});

const bgMusic = document.querySelector("#bgMusic");
const musicToggle = document.querySelector("#musicToggle");
if (bgMusic && musicToggle) {
  bgMusic.volume = 0.42;
  musicToggle.addEventListener("click", async () => {
    if (bgMusic.paused) {
      try {
        await bgMusic.play();
        musicToggle.textContent = "음악 끄기";
      } catch (error) {
        musicToggle.textContent = "다시 누르기";
      }
    } else {
      bgMusic.pause();
      musicToggle.textContent = "음악 켜기";
    }
  });
}

setTimestamp(new Date());
drawBackground();
recalc();
state.waveTimer = setInterval(() => {
  state.waveTick += 1;
  if (state.result) {
    drawWaveCanvas(state.result);
    drawCleanWaveCaption();
  }
  animateThreeField();
}, 80);
window.addEventListener("resize", () => {
  drawBackground();
  if (state.result) updateThreeField(state.result);
  if (state.result) renderVisual(state.result);
});
