const slides = Array.from(document.querySelectorAll(".slide"));
const appShell = document.getElementById("appShell");
const operationButtons = Array.from(document.querySelectorAll("[data-op]"));
const firstNumberInput = document.getElementById("firstNumber");
const secondNumberInput = document.getElementById("secondNumber");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const replayBtn = document.getElementById("replayBtn");
const startBtn = document.getElementById("startBtn");
const boardStartBtn = document.getElementById("boardStartBtn");
const boardQuickStartBtn = document.getElementById("boardQuickStartBtn");
const boardWelcome = document.getElementById("boardWelcome");
const slidesSection = document.getElementById("slidesSection");
const progressFill = document.getElementById("progressFill");
const horizontalEquation = document.getElementById("horizontalEquation");
const verticalStack = document.getElementById("verticalStack");
const stepFlowDisplay = document.getElementById("stepFlowDisplay");
const rightCarryDisplay = document.getElementById("rightCarryDisplay");
const warmMathCanvas = document.getElementById("warmMath3d");
const mathSparkles = document.getElementById("mathSparkles");

const checkAnswerBtn = document.getElementById("checkAnswerBtn");
const stepAnswer = document.getElementById("stepAnswer");
const mathQuestionText = document.getElementById("mathQuestionText");
const candyContainer = document.getElementById("candyContainer");
const feedbackText = document.getElementById("feedbackText");
const finalSummaryText = document.getElementById("finalSummaryText");
const coachHint = document.getElementById("coachHint");

const TOTAL_GUIDE_STEPS = 4;

const state = {
  slide: 0,
  operation: "",
  a: "",
  b: "",
  calcCol: 0,
  carry: 0,
  maxCols: 2,
  hasPlayed: false,
  hasStarted: false,
  viVoice: null,
  typingTimer: null,
  frameTimers: [],
  highlightTimers: [],
  columnResults: [],
  carryInByCol: [],
  carryOutByCol: [],
  pendingCarryAnimCol: -1,
  isCheckingAnswer: false,
  isFlowAnimating: false,
  calcSessionKey: "",
  rightCarryValue: 0,
  rightCarryTargetCol: -1,
  step4Prompt: "",
  finalNarrationText: "",
  warmMathAnimId: null,
  warmMathResizeHandler: null,
  warmMathRenderer: null,
  speechUnlocked: false,
  speechSupported: ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window),
  step2ReadyAnnounced: false,
};

function unlockSpeech() {
  if (!state.speechSupported) {
    return;
  }
  const wasUnlocked = state.speechUnlocked;
  state.speechUnlocked = true;
  window.speechSynthesis.resume();
  if (!state.viVoice) {
    initVoices();
  }

  // Prime speech engine on first gesture so subsequent utterances are less likely blocked.
  if (!wasUnlocked) {
    try {
      const primer = new SpeechSynthesisUtterance(".");
      primer.volume = 0;
      primer.rate = 1;
      primer.pitch = 1;
      if (state.viVoice) {
        primer.voice = state.viVoice;
        primer.lang = state.viVoice.lang || "vi-VN";
      } else {
        primer.lang = String(navigator.language || "vi-VN");
      }
      window.speechSynthesis.speak(primer);
      window.speechSynthesis.cancel();
    } catch (error) {
      // Ignore primer errors and continue with normal speech flow.
    }
  }
}

function attachSpeechUnlockListeners() {
  const unlockOnce = () => {
    unlockSpeech();
    window.removeEventListener("pointerdown", unlockOnce);
    window.removeEventListener("keydown", unlockOnce);
    window.removeEventListener("touchstart", unlockOnce);
  };

  window.addEventListener("pointerdown", unlockOnce, { passive: true });
  window.addEventListener("keydown", unlockOnce);
  window.addEventListener("touchstart", unlockOnce, { passive: true });
}

