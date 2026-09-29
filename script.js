// Hiperparámetros y funciones del modelo que también usan las pruebas.
const STORAGE_KEY = 'paloma_perceptron_state_v2';
const eta = 0.25;
const { PATTERNS: patterns, desiredOutput, predict: modelPredict, trainPattern } = window.perceptronModel;

const randomBetween = (min, max) => min + Math.random() * (max - min);

// Fisher-Yates mezcla el orden de aprendizaje sin cambiar la tabla fija.
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Parámetros, progreso y datos que se conservan entre recargas.
let state = {
  weights: [0, 0, 0],
  bias: 0,
  epoch: 0,
  errors: [],
  logs: [],
  currentIndex: 0,
  order: [],
  initialWeights: [0, 0, 0],
  initialBias: 0,
  trainingStarted: false,
  trainingComplete: false
};

let selected = { x1: -1, x2: -1, x3: -1 };
let training = false;

const $ = (id) => document.getElementById(id);
const sign = (n) => (n >= 0 ? 1 : -1);
const fmt = (n) => (Math.abs(n) < 0.005 ? '0' : Number.isInteger(n) ? String(n) : n.toFixed(2));
const valueLabel = (v) => (v === 1 ? '+1' : '−1');
const targetLabel = (target) => (target === 1 ? 'Éxito: come (+1)' : 'Fracaso: no come (−1)');

// Cuenta las clasificaciones incorrectas sobre los ocho patrones.
function computeErrorCount() {
  return patterns.filter((pattern) => predict(pattern.input) !== pattern.target).length;
}

function predict(input) {
  return modelPredict(state.weights, state.bias, input);
}

// Inicia una sesión nueva con pesos y sesgo aleatorios.
function initializeRandomWeights() {
  state.weights = [randomBetween(-1, 1), randomBetween(-1, 1), randomBetween(-1, 1)];
  state.bias = randomBetween(-1, 1);
  state.initialWeights = [...state.weights];
  state.initialBias = state.bias;
  state.errors = [];
  state.logs = [];
  state.epoch = 0;
  state.currentIndex = 0;
  state.order = shuffle(patterns);
  state.trainingStarted = false;
  state.trainingComplete = false;
  state.errors.push(computeErrorCount());
  $('learningState').textContent = 'Perceptrón inicializado con pesos y sesgo aleatorios.';
}

// Persiste el estado; el indicador visual de guardado es opcional.
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const memoryText = $('memoryText');
  if (memoryText) memoryText.textContent = 'Guardado';
}

// Recupera el último estado si existe uno válido en el navegador.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.weights) && saved.weights.length === 3) {
      state = { ...state, ...saved };
      if (!state.order || !state.order.length) {
        state.order = shuffle(patterns);
      }
      return true;
    }
  } catch (error) {
    console.warn('No se pudo cargar memoria local', error);
  }
  return false;
}

// Sincroniza los botones bipolares con las entradas seleccionadas.
function renderButtons() {
  document.querySelectorAll('.segmented').forEach((group) => {
    const target = group.dataset.target;
    group.querySelectorAll('button').forEach((button) => {
      const active = Number(button.dataset.value) === selected[target];
      button.classList.toggle('active', active);
      button.onclick = () => {
        selected[target] = Number(button.dataset.value);
        renderButtons();
        renderCurrent();
        evaluateCurrent();
      };
    });
  });
}

// Actualiza el diagrama y la salida para el patrón seleccionado.
function renderCurrent() {
  const input = [selected.x1, selected.x2, selected.x3];
  const target = desiredOutput(input);
  const output = predict(input);

  $('nodeX1').textContent = valueLabel(selected.x1);
  $('nodeX2').textContent = valueLabel(selected.x2);
  $('nodeX3').textContent = valueLabel(selected.x3);
  $('currentX1').textContent = valueLabel(selected.x1);
  $('currentX2').textContent = valueLabel(selected.x2);
  $('currentX3').textContent = valueLabel(selected.x3);
  $('currentYD').textContent = valueLabel(target);
  $('currentY').textContent = valueLabel(output);
  $('currentYValue').textContent = valueLabel(output);
  $('perceptronOutput').textContent = valueLabel(output);
  $('desiredOutput').textContent = targetLabel(target);
}

function setResult(ok, title, text) {
  const box = $('resultBox');
  box.className = 'result-box ' + (ok === true ? 'success' : ok === false ? 'fail' : '');
  $('resultIcon').textContent = ok === true ? '✓' : ok === false ? '×' : '—';
  $('resultTitle').textContent = title;
  $('resultText').textContent = text;
}

// Compara la predicción actual con la salida deseada del caso.
function evaluateCurrent() {
  const input = [selected.x1, selected.x2, selected.x3];
  const target = desiredOutput(input);
  const output = predict(input);
  const ok = output === target;

  $('desiredOutput').textContent = targetLabel(target);
  const expected = targetLabel(target);
  const outputText = targetLabel(output);
  setResult(ok, ok ? 'Correcto' : 'Incorrecto', `La salida deseada es ${expected}. El perceptrón predijo ${outputText}.`);
}

// Muestra progreso, precisión y parámetros actuales/finales.
function renderMetrics() {
  const correct = patterns.filter((pattern) => predict(pattern.input) === pattern.target).length;

  $('w1').textContent = fmt(state.weights[0]);
  $('w2').textContent = fmt(state.weights[1]);
  $('w3').textContent = fmt(state.weights[2]);
  $('bias').textContent = fmt(state.bias);
  $('initialWeights').textContent = `[${state.initialWeights.map(fmt).join(', ')}]`;
  $('initialBias').textContent = fmt(state.initialBias);
  $('finalWeights').textContent = state.trainingComplete ? `[${state.weights.map(fmt).join(', ')}]` : '—';
  $('finalBias').textContent = state.trainingComplete ? fmt(state.bias) : '—';
  $('epoch').textContent = String(state.epoch);
  $('epochError').textContent = state.errors.length ? String(state.errors.at(-1)) : '—';
  $('accuracy').textContent = `${correct} / 8`;
  $('trainingState').textContent = state.trainingComplete ? 'Aprendida' : state.trainingStarted ? 'Aprendiendo' : 'Inicial';
}

// La fila y la salida deseada son fijas; solo cambia la predicción.
function renderPatternTable() {
  $('patternBody').innerHTML = patterns.map((pattern, index) => {
    const y = predict(pattern.input);
    const ok = y === pattern.target;
    return `
      <tr class="${ok ? 'correct' : 'incorrect'}">
        <td>${index + 1}</td>
        <td>${valueLabel(pattern.input[0])}</td>
        <td>${valueLabel(pattern.input[1])}</td>
        <td>${valueLabel(pattern.input[2])}</td>
        <td>${pattern.target === 1 ? '+1' : '−1'}</td>
        <td>${y === 1 ? '+1' : '−1'}</td>
        <td>${ok ? '✓' : '×'}</td>
      </tr>
    `;
  }).join('');
}

function renderLog() {
  $('log').innerHTML = state.logs.slice(-10).reverse().map((line) => `<div class="log-line">${line}</div>`).join('');
}

// Grafica el número de errores registrado al final de cada época.
function drawChart() {
  const canvas = $('errorChart');
  const wrapper = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (!state.errors.length) {
    $('chartEmpty').style.display = 'grid';
    return;
  }

  $('chartEmpty').style.display = 'none';

  const padLeft = 32;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 20;
  const maxError = 8;
  const maxEpoch = Math.max(state.errors.length - 1, 1);
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  ctx.strokeStyle = 'rgba(48, 55, 64, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= maxError; i += 1) {
    const y = padTop + (plotHeight * (1 - i / maxError));
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.fillStyle = '#5e5c57';
    ctx.font = '10px "Lora", serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(i), padLeft - 8, y + 3);
  }

  const points = state.errors.map((value, index) => {
    const x = padLeft + (index / maxEpoch) * plotWidth;
    const y = padTop + (1 - value / maxError) * plotHeight;
    return { x, y };
  });

  const epochInterval = Math.max(1, Math.ceil(maxEpoch / 5));
  ctx.textAlign = 'center';
  for (let epoch = 0; epoch <= maxEpoch; epoch += epochInterval) {
    const x = padLeft + (epoch / maxEpoch) * plotWidth;
    ctx.fillText(String(epoch), x, height - 3);
  }
  if (maxEpoch % epochInterval !== 0) {
    ctx.fillText(String(maxEpoch), width - padRight, height - 3);
  }

  const gradient = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
  gradient.addColorStop(0, 'rgba(181, 201, 102, 0.4)');
  gradient.addColorStop(1, 'rgba(181, 201, 102, 0.06)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((point, index) => {
    if (index > 0) {
      const prev = points[index - 1];
      const cx = (prev.x + point.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + point.y) / 2);
    }
  });
  const end = points[points.length - 1];
  ctx.lineTo(end.x, end.y);
  ctx.lineTo(end.x, height - padBottom);
  ctx.lineTo(points[0].x, height - padBottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      const prev = points[index - 1];
      const cx = (prev.x + point.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + point.y) / 2);
    }
  });
  const lastPoint = points[points.length - 1];
  ctx.lineTo(lastPoint.x, lastPoint.y);
  ctx.strokeStyle = '#442222';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(68, 34, 34, 0.18)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#B5C966';
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function render() {
  renderMetrics();
  renderPatternTable();
  renderLog();
  drawChart();
}