function initMathSparkles() {
  if (!mathSparkles) {
    return;
  }

  mathSparkles.innerHTML = "";
  const symbols = ["+", "-", "x", "=", "?", "12", "7", "5", "9", "sqrt", "a+b", "3x", "10"];
  const sparkleCount = window.innerWidth < 760 ? 14 : 22;

  for (let i = 0; i < sparkleCount; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "math-sparkle";
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${70 + Math.random() * 45}%`;
    sparkle.style.setProperty("--delay", `${Math.random() * -16}s`);
    sparkle.style.setProperty("--dur", `${10 + Math.random() * 10}s`);
    sparkle.style.setProperty("--size", `${0.8 + Math.random() * 1.2}rem`);
    mathSparkles.appendChild(sparkle);
  }
}

function initWarmMath3d() {
  if (!warmMathCanvas || !window.THREE) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const THREE = window.THREE;
  const renderer = new THREE.WebGLRenderer({
    canvas: warmMathCanvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.z = 26;

  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(8.2, 0.34, 20, 90),
    new THREE.MeshBasicMaterial({
      color: 0xff9f2a,
      transparent: true,
      opacity: 0.42,
      wireframe: true,
    })
  );

  const innerMathBall = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.8, 1),
    new THREE.MeshBasicMaterial({
      color: 0xffe16f,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    })
  );

  ringGroup.add(torus);
  ringGroup.add(innerMathBall);

  const pointsCount = 260;
  const starPositions = new Float32Array(pointsCount * 3);
  for (let i = 0; i < pointsCount; i += 1) {
    const idx = i * 3;
    starPositions[idx] = (Math.random() - 0.5) * 70;
    starPositions[idx + 1] = (Math.random() - 0.5) * 50;
    starPositions[idx + 2] = (Math.random() - 0.5) * 30;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xffd98a,
      size: 0.34,
      transparent: true,
      opacity: 0.36,
    })
  );
  scene.add(stars);

  function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function animate() {
    ringGroup.rotation.x += 0.0018;
    ringGroup.rotation.y += 0.0022;
    innerMathBall.rotation.x -= 0.003;
    innerMathBall.rotation.z += 0.0022;
    stars.rotation.y += 0.0005;
    renderer.render(scene, camera);
    state.warmMathAnimId = window.requestAnimationFrame(animate);
  }

  handleResize();
  animate();

  const resizeHandler = () => handleResize();
  window.addEventListener("resize", resizeHandler);

  state.warmMathResizeHandler = resizeHandler;
  state.warmMathRenderer = renderer;
}

function isLikelyFemaleVoice(voice) {
  const identity = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  // Target common female Vietnamese voice names across systems
  return /(^|[\s_-])(female|feminine|woman|girl|nu|nữ|an|lê|hoài|mai)($|[\s_-])/.test(identity);
}

function initVoices() {
  if (!state.speechSupported) {
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  const viVoices = voices.filter((voice) => voice.lang && voice.lang.toLowerCase().startsWith("vi"));
  const browserLang = String(navigator.language || "").toLowerCase();
  const browserLangVoice = voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(browserLang.slice(0, 2)));
  state.viVoice = viVoices.find((voice) => isLikelyFemaleVoice(voice)) || viVoices[0] || browserLangVoice || voices[0] || null;
}

function buildUtterance(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const defaultLang = String(navigator.language || "vi-VN");
  utterance.lang = state.viVoice?.lang || defaultLang;
  utterance.rate = 0.9; // Slightly slower for clearer pronunciation
  utterance.pitch = 1.3; // Higher pitch for a clearer feminine/child-friendly voice
  utterance.volume = 1;
  if (state.viVoice) {
    utterance.voice = state.viVoice;
  }
  return utterance;
}

function speak(text) {
  if (!state.speechSupported) {
    return;
  }
  if (!state.speechUnlocked) {
    return;
  }
  window.speechSynthesis.resume();
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
  const utterance = buildUtterance(text);
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (!state.speechSupported) {
    return;
  }
  window.speechSynthesis.cancel();
}

function speakAsync(text, timeoutMs = 3600) {
  if (!state.speechSupported || !state.speechUnlocked) {
    return Promise.resolve();
  }

  const dynamicTimeout = Math.max(timeoutMs, 2000 + String(text || "").length * 120);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    window.speechSynthesis.resume();
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    const utterance = buildUtterance(text);
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
    setTimeout(finish, dynamicTimeout);
  });
}

function updateProgress() {
  const visualStep = Math.max(state.slide, 0);
  progressFill.style.width = `${(visualStep / (slides.length - 1)) * 100}%`;
}

function setCoachHint(text) {
  if (!coachHint) {
    return;
  }
  coachHint.textContent = text;
}

function updateCoachHintBySlide(index) {
  if (index === 0) {
    setCoachHint("Nhấn Bắt đầu để vào bài học, hoặc Bắt đầu nhanh để chơi ngay.");
    return;
  }
  if (index === 1) {
    setCoachHint("Hãy chọn phép tính Cộng hoặc Trừ.");
    return;
  }
  if (index === 2) {
    setCoachHint("Nhập số thứ nhất và số thứ hai vào hai ô.");
    return;
  }
  if (index === 3) {
    setCoachHint("Quan sát cách đặt tính trên bảng.");
    return;
  }
  if (index === 4) {
    setCoachHint("Nhìn kẹo để đếm và nhập đáp án, sau đó bấm Kiểm tra.");
    return;
  }
  setCoachHint("Đã hoàn thành bài toán, bạn ấn Tiếp theo để làm bài mới.");
}

function showSlide(index) {
  state.slide = index;
  slides.forEach((slide) => {
    const isCurrent = Number(slide.dataset.slide) === index;
    slide.classList.toggle("is-active", isCurrent);
  });

  // Hide nav icons on intro slide
  const navContainer = document.querySelector(".top-nav-row");
  if (navContainer) {
    navContainer.style.display = index === 0 ? "none" : "flex";
  }

  // Clear previous highlight timers
  clearHighlightTimers();

  // Remove highlight from all elements
  document.querySelectorAll('.highlight, .highlight-blue, .highlight-yellow, .active-col').forEach((el) => {
    el.classList.remove('highlight', 'highlight-blue', 'highlight-yellow', 'active-col', 'animate__animated', 'animate__pulse');
  });

  // Add highlight based on slide with sequential timing
  if (index === 1) {
    operationButtons.forEach((btn, i) => {
      const timerId = setTimeout(() => btn.classList.add('highlight'), i * 500);
      state.highlightTimers.push(timerId);
    });
  } else if (index === 2) {
    const timerId1 = setTimeout(() => firstNumberInput.classList.add('highlight-blue'), 0);
    const timerId2 = setTimeout(() => secondNumberInput.classList.add('highlight-yellow'), 1000);
    state.highlightTimers.push(timerId1, timerId2);
  }

  backBtn.disabled = index === 0;
  if (index === 0) {
    nextBtn.innerHTML = `<i class="bi bi-play-circle-fill"></i> Bắt đầu`;
  } else if (index === slides.length - 1) {
    nextBtn.innerHTML = `<i class="bi bi-arrow-clockwise"></i> Làm bài mới`;
  } else {
    nextBtn.innerHTML = `<i class="bi bi-arrow-right-circle-fill"></i> Tiếp theo`;
  }

  if (index === 4) {
    const hasSolvedCurrentCol = state.columnResults[state.calcCol] !== undefined && state.columnResults[state.calcCol] !== null;
    nextBtn.disabled = !hasSolvedCurrentCol;
  } else {
    nextBtn.disabled = false;
  }
  updateProgress();
  updateCoachHintBySlide(index);
  if (index !== 4) {
    speakCurrentSlide();
  }
}

function speakCurrentSlide() {
  if (state.slide === 0) {
    speak("Chào bạn. Bấm nút Bắt đầu để vào bài nhé.");
    return;
  }
  if (state.slide === 1) {
    speak("Bước một. Bạn hãy chọn nút cộng hoặc trừ.");
    return;
  }
  if (state.slide === 2) {
    speak("Bước hai. Bạn nhập số thứ nhất vào ô viền xanh, số thứ hai vào ô viền vàng.");
    return;
  }
  if (state.slide === 4) {
    speak(state.step4Prompt || "Bước bốn. Bạn nhìn kẹo để đếm theo từng cột, nhập kết quả, rồi bấm Kiểm tra.");
    return;
  }
  if (state.slide === 5) {
    speak(state.finalNarrationText || finalSummaryText?.textContent || "Chúc mừng bạn đã hoàn thành bài toán.");
    return;
  }
  const symbol = getOperationWord();
  speak(`Bước ba. Nhìn lên bảng để theo dõi phép ${symbol}. ${state.a} ${symbol} ${state.b}.`);
}

function getFinalResult() {
  const a = Number(state.a);
  const b = Number(state.b);
  if (state.operation === "add") return a + b;
  if (state.operation === "sub") return a - b;
  if (state.operation === "mul") return a * b;
  if (state.operation === "div") return b === 0 ? "không xác định" : (a / b).toFixed(2);
  return "?";
}

function launchFireworks() {
  const bursts = [0, 250, 500, 800, 1100];
  bursts.forEach((delay, index) => {
    const timerId = setTimeout(() => {
      const originX = 0.2 + (index % 3) * 0.3;
      confetti({
        particleCount: 140,
        spread: 90,
        startVelocity: 42,
        origin: { x: originX, y: 0.62 }
      });
    }, delay);
    state.frameTimers.push(timerId);
  });
}

function showFinalStep() {
  const symbol = getOperationSymbol();
  const operationWord = getOperationWord();
  const finalResult = getFinalResult();
  if (finalSummaryText) {
    finalSummaryText.textContent = `Vậy phép tính ${state.a} ${symbol} ${state.b} có kết quả là ${finalResult}. Chúc mừng bạn!`;
  }
  state.finalNarrationText = `Vậy phép tính ${state.a} ${operationWord} ${state.b} bằng ${finalResult}. Chúc mừng bạn!`;

  // Step 5: only show animated horizontal equation with final result.
  clearBoardTimers();
  clearStepFlowDisplay();
  verticalStack.innerHTML = "";
  const expression = getHorizontalExpression(finalResult);
  horizontalEquation.textContent = "";
  let pointer = 0;
  state.typingTimer = setInterval(() => {
    pointer += 1;
    horizontalEquation.textContent = expression.slice(0, pointer);
    if (pointer >= expression.length) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
  }, 70);

  launchFireworks();
}

function clearHighlightTimers() {
  state.highlightTimers.forEach((timerId) => clearTimeout(timerId));
  state.highlightTimers = [];
}

function clearBoardTimers() {
  if (state.typingTimer) {
    clearInterval(state.typingTimer);
    state.typingTimer = null;
  }
  state.frameTimers.forEach((timerId) => clearTimeout(timerId));
  state.frameTimers = [];
}

function clearStepFlowDisplay() {
  if (!stepFlowDisplay) {
    return;
  }
  stepFlowDisplay.textContent = "";
  stepFlowDisplay.classList.remove("show");
}

function animateBorrowStepFlow(borrowedValue, subtractValue, carryValue = 1) {
  if (!stepFlowDisplay) {
    return;
  }

  clearStepFlowDisplay();
  stepFlowDisplay.classList.add("show");

  const normalizedCarry = Math.max(0, Number(carryValue) || 0);
  const stepOne = `<span class="step-flow-frag">${borrowedValue} - ${subtractValue}</span>`;
  const stepTwo = `<span class="step-flow-frag"> - ${normalizedCarry}</span>`;

  stepFlowDisplay.innerHTML = stepOne;

  if (normalizedCarry > 0) {
    const timerId1 = setTimeout(() => {
      stepFlowDisplay.innerHTML = `${stepOne}${stepTwo}`;
    }, 620);

    const timerId2 = setTimeout(() => {
      stepFlowDisplay.textContent = `${borrowedValue} - ${subtractValue} - ${normalizedCarry}`;
    }, 1280);

    state.frameTimers.push(timerId1, timerId2);
  }
}

function getOperationSymbol() {
  switch (state.operation) {
    case "add": return "+";
    case "sub": return "−"; // Use proper minus sign
    case "mul": return "×";
    case "div": return "÷";
    default: return "";
  }
}

function getOperationWord() {
  switch (state.operation) {
    case "add": return "cộng";
    case "sub": return "trừ";
    case "mul": return "nhân";
    case "div": return "chia";
    default: return "";
  }
}

function getHorizontalExpression(result = "?") {
  const symbol = getOperationSymbol();
  return `${state.a} ${symbol} ${state.b} = ${result}`;
}

function buildCandyGroupHtml(count, itemIcon, extraClass = "") {
  const normalizedCount = Math.max(0, Number(count) || 0);
  const classAttr = `candy-group ${extraClass}`.trim();

  if (normalizedCount === 0) {
    return `<span class="${classAttr} candy-group-zero"><span class="candy-zero-gap" aria-label="0"></span></span>`;
  }

  const itemsHtml = Array.from({ length: normalizedCount }, () => `<span class="candy-item">${itemIcon}</span>`).join("");
  return `<span class="${classAttr}">${itemsHtml}</span>`;
}

function applyCandyDensityScale() {
  if (!candyContainer) {
    return;
  }

  candyContainer.classList.remove("candy-size-md", "candy-size-sm", "candy-size-xs");

  const tokenCount = candyContainer.querySelectorAll(".candy-item, .strike-candy").length;
  if (tokenCount > 30) {
    candyContainer.classList.add("candy-size-xs");
    return;
  }
  if (tokenCount > 22) {
    candyContainer.classList.add("candy-size-sm");
    return;
  }
  if (tokenCount > 15) {
    candyContainer.classList.add("candy-size-md");
  }
}

function buildSubtractionCandyGroupHtml(count, itemIcon, extraClass = "", perRow = 3) {
  const normalizedCount = Math.max(0, Number(count) || 0);
  const classAttr = `candy-group candy-group-block ${extraClass}`.trim();

  if (normalizedCount === 0) {
    return `<span class="${classAttr} candy-group-zero"><span class="candy-zero-gap" aria-label="0"></span></span>`;
  }

  const itemsHtml = Array.from({ length: normalizedCount }, () => `<span class="candy-item">${itemIcon}</span>`).join("");
  return `<span class="${classAttr}" style="--candy-cols: ${Math.max(1, perRow)};">${itemsHtml}</span>`;
}

function buildStrikeCandyGroupHtml(count, itemIcon, extraClass = "", delayStart = 0, baseDelay = 0.9) {
  const normalizedCount = Math.max(0, Number(count) || 0);
  const classAttr = `candy-group candy-group-strike candy-group-block ${extraClass}`.trim();

  if (normalizedCount === 0) {
    return `<span class="${classAttr} candy-group-zero"><span class="candy-zero-gap" aria-label="0"></span></span>`;
  }

  const itemsHtml = Array.from({ length: normalizedCount }, (_, index) => {
    const strikeDelay = baseDelay + (delayStart + index) * 0.2;
    return `<span class="strike-candy" style="--strike-delay: ${strikeDelay}s">${itemIcon}</span>`;
  }).join("");

  return `<span class="${classAttr}" style="--candy-cols: 3;">${itemsHtml}</span>`;
}

function buildAdditionCandyFrame(valA, valB, carryCount, carryCandyClass, itemIcon) {
  const parts = [
    buildCandyGroupHtml(valA, itemIcon),
    '<span class="candy-op">➕</span>',
    buildCandyGroupHtml(valB, itemIcon),
  ];

  if (carryCount > 0) {
    parts.push('<span class="candy-op">➕</span>');
    parts.push(buildCandyGroupHtml(carryCount, itemIcon, carryCandyClass));
  }

  return `<div class="candy-frame">${parts.join("")}</div>`;
}

function buildSubtractionCandyFrame(mainResultHtml, mainSubtractHtml, extraSubtractHtml = "") {
  const extraRow = extraSubtractHtml
    ? `<div class="subtraction-row subtraction-row-extra"><span class="candy-op">−</span>${extraSubtractHtml}</div>`
    : "";

  return `
    <div class="candy-frame subtraction-frame">
      <div class="subtraction-row subtraction-row-main">
        ${mainResultHtml}
        <span class="candy-op">−</span>
        ${mainSubtractHtml}
      </div>
      ${extraRow}
    </div>
  `;
}

function buildBorrowFlowCandyFrame(totalCount, subtractCount, carryCount, itemIcon, perRow = 3, baseDelay = 1.0) {
  const normalizedTotal = Math.max(0, Number(totalCount) || 0);
  const normalizedSubtract = Math.max(0, Math.min(Number(subtractCount) || 0, normalizedTotal));
  const normalizedCarry = Math.max(0, Math.min(Number(carryCount) || 0, normalizedTotal - normalizedSubtract));

  let subtractIndex = 0;
  let carryIndex = 0;
  const itemsHtml = Array.from({ length: normalizedTotal }, (_, index) => {
    if (index < normalizedSubtract) {
      const strikeDelay = baseDelay + subtractIndex * 0.2;
      subtractIndex += 1;
      return `<span class="strike-candy main-strike-token" style="--strike-delay: ${strikeDelay}s">${itemIcon}</span>`;
    }

    if (index < normalizedSubtract + normalizedCarry) {
      const strikeDelay = baseDelay + normalizedSubtract * 0.2 + carryIndex * 0.2;
      const carryStartClass = carryIndex === 0 ? " borrow-extra-start" : "";
      carryIndex += 1;
      return `<span class="strike-candy borrow-extra-token${carryStartClass}" style="--strike-delay: ${strikeDelay}s">${itemIcon}</span>`;
    }

    return `<span class="candy-item">${itemIcon}</span>`;
  }).join("");

  const candyGroup = `<span class="candy-group candy-group-block borrow-flow-group" style="--candy-cols: ${Math.max(1, perRow)};">${itemsHtml}</span>`;

  return `
    <div class="candy-frame subtraction-frame borrow-flow-frame">
      <div class="subtraction-row subtraction-row-main">${candyGroup}</div>
    </div>
  `;
}

function updateBoardPreview() {
  clearBoardTimers();
  clearStepFlowDisplay();
  verticalStack.innerHTML = "";

  if (!state.hasStarted) {
    horizontalEquation.textContent = "";
    return;
  }

  if (!state.operation) {
    horizontalEquation.textContent = "Chọn phép tính để bắt đầu";
    return;
  }

  const symbol = getOperationSymbol();
  const left = state.a === "" ? "_" : String(state.a);
  const right = state.b === "" ? "_" : String(state.b);
  horizontalEquation.textContent = `${left} ${symbol} ${right} =`;
}

function resetBoard() {
  updateBoardPreview();
}

function setBoardWelcomeVisibility(isVisible) {
  if (boardWelcome) {
    boardWelcome.classList.toggle("is-hidden", !isVisible);
  }
  if (slidesSection) {
    slidesSection.classList.toggle("is-hidden", isVisible);
  }
  if (appShell) {
    appShell.classList.toggle("start-mode", isVisible);
    appShell.classList.toggle("play-mode", !isVisible);
  }
}

function beginLesson() {
  unlockSpeech();
  state.hasStarted = true;
  setBoardWelcomeVisibility(false);
  updateBoardPreview();
  showSlide(1);
}

function beginQuickStart() {
  unlockSpeech();
  state.hasStarted = true;
  setBoardWelcomeVisibility(false);
  // Tự sinh phép toán Random
  const ops = ["add", "sub"];
  state.operation = ops[Math.floor(Math.random() * ops.length)];
  
  // Tự sinh số Random có 2 chữ số (10 - 99)
  let randomA = Math.floor(Math.random() * 90) + 10;
  let randomB = Math.floor(Math.random() * 90) + 10;
  
  // Đảm bảo phép trừ thì số lớn trừ số bé
  if (state.operation === "sub" && randomA < randomB) {
    const temp = randomA;
    randomA = randomB;
    randomB = temp;
  }
  
  state.a = randomA;
  state.b = randomB;
  firstNumberInput.value = randomA;
  secondNumberInput.value = randomB;
  
  // Cập nhật giao diện
  operationButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.op === state.operation);
  });
  
  // Cập nhật preview trước khi sang Step 3
  updateBoardPreview();
  
  // Vào thẳng tới bước 3
  showSlide(3);
  runBoardAnimation();
}

function setOperation(op) {
  if (op !== "add" && op !== "sub") {
    speak("Tạm thời mình học cộng và trừ trước nhé.");
    return;
  }
  state.operation = op;
  operationButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.op === op);
  });
  updateBoardPreview();
  const labels = {
    add: "Đã chọn phép cộng, bạn ấn Tiếp theo để tiếp tục.",
    sub: "Đã chọn phép trừ, bạn ấn Tiếp theo để tiếp tục.",
  };
  setCoachHint(labels[op] || "Bạn đã chọn phép tính, bạn ấn Tiếp theo để tiếp tục.");
  speak(labels[op] || "");
}

// Lấy chữ số hàng đơn vị hoặc trả về mảng rỗng nếu không đủ
function getDigitArray(numStr, maxLen) {
  // Pad left with spaces so that columns align perfectly
  return String(numStr).padStart(maxLen, " ").split("");
}

function getColumnName(colIndex) {
  const names = ["hàng đơn vị", "hàng chục", "hàng trăm", "hàng nghìn", "hàng chục nghìn"];
  return names[colIndex] || "hàng tiếp theo";
}

function getDigitAtCol(numStr, colIndex) {
  const str = String(numStr);
  if (colIndex >= str.length) return 0;
  return Number(str[str.length - 1 - colIndex]);
}

function getCellAt(lineClass, colIndex) {
  const line = verticalStack.querySelector(`.calc-line.${lineClass}`);
  if (!line) return null;
  const cells = Array.from(line.querySelectorAll(".digit-cell"));
  return cells[cells.length - 1 - colIndex] || null;
}

function clearCarryBadges() {
  verticalStack.querySelectorAll(".carry-badge").forEach((badge) => badge.remove());
}

function setCarryBadge(targetCol, carryValue, shouldAnimate = false) {
  if (carryValue <= 0) {
    return;
  }
  const targetCell = getCellAt("l1", targetCol);
  if (!targetCell) {
    return;
  }
  const oldBadge = targetCell.querySelector(".carry-badge");
  if (oldBadge) {
    oldBadge.remove();
  }
  const badge = document.createElement("span");
  badge.className = `carry-badge${shouldAnimate ? " carry-badge-pop" : ""}`;
  badge.textContent = String(carryValue);
  targetCell.appendChild(badge);
}

function getCarryBadgeTargetRect(targetCell, carryValue) {
  if (!targetCell || carryValue <= 0) {
    return null;
  }
  const probe = document.createElement("span");
  probe.className = "carry-badge carry-badge-probe";
  probe.textContent = String(carryValue);
  targetCell.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return rect;
}

function hideRightCarryDisplay() {
  if (!rightCarryDisplay) {
    return;
  }
  rightCarryDisplay.classList.remove("show", "pop", "receive-ready");
  rightCarryDisplay.textContent = "";
}

function showRightCarryDisplay(carryValue, shouldAnimate = false) {
  if (!rightCarryDisplay || carryValue <= 0) {
    return;
  }
  rightCarryDisplay.textContent = String(carryValue);
  rightCarryDisplay.classList.add("show");
  if (shouldAnimate) {
    rightCarryDisplay.classList.remove("pop");
    void rightCarryDisplay.offsetWidth;
    rightCarryDisplay.classList.add("pop");
  }
}

async function animateCarryFromSideToColumn(colIndex, carryValue) {
  if (carryValue <= 0) {
    return;
  }
  const targetCell = getCellAt("l1", colIndex);
  if (!rightCarryDisplay || !targetCell) {
    setCarryBadge(colIndex, carryValue, true);
    state.rightCarryValue = 0;
    state.rightCarryTargetCol = -1;
    hideRightCarryDisplay();
    return;
  }

  showRightCarryDisplay(carryValue, false);
  const fromRect = rightCarryDisplay.getBoundingClientRect();
  const toRect = getCarryBadgeTargetRect(targetCell, carryValue) || targetCell.getBoundingClientRect();
  await animateFlyingToken(carryValue, fromRect, toRect, "flying-token-carry");
  setCarryBadge(colIndex, carryValue, true);
  state.rightCarryValue = 0;
  state.rightCarryTargetCol = -1;
  hideRightCarryDisplay();
}

function renderCarryBadges() {
  clearCarryBadges();
  state.carryOutByCol.forEach((carryValue, colIndex) => {
    const targetCol = colIndex + 1;
    const isPendingRightCarry = state.rightCarryValue > 0 && state.rightCarryTargetCol === targetCol;
    if (carryValue > 0 && !isPendingRightCarry) {
      setCarryBadge(targetCol, carryValue, false);
    }
  });
}

function animateFlyingToken(text, fromRect, toRect, className = "") {
  return new Promise((resolve) => {
    let settled = false;
    const token = document.createElement("div");
    token.className = `flying-token ${className}`.trim();
    token.textContent = String(text);

    const fromX = fromRect.left + fromRect.width / 2;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.left + toRect.width / 2;
    const toY = toRect.top + toRect.height / 2;

    token.style.left = `${fromX}px`;
    token.style.top = `${fromY}px`;

    document.body.appendChild(token);

    requestAnimationFrame(() => {
      token.style.transform = `translate(${toX - fromX}px, ${toY - fromY}px) scale(1.12)`;
      token.style.opacity = "0.92";
    });

    const cleanup = () => {
      if (settled) {
        return;
      }
      settled = true;
      token.remove();
      resolve();
    };
    token.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 1700);
  });
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enhanceStrikeVisuals() {
  if (!candyContainer) {
    return;
  }

  const subtractionFrame = candyContainer.querySelector(".subtraction-frame");
  if (!subtractionFrame) {
    return;
  }

  const strikeTokens = Array.from(subtractionFrame.querySelectorAll(".strike-candy"));
  const remainingCandies = Array.from(subtractionFrame.querySelectorAll(".candy-item"));

  if (!strikeTokens.length || !remainingCandies.length) {
    return;
  }

  let finishedCount = 0;
  const triggerRemainingWiggle = () => {
    remainingCandies.forEach((candy, index) => {
      candy.classList.remove("after-strike-wiggle");
      candy.style.setProperty("--wiggle-delay", `${index * 0.05}s`);
      void candy.offsetWidth;
      candy.classList.add("after-strike-wiggle");
    });
  };

  strikeTokens.forEach((token) => {
    token.classList.remove("is-struck");
    token.addEventListener("animationend", (event) => {
      if (event.animationName !== "strikeCandySettle") {
        return;
      }
      token.classList.add("is-struck");
      finishedCount += 1;
      if (finishedCount === strikeTokens.length) {
        const timerId = setTimeout(triggerRemainingWiggle, 120);
        state.frameTimers.push(timerId);
      }
    }, { once: true });
  });
}

async function placeResultValue(colIndex, valueToShow) {
  const resultCell = getCellAt("l4", colIndex);
  if (!resultCell) {
    return;
  }
  resultCell.textContent = String(valueToShow);
  resultCell.style.color = "var(--brand)";
  resultCell.classList.remove("result-land-pop");
  void resultCell.offsetWidth;
  resultCell.classList.add("result-land-pop");
  await waitMs(280);
}

async function animateColumnResultFlow(userAnswer, colIndex, landedValue) {
  const inputRect = stepAnswer.getBoundingClientRect();
  const resultCell = getCellAt("l4", colIndex);

  if (!resultCell) {
    updateBoardResult(colIndex, landedValue);
    return;
  }

  resultCell.classList.add("freeze-active-col");
  const resultRect = resultCell.getBoundingClientRect();
  await animateFlyingToken(userAnswer, inputRect, resultRect, "flying-token-main");
  await placeResultValue(colIndex, landedValue);
  resultCell.classList.remove("freeze-active-col");
}

async function animateCarryFromResultToSide(carryDigit, colIndex) {
  if (carryDigit <= 0) {
    state.rightCarryValue = 0;
    state.rightCarryTargetCol = -1;
    hideRightCarryDisplay();
    return;
  }

  const resultCell = getCellAt("l4", colIndex);
  if (!resultCell || !rightCarryDisplay) {
    showRightCarryDisplay(carryDigit, true);
    state.rightCarryValue = carryDigit;
    state.rightCarryTargetCol = colIndex + 1;
    return;
  }

  const fromRect = resultCell.getBoundingClientRect();
  rightCarryDisplay.textContent = String(carryDigit);
  rightCarryDisplay.classList.add("show", "receive-ready");
  const toRect = rightCarryDisplay.getBoundingClientRect();
  await animateFlyingToken(carryDigit, fromRect, toRect, "flying-token-carry");
  rightCarryDisplay.classList.remove("receive-ready");
  showRightCarryDisplay(carryDigit, true);
  state.rightCarryValue = carryDigit;
  state.rightCarryTargetCol = colIndex + 1;
}

function prepareCalculationPhase() {
  const answerInput = document.getElementById("stepAnswer");
  answerInput.value = "";

  state.carry = state.carryInByCol[state.calcCol] ?? 0;
  renderCarryBadges();

  const isPendingTransfer = state.rightCarryValue > 0 && state.rightCarryTargetCol === state.calcCol;
  if (isPendingTransfer) {
    showRightCarryDisplay(state.rightCarryValue, false);
  } else {
    hideRightCarryDisplay();
  }
  
  const colName = getColumnName(state.calcCol);
  const valA = getDigitAtCol(state.a, state.calcCol);
  const valB = getDigitAtCol(state.b, state.calcCol);
  
  let questionText = "";
  let itemIcon = "🍬";
  let borrowStepFlow = null;
  
  // Đóng khung cột tương ứng (từ phải sang trái)
  const lines = document.querySelectorAll(".calc-line");
  lines.forEach(line => {
    // Tìm các ô chữ số và chọn đúng cột mục tiêu (đếm từ phải sang)
    const cells = Array.from(line.querySelectorAll('.digit-cell'));
    cells.forEach(el => el.classList.remove('active-col', 'animate__animated', 'animate__pulse'));
    
    // Check if the row has enough columns (i.e. not the operation symbol row which is structured differently)
    const targetCell = cells[cells.length - 1 - state.calcCol];
    if (targetCell) {
      targetCell.classList.add('active-col', 'animate__animated', 'animate__pulse');
    }
  });
  
  document.getElementById("step4Title").textContent = `Bước 4: Tính ${colName}`;
  horizontalEquation.textContent = getHorizontalExpression("?");
  
  candyContainer.classList.remove("animate__bounceIn");
  void candyContainer.offsetWidth; // reset animation
  candyContainer.classList.add("animate__bounceIn");

  // Format carry content
  const carryText = state.carry > 0 ? `, cộng thêm ${state.carry} (số nhớ)` : '';
  const carryCandyClass = state.pendingCarryAnimCol === state.calcCol ? "carry-candy incoming-carry" : "carry-candy";
  
  // Đối với trường hợp trống giá trị ở cả 2 nơi nhưng có số nhớ (ví dụ cộng tràn 9+5=14)
  const isBothEmpty = (state.calcCol >= String(state.a).length) && (state.calcCol >= String(state.b).length);
  
  if (state.operation === "add") {
    if (isBothEmpty && state.carry > 0) {
      questionText = `${colName}: Hạ số nhớ ${state.carry} xuống nào!`;
      candyContainer.innerHTML = `<div class="candy-frame">${buildCandyGroupHtml(state.carry, itemIcon, carryCandyClass)}</div>`;
    } else {
      questionText = `Bây giờ ${colName}, bạn có ${valA} cái kẹo, cộng thêm ${valB} cái kẹo nữa${carryText} thì bằng bao nhiêu nào? Hãy đếm số kẹo trên hình hoặc dùng ngón tay nhé.`;
      candyContainer.innerHTML = buildAdditionCandyFrame(valA, valB, state.carry, carryCandyClass, itemIcon);
    }
  } else if (state.operation === "sub") {
    // Có nhớ (cần trừ đi 1)
    const adjustedValA = valA - state.carry;
    
    if (adjustedValA >= valB) {
      const isOnlyBorrowSubtract = state.carry > 0 && valB === 0;
      if (isOnlyBorrowSubtract) {
        questionText = `Ở ${colName}: cột này không phải trừ kẹo nào ở dưới cả, bạn chỉ cần trừ đi 1 cái nhớ thôi. ${valA} trừ 1 còn bao nhiêu nào?`;
      } else if (state.carry > 0) {
        questionText = `Ở ${colName}: bạn có ${valA}. Bước 1: trừ ${valB} cái kẹo trước. Bước 2: trừ thêm 1 vì đã mượn từ cột trước, rồi xem còn bao nhiêu nhé.`;
      } else {
        questionText = `Ở ${colName}: bạn có ${valA} cái kẹo, bị trừ đi ${valB} cái kẹo thì còn lại bao nhiêu cái nào?`;
      }
      if (isOnlyBorrowSubtract) {
        const visibleFinal = Math.max(0, valA - state.carry);
        candyContainer.innerHTML = buildSubtractionCandyFrame(
          buildSubtractionCandyGroupHtml(visibleFinal, itemIcon),
          buildStrikeCandyGroupHtml(state.carry, itemIcon, "borrow-extra-strike", 0, 1.0)
        );
      } else if (state.carry > 0) {
        borrowStepFlow = {
          borrowedValue: valA,
          subtractValue: valB,
          carryValue: state.carry,
        };
        candyContainer.innerHTML = buildBorrowFlowCandyFrame(
          Math.max(0, valA),
          valB,
          state.carry,
          itemIcon,
          3,
          1.0
        );
      } else {
        const visibleFinal = Math.max(0, adjustedValA - valB);
        candyContainer.innerHTML = buildSubtractionCandyFrame(
          buildSubtractionCandyGroupHtml(visibleFinal, itemIcon),
          buildStrikeCandyGroupHtml(valB, itemIcon, "main-strike")
        );
      }
    } else {
      const borrowedVal = valA + 10;
      const isOnlyBorrowSubtract = state.carry > 0 && valB === 0;
      if (isOnlyBorrowSubtract) {
        questionText = `Ở ${colName}: vì ${valA} nhỏ hơn 0 sau khi trừ nhớ nên mình phải mượn 1 chục, thành ${borrowedVal}. Cột này không trừ kẹo nào ở dưới, bạn chỉ cần trừ đi 1 cái nhớ còn bao nhiêu thôi nhé.`;
      } else if (state.carry > 0) {
        questionText = `Ở ${colName}: vì ${valA} nhỏ hơn ${valB} nên mình phải mượn 1 chục, thành ${borrowedVal}. Bước 1: ${borrowedVal} trừ ${valB}. Bước 2: ngoài ra còn phải trừ thêm 1 do đã mượn từ cột trước. Bạn nhìn số kẹo bị gạch để xem còn bao nhiêu.`;
      } else {
        questionText = `Ở ${colName}: vì ${valA} nhỏ hơn ${valB} nên mình phải mượn 1 chục, thành ${borrowedVal}. Bây giờ lấy ${borrowedVal} cái kẹo trừ đi ${valB} cái kẹo thì còn bao nhiêu nè?`;
      }
      if (state.carry > 0) {
        const baseBeforeSubtract = Math.max(0, borrowedVal);
        if (isOnlyBorrowSubtract) {
          candyContainer.innerHTML = buildSubtractionCandyFrame(
            buildSubtractionCandyGroupHtml(baseBeforeSubtract, itemIcon),
            buildStrikeCandyGroupHtml(state.carry, itemIcon, "borrow-extra-strike", 0, 1.0)
          );
        } else {
          borrowStepFlow = {
            borrowedValue: borrowedVal,
            subtractValue: valB,
            carryValue: state.carry,
          };
          candyContainer.innerHTML = buildBorrowFlowCandyFrame(
            baseBeforeSubtract,
            valB,
            state.carry,
            itemIcon,
            3,
            1.0
          );
        }
      } else {
        const baseBeforeSubtract = Math.max(0, borrowedVal);
        borrowStepFlow = {
          borrowedValue: borrowedVal,
          subtractValue: valB,
          carryValue: 0,
        };
        candyContainer.innerHTML = buildBorrowFlowCandyFrame(
          baseBeforeSubtract,
          valB,
          0,
          itemIcon,
          3,
          1.0
        );
      }
    }
  } else {
    questionText = `${colName}: ${valA} ${getOperationSymbol()} ${valB}${carryText} bằng bao nhiêu nào?`;
    candyContainer.innerHTML = "";
  }
  
  const alreadyHasCountHint = /nhìn\s+(số\s+)?kẹo|đếm/i.test(questionText);
  const step4ActionHint = alreadyHasCountHint
    ? "Nhập kết quả vào ô, rồi bấm Kiểm tra."
    : "Nhìn kẹo để đếm, nhập kết quả vào ô, rồi bấm Kiểm tra.";
  const fullQuestionText = `${questionText} ${step4ActionHint}`;

  if (mathQuestionText) {
    mathQuestionText.textContent = fullQuestionText;
  }
  enhanceStrikeVisuals();
  applyCandyDensityScale();
  setCoachHint("Nhìn kẹo để đếm theo cột hiện tại, nhập đáp án rồi bấm Kiểm tra.");
  state.step4Prompt = fullQuestionText;

  if (borrowStepFlow) {
    animateBorrowStepFlow(
      borrowStepFlow.borrowedValue,
      borrowStepFlow.subtractValue,
      borrowStepFlow.carryValue
    );
  } else {
    clearStepFlowDisplay();
  }

  // Hold strike-through visuals until narration finishes so kids can follow instruction first.
  candyContainer.classList.add("reading-lock");
  const fallbackReadMs = Math.min(9000, Math.max(2600, String(fullQuestionText).length * 55));
  const narrationTask = (state.speechSupported && state.speechUnlocked)
    ? speakAsync(fullQuestionText, fallbackReadMs)
    : waitMs(fallbackReadMs);

  Promise.all([narrationTask, waitMs(1200)])
    .finally(() => {
      candyContainer.classList.remove("reading-lock");
    });
  
  feedbackText.textContent = "";
  feedbackText.className = "animate__animated";
  state.pendingCarryAnimCol = -1;

  const existingResult = state.columnResults[state.calcCol];
  if (existingResult !== undefined && existingResult !== null) {
    answerInput.value = existingResult;
    feedbackText.textContent = "Bạn đã làm đúng cột này rồi. Bấm Tiếp theo nhé!";
    feedbackText.style.color = "var(--ok)";
    nextBtn.disabled = false;
    setCoachHint("Cột này đã đúng. Bây giờ bấm Tiếp theo để sang cột tiếp theo.");
  } else {
    nextBtn.disabled = true;
  }

  if (isPendingTransfer) {
    animateCarryFromSideToColumn(state.calcCol, state.rightCarryValue);
  }
}

checkAnswerBtn.addEventListener("click", () => {
  if (state.isCheckingAnswer) {
    return;
  }

  const userAnswer = Number(stepAnswer.value);
  if (!Number.isFinite(userAnswer)) {
    feedbackText.textContent = "Bạn cần nhập kết quả trước nhé!";
    feedbackText.style.color = "var(--brand)";
    setCoachHint("Bạn chưa nhập đáp án. Hãy nhập số vào ô kết quả rồi bấm Kiểm tra.");
    speak("Bạn cần nhập kết quả trước nhé");
    return;
  }

  state.isCheckingAnswer = true;
  state.isFlowAnimating = true;
  checkAnswerBtn.disabled = true;
  stopSpeaking();

  const valA = getDigitAtCol(state.a, state.calcCol);
  const valB = getDigitAtCol(state.b, state.calcCol);
  let expectedAnswer = 0;
  let boardDigit = 0;
  let newCarry = 0;
  
  if (state.operation === "add") {
    const sum = valA + valB + state.carry;
    expectedAnswer = sum;
    boardDigit = sum % 10;
    newCarry = Math.floor(sum / 10);
  } else if (state.operation === "sub") {
    const adjustedValA = valA - state.carry;
    if (adjustedValA >= valB) {
      expectedAnswer = adjustedValA - valB;
      newCarry = 0;
    } else {
      const borrowedVal = valA + 10;
      // Dạy theo flow: mượn thành 12 (hoặc x+10), trừ số dưới trước, rồi trừ 1 đã mượn.
      expectedAnswer = (borrowedVal - valB) - state.carry;
      newCarry = 1;
    }
    boardDigit = expectedAnswer;
  } else if (state.operation === "mul") {
    expectedAnswer = (valA * valB) % 10;
    boardDigit = expectedAnswer;
  } else {
    expectedAnswer = valA;
    boardDigit = expectedAnswer;
  }
  
  feedbackText.classList.remove("animate__headShake", "animate__tada");
  void feedbackText.offsetWidth; // reset anim

  if(userAnswer === expectedAnswer) {
      state.carry = newCarry; // Cập nhật số nhớ cho bước tiếp theo
      state.columnResults[state.calcCol] = userAnswer;
      state.carryOutByCol[state.calcCol] = newCarry;
      state.carryInByCol[state.calcCol + 1] = newCarry;
      feedbackText.textContent = "Chính xác tuyệt vời! 🎊";
      feedbackText.style.color = "var(--ok)";
      feedbackText.classList.add("animate__tada");
      candyContainer.classList.remove("animate__bounceIn");
      stepAnswer.blur();
      const completedColHint = state.calcCol < state.maxCols - 1
        ? "Đã làm xong cột này, bạn ấn Tiếp theo để tiếp tục."
        : "Đã làm xong cột cuối, bạn ấn Tiếp theo để xem kết quả.";
      setCoachHint(completedColHint);
      speak("Đúng rồi, giỏi lắm!");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      
      const completeSuccess = async () => {
        const landedValue = newCarry > 0 ? expectedAnswer : boardDigit;
        await animateColumnResultFlow(userAnswer, state.calcCol, landedValue);

        if (newCarry > 0) {
          const carrySpeech = state.operation === "add"
            ? `Bây giờ bạn nhớ ${newCarry} vì tổng lớn hơn chín nhé.`
            : `Bây giờ bạn cho nhớ ${newCarry} đơn vị đã mượn lúc đầu do bé hơn ra.`;
          await speakAsync(carrySpeech);
          await animateCarryFromResultToSide(newCarry, state.calcCol);
          if (landedValue !== boardDigit) {
            await placeResultValue(state.calcCol, boardDigit);
          }
          const nextHintSpeech = state.calcCol < state.maxCols - 1
            ? "Đã làm xong cột này, bạn ấn Tiếp theo để tiếp tục."
            : "Đã làm xong cột cuối, bạn ấn Tiếp theo để xem kết quả.";
          setCoachHint(nextHintSpeech);
          await speakAsync(nextHintSpeech, 4200);
          return;
        }

        const nextHintSpeech = state.calcCol < state.maxCols - 1
          ? "Đã làm xong cột này, bạn ấn Tiếp theo để tiếp tục."
          : "Đã làm xong cột cuối, bạn ấn Tiếp theo để xem kết quả.";
        setCoachHint(nextHintSpeech);
        speak(nextHintSpeech);
      };

      completeSuccess()
        .finally(() => {
          nextBtn.disabled = false;
          checkAnswerBtn.disabled = false;
          state.isCheckingAnswer = false;
          state.isFlowAnimating = false;
        });
      
  } else {
      feedbackText.textContent = "Chưa đúng rồi, bạn đếm lại kẹo thử xem nhé! 🤔";
      feedbackText.style.color = "var(--brand)";
      feedbackText.classList.add("animate__headShake");
      setCoachHint("Chưa đúng. Nhìn lại số kẹo bị gạch và số còn lại, đếm lại rồi bấm Kiểm tra.");
      speak("Chưa đúng rồi, bạn đếm lại nhé");
      checkAnswerBtn.disabled = false;
      state.isCheckingAnswer = false;
      state.isFlowAnimating = false;
  }
});

function updateBoardResult(colIndex, digit) {
  const lines = document.querySelectorAll(".calc-line");
  // Lấy dòng kết quả (dòng cuối cùng l4)
  const resultLine = lines[lines.length - 1];
  const cells = Array.from(resultLine.querySelectorAll('.digit-cell'));
  const targetCell = cells[cells.length - 1 - colIndex];
  if (targetCell) {
    targetCell.textContent = digit;
    targetCell.style.color = "var(--brand)"; // Đổi màu để làm nổi bật
    targetCell.classList.remove("animate__animated", "animate__bounceIn");
    void targetCell.offsetWidth;
    targetCell.classList.add("animate__animated", "animate__bounceIn");
  }
}

function wrapDigits(numArr) {
  return numArr.map((char) => {
    // Preserve empty space to maintain column alignment
    return `<span class="digit-cell">${char === " " ? "&nbsp;" : char}</span>`;
  }).join('');
}

function buildVerticalLines() {
  const symbol = getOperationSymbol();
  // Ensure we use the proper max length based on state.maxCols if it's set
  const maxLen = state.maxCols || Math.max(String(state.a).length, String(state.b).length);
  
  const topChars = getDigitArray(state.a, maxLen);
  const bottomChars = getDigitArray(state.b, maxLen);
  const resultBoxes = getDigitArray("", maxLen).map(() => "?");

  const topHtml = wrapDigits(topChars);
  const bottomHtml = wrapDigits(bottomChars);
  const resultHtml = wrapDigits(resultBoxes);

  const line1 = `${topHtml}`;
  const line2 = `<span class="op-symbol">${symbol}</span>${bottomHtml}`;
  const line3 = ``; 
  const line4 = `${resultHtml}`;

  return [line1, line2, line3, line4];
}

function getCalcSessionKey() {
  return `${state.operation}|${state.a}|${state.b}`;
}

function getStoredBoardDigit(colIndex) {
  const stored = state.columnResults[colIndex];
  if (stored === undefined || stored === null) {
    return null;
  }
  const numeric = Number(stored);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  if (state.operation === "add") {
    return Math.abs(numeric) % 10;
  }
  return numeric;
}

function paintBoardFromState() {
  const lines = buildVerticalLines();
  verticalStack.innerHTML = lines
    .map((line, index) => `<div class="calc-line l${index + 1}" style="animation: none; opacity: 1; transform: none;">${line}</div>`)
    .join("");

  state.columnResults.forEach((_, colIndex) => {
    const digit = getStoredBoardDigit(colIndex);
    if (digit === null) {
      return;
    }
    const cell = getCellAt("l4", colIndex);
    if (!cell) {
      return;
    }
    cell.textContent = String(digit);
    cell.style.color = "var(--brand)";
  });
}

function showStep3StaticBoard() {
  clearBoardTimers();
  clearStepFlowDisplay();
  const symbol = getOperationSymbol();
  horizontalEquation.textContent = `${state.a} ${symbol} ${state.b} = ?`;
  paintBoardFromState();
}

function runBoardAnimation() {
  clearBoardTimers();
  clearStepFlowDisplay();
  const symbol = getOperationSymbol();
  const expression = `${state.a} ${symbol} ${state.b} = ?`;
  horizontalEquation.textContent = "";
  verticalStack.innerHTML = "";

  let pointer = 0;
  state.typingTimer = setInterval(() => {
    pointer += 1;
    horizontalEquation.textContent = expression.slice(0, pointer);
    if (pointer >= expression.length) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;

      const lines = buildVerticalLines();
      const timerId = setTimeout(() => {
        verticalStack.innerHTML = lines
          .map((line, index) => `<div class="calc-line l${index + 1}">${line}</div>`)
          .join("");
        setCoachHint("Đã xem xong cách đặt tính, bạn ấn Tiếp theo để tiếp tục.");
      }, 200);
      state.frameTimers.push(timerId);
    }
  }, 90);
}

function validateSlideBeforeNext() {
  if (state.slide === 1) {
    if (!state.operation) {
      setCoachHint("Bạn chưa chọn phép tính. Hãy bấm Cộng hoặc Trừ trước.");
      speak("Bạn cần chọn phép tính trước đã.");
      return false;
    }
    return true;
  }

  if (state.slide === 2) {
    const a = Number(firstNumberInput.value);
    const b = Number(secondNumberInput.value);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      setCoachHint("Bạn cần nhập đủ 2 số vào cả hai ô.");
      speak("Bạn hãy nhập đủ hai số.");
      return false;
    }
    if (a < 0 || b < 0) {
      setCoachHint("Hãy nhập số lớn hơn hoặc bằng 0.");
      speak("Bạn hãy nhập số lớn hơn hoặc bằng không.");
      return false;
    }
    if (state.operation === "sub" && a < b) {
      setCoachHint("Phép trừ này cần số thứ nhất lớn hơn hoặc bằng số thứ hai.");
      speak("Với phép trừ này bạn nhập lại nhé, vì mình chưa học số âm đâu.");
      return false;
    }
    state.a = Math.floor(a);
    state.b = Math.floor(b);
    return true;
  }

  return true;
}

function goNext() {
  if (state.isFlowAnimating) {
    speak("Đợi animation xong đã rồi mình qua bước tiếp theo nhé.");
    return;
  }

  if (!validateSlideBeforeNext()) {
    return;
  }

  if (state.slide === 3) {
    // Prevent Step 3 typing timers from overwriting Step 4 board state.
    clearBoardTimers();
  }

  if (state.slide === 4) {
    if (state.columnResults[state.calcCol] === undefined || state.columnResults[state.calcCol] === null) {
      setCoachHint("Bạn cần bấm Kiểm tra để hoàn thành cột này trước khi sang bước tiếp theo.");
      speak("Bạn bấm kiểm tra để hoàn thành cột này trước nhé.");
      return;
    }

    if (state.calcCol < state.maxCols - 1) {
      const outgoingCarry = state.carryOutByCol[state.calcCol] || 0;
      state.calcCol += 1;
      state.pendingCarryAnimCol = outgoingCarry > 0 ? state.calcCol : -1;
      prepareCalculationPhase();
      return;
    }

    showFinalStep();
    showSlide(5);
    return;
  }

  if (state.slide === slides.length - 1) {
    state.hasPlayed = true;
    speak("Hoàn tất. Mình quay lại từ đầu nhé.");
    setTimeout(() => {
      resetToStart();
    }, 600);
    return;
  }

  showSlide(state.slide + 1);
  if (state.slide === 3) {
    runBoardAnimation();
  } else if (state.slide === 4) {
    // Determine number of columns and start/restore calculation session
    const finalAns = state.operation === "add" ? (state.a + state.b) : (state.operation === "sub" ? (state.a - state.b) : (state.operation === "mul" ? (state.a * state.b) : state.a / state.b));
    const nextMaxCols = Math.max(String(state.a).length, String(state.b).length, String(finalAns).length);
    const nextSessionKey = getCalcSessionKey();
    const shouldResetSession =
      state.calcSessionKey !== nextSessionKey ||
      state.maxCols !== nextMaxCols ||
      state.columnResults.length !== nextMaxCols;

    state.maxCols = nextMaxCols;
    if (shouldResetSession) {
      state.calcSessionKey = nextSessionKey;
      state.calcCol = 0;
      state.carry = 0;
      state.columnResults = Array(state.maxCols).fill(null);
      state.carryInByCol = Array(state.maxCols + 1).fill(0);
      state.carryOutByCol = Array(state.maxCols).fill(0);
      state.pendingCarryAnimCol = -1;
      state.rightCarryValue = 0;
      state.rightCarryTargetCol = -1;
      state.step4Prompt = "";
      state.finalNarrationText = "";
      hideRightCarryDisplay();
    } else {
      state.calcCol = Math.min(state.calcCol, state.maxCols - 1);
      state.carry = state.carryInByCol[state.calcCol] ?? 0;
    }

    paintBoardFromState();
    prepareCalculationPhase();
  }
}

function goBack() {
  if (state.isFlowAnimating) {
    speak("Đợi animation xong đã rồi mình quay lại nhé.");
    return;
  }

  if (state.slide === 0) {
    return;
  }

  if (state.slide === 5) {
    state.calcCol = Math.max(0, state.maxCols - 1);
    showSlide(4);
    prepareCalculationPhase();
    return;
  }

  if (state.slide === 4) {
    if (state.calcCol > 0) {
      state.calcCol -= 1;
      prepareCalculationPhase();
      return;
    }
    showSlide(3);
    showStep3StaticBoard();
    return;
  }

  showSlide(state.slide - 1);
}

function resetToStart() {
  state.slide = 0;
  state.operation = "";
  state.a = "";
  state.b = "";
  state.calcCol = 0;
  state.carry = 0;
  state.maxCols = 0;
  state.columnResults = [];
  state.carryInByCol = [];
  state.carryOutByCol = [];
  state.pendingCarryAnimCol = -1;
  state.hasStarted = false;
  state.isCheckingAnswer = false;
  state.isFlowAnimating = false;
  state.calcSessionKey = "";
  state.rightCarryValue = 0;
  state.rightCarryTargetCol = -1;
  state.step4Prompt = "";
  state.finalNarrationText = "";
  state.step2ReadyAnnounced = false;
  firstNumberInput.value = "";
  secondNumberInput.value = "";
  operationButtons.forEach((btn) => btn.classList.remove("is-active"));
  // Remove highlight
  clearHighlightTimers();
  document.querySelectorAll('.highlight, .highlight-blue, .highlight-yellow, .active-col').forEach((el) => {
    el.classList.remove('highlight', 'highlight-blue', 'highlight-yellow', 'active-col', 'animate__animated', 'animate__pulse');
  });
  
  const quickStartBtn = document.getElementById("quickStartBtn");
  if (quickStartBtn) {
    quickStartBtn.style.display = state.hasPlayed ? "block" : "none";
  }

  if (boardQuickStartBtn) {
    boardQuickStartBtn.style.display = state.hasPlayed ? "block" : "none";
  }
  
  resetBoard();
  hideRightCarryDisplay();
  setBoardWelcomeVisibility(true);
  showSlide(0);
}

function parseInputValue(value) {
  const numberValue = Number(value);
  if (value === "" || !Number.isFinite(numberValue) || numberValue < 0) {
    return "";
  }
  return Math.floor(numberValue);
}

operationButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    unlockSpeech();
    setOperation(btn.dataset.op);
  });
});

startBtn.addEventListener("click", () => {
  unlockSpeech();
  beginLesson();
});
if (boardStartBtn) {
  boardStartBtn.addEventListener("click", () => {
    unlockSpeech();
    beginLesson();
  });
}

const quickStartBtn = document.getElementById("quickStartBtn");
if (quickStartBtn) {
  quickStartBtn.addEventListener("click", () => {
    unlockSpeech();
    beginQuickStart();
  });
}

if (boardQuickStartBtn) {
  boardQuickStartBtn.addEventListener("click", () => {
    unlockSpeech();
    beginQuickStart();
  });
}

nextBtn.addEventListener("click", () => {
  unlockSpeech();
  goNext();
});
backBtn.addEventListener("click", () => {
  unlockSpeech();
  goBack();
});
replayBtn.addEventListener("click", () => {
  unlockSpeech();
  speakCurrentSlide();
});

firstNumberInput.addEventListener("input", () => {
  state.a = parseInputValue(firstNumberInput.value);
  updateBoardPreview();
  let spokenText = "";
  if (state.slide === 2) {
    const hasA = firstNumberInput.value !== "";
    const hasB = secondNumberInput.value !== "";
    if (hasA && hasB) {
      const readyText = "Đã nhập đủ 2 số, bạn ấn Tiếp theo để tiếp tục.";
      setCoachHint(readyText);
      if (!state.step2ReadyAnnounced) {
        spokenText = readyText;
        state.step2ReadyAnnounced = true;
      }
    } else {
      setCoachHint("Đã nhập số thứ nhất. Tiếp theo nhập số thứ hai.");
      state.step2ReadyAnnounced = false;
      spokenText = "Đã nhập số thứ nhất.";
    }
  }
  if (state.slide === 2 && spokenText) {
    speak(spokenText);
  }
});

secondNumberInput.addEventListener("input", () => {
  state.b = parseInputValue(secondNumberInput.value);
  updateBoardPreview();
  let spokenText = "";
  if (state.slide === 2) {
    const hasA = firstNumberInput.value !== "";
    const hasB = secondNumberInput.value !== "";
    if (hasA && hasB) {
      const readyText = "Đã nhập đủ 2 số, bạn ấn Tiếp theo để tiếp tục.";
      setCoachHint(readyText);
      if (!state.step2ReadyAnnounced) {
        spokenText = readyText;
        state.step2ReadyAnnounced = true;
      }
    } else {
      setCoachHint("Đã nhập số thứ hai. Nếu còn thiếu, hãy nhập số thứ nhất.");
      state.step2ReadyAnnounced = false;
      spokenText = "Đã nhập số thứ hai.";
    }
  }
  if (state.slide === 2 && spokenText) {
    speak(spokenText);
  }
});

nextBtn.addEventListener("mouseenter", () => {
  if (state.slide === 3) {
    setCoachHint("Khi đã quan sát xong, bấm Tiếp theo để qua bước đếm kẹo.");
  } else if (state.slide === 5) {
    setCoachHint("Bấm Tiếp theo để bắt đầu bài mới.");
  }
});

if ("speechSynthesis" in window) {
  initVoices();
  window.speechSynthesis.addEventListener("voiceschanged", initVoices);
}

attachSpeechUnlockListeners();

resetToStart();
initMathSparkles();
initWarmMath3d();