// No ajusta un patrón correcto; corrige pesos y sesgo si falla.
function applyTrainingPattern(pattern) {
  state.trainingStarted = true;
  const net = pattern.input.reduce((sum, value, index) => sum + state.weights[index] * value, state.bias);
  const actual = sign(net);
  const patternNumber = patterns.indexOf(pattern) + 1;
  const inputText = `[${pattern.input.join(', ')}]`;
  if (actual === pattern.target) {
    state.logs.push(`Época ${state.epoch + 1}, patrón ${patternNumber}, x=${inputText}: z=${fmt(net)}, y=${valueLabel(actual)}, yᵈ=${valueLabel(pattern.target)}. Correcto; no se actualizan W ni b.`);
    $('learningState').textContent = `Patrón ${patternNumber}: clasificación correcta; no requiere ajuste.`;
    return false;
  }

  const updated = trainPattern(pattern.input, pattern.target, state.weights, state.bias, eta);
  state.weights = updated.weights;
  state.bias = updated.bias;

  const message = `Época ${state.epoch + 1}, patrón ${patternNumber}, x=${inputText}: z=${fmt(net)}, y=${valueLabel(actual)}, yᵈ=${valueLabel(pattern.target)}. Ajuste η=${fmt(eta)} → W=[${state.weights.map(fmt).join(', ')}], b=${fmt(state.bias)}.`;
  state.logs.push(message);
  $('learningState').textContent = `Ajuste aplicado al patrón ${patternNumber}; W y b se actualizaron.`;
  return true;
}

// Avanza exactamente un patrón para mostrar el aprendizaje paso a paso.
async function step() {
  if (training || state.trainingComplete) return;
  training = true;

  const pattern = state.order[state.currentIndex % state.order.length];
  selected = { x1: pattern.input[0], x2: pattern.input[1], x3: pattern.input[2] };
  renderButtons();
  renderCurrent();

  applyTrainingPattern(pattern);
  state.currentIndex += 1;
  if (state.currentIndex % state.order.length === 0) {
    state.epoch += 1;
    const errors = computeErrorCount();
    state.errors.push(errors);
    state.order = shuffle(patterns);
    state.trainingComplete = errors === 0;
    $('learningState').textContent = state.trainingComplete
      ? `Entrenamiento completado en la época ${state.epoch}.`
      : `Época ${state.epoch} completada: ${errors} patrones incorrectos.`;
  }

  evaluateCurrent();
  save();
  render();
  training = false;
}

// Entrena por épocas completas hasta acertar todos los patrones o llegar al límite.
async function train() {
  if (training || state.trainingComplete) return;
  training = true;
  state.trainingStarted = true;
  state.currentIndex = 0;

  const maxCycles = 25;
  for (let cycle = 0; cycle < maxCycles; cycle += 1) {
    state.order = shuffle(patterns);
    for (let i = 0; i < state.order.length; i += 1) {
      const pattern = state.order[i];
      selected = { x1: pattern.input[0], x2: pattern.input[1], x3: pattern.input[2] };
      renderButtons();
      renderCurrent();
      applyTrainingPattern(pattern);
      evaluateCurrent();
      render();
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    state.epoch += 1;
    state.currentIndex = 0;
    const errors = computeErrorCount();
    state.errors.push(errors);
    state.trainingComplete = errors === 0;
    $('learningState').textContent = state.trainingComplete
      ? `Entrenamiento completado en la época ${state.epoch}.`
      : `Época ${state.epoch} completada: ${errors} patrones incorrectos.`;
    save();
    render();
    if (state.trainingComplete) {
      training = false;
      return;
    }
  }

  $('learningState').textContent = `Se alcanzó el límite de ${maxCycles} épocas; quedan ${computeErrorCount()} patrones incorrectos.`;
  training = false;
  save();
  render();
}

// Borra el estado guardado y crea una nueva inicialización aleatoria.
function reset() {
  training = false;
  localStorage.removeItem(STORAGE_KEY);
  state = {
    weights: [0, 0, 0],
    bias: 0,
    epoch: 0,
    errors: [],
    logs: [],
    currentIndex: 0,
    order: [],
    initialWeights: [0, 0, 0],
    initialBias: 0,
    trainingStarted: false,
    trainingComplete: false
  };

  initializeRandomWeights();
  selected = { x1: -1, x2: -1, x3: -1 };
  renderButtons();
  renderCurrent();
  setResult(null, 'Esperando patrón', 'Selecciona un valor para x₁, x₂ y x₃.');
  $('learningState').textContent = 'Se reinició la red neuronal con pesos y bias aleatorios.';
  $('desiredOutput').textContent = '—';
  save();
  render();
}

$('stepBtn').onclick = step;
$('trainBtn').onclick = train;
$('resetBtn').onclick = reset;
window.addEventListener('resize', drawChart);

// Al abrir, restaura el aprendizaje anterior o inicializa la red.
if (!load()) {
  initializeRandomWeights();
}
renderButtons();
renderCurrent();
setResult(null, 'Esperando patrón', 'Selecciona un valor para x₁, x₂ y x₃.');
if (state.trainingComplete) {
  $('learningState').textContent = `Entrenamiento completado en la época ${state.epoch}.`;
} else if (!state.trainingStarted) {
  $('learningState').textContent = 'Perceptrón inicializado; listo para entrenar.';
}
render();
