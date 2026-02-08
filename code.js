// Timer globals
let stat = "stop"; // stop, CD, CU, cancel
let hh = 0;
let mm = 0;
let ss = 0;
let totalSec = 0;
let goalReached = false;

const Timer = document.getElementById("Timer-txt");
const gauge = document.querySelector(".gauge-value");
const studyInput = document.getElementById("StudyTime");
const restInput = document.getElementById("RestTime");
const goalInput = document.getElementById("Goal");
const HFOn = document.getElementById("EnableHF");
const HFOff = document.getElementById("DisableHF");
const settings = document.getElementById("Settings");
const clicks = document.querySelectorAll("[type=radio]");
const passedTxt = document.querySelector(".TimePassedTxt");
const passedSection = document.querySelector(".TimePassed");
const float = document.querySelector(".float");

// Sounds
const TimerEnd = new Audio("./sounds/Timer-End.mp3");
const Select = new Audio("./sounds/select.mp3");
const SBtnSound = new Audio("./sounds/Start.mp3");

let intervalId = null;

clicks.forEach(el => {
  el.addEventListener("change", () => {
    Select.currentTime = 0;
    Select.play();
  });
});

function RTimer() {
  const hhStr = String(hh).padStart(2, "0");
  const mmStr = String(mm).padStart(2, "0");
  const ssStr = String(ss).padStart(2, "0");
  Timer.textContent = `${hhStr}:${mmStr}.${ssStr}`;
}
RTimer();

function updatePassed(overSec) {
  const h = Math.floor(overSec / 3600);
  const m = Math.floor((overSec % 3600) / 60);
  const s = Math.floor(overSec % 60);
  const hStr = String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const sStr = String(s).padStart(2, "0");
  passedTxt.textContent = `Passed ${hStr}:${mStr}.${sStr} from goal`;
  passedSection.style.display = "block";
}

function resetPassed() {
  passedTxt.textContent = "";
  passedSection.style.display = "none";
}
resetPassed();

// Count toggle
const radioC = document.querySelectorAll('[name="Count-R"]');
const sectionD = document.querySelector(".CountDown");
const sectionU = document.querySelector(".CountUp");

function toggleTime() {
  if (document.getElementById("radio-U").checked) {
    sectionD.style.display = "none";
    sectionU.style.display = "block";
  } else {
    sectionD.style.display = "block";
    sectionU.style.display = "none";
  }
}

radioC.forEach(r => r.addEventListener("change", toggleTime));
toggleTime();

// Fonts
const radioF = document.querySelectorAll('[name="font"]');

function changeFont() {
  if (document.getElementById("ShareTech").checked) {
    Timer.style.fontFamily = '"Share Tech", sans-serif';
    Timer.style.fontSize = "200px";
  } else if (document.getElementById("Quantico").checked) {
    Timer.style.fontFamily = '"Quantico", sans-serif';
    Timer.style.fontSize = "150px";
  } else if (document.getElementById("Geo").checked) {
    Timer.style.fontFamily = '"Geo", sans-serif';
    Timer.style.fontSize = "200px";
  } else if (document.getElementById("MajorMonoDisplay").checked) {
    Timer.style.fontFamily = '"Major Mono Display", monospace';
    Timer.style.fontSize = "120px";
  } else if (document.getElementById("Offside").checked) {
    Timer.style.fontFamily = '"Offside", sans-serif';
    Timer.style.fontSize = "150px";
  } else if (document.getElementById("Plaster").checked) {
    Timer.style.fontFamily = '"Plaster", sans-serif';
    Timer.style.fontSize = "110px";
  } else if (document.getElementById("RibeyeMarrow").checked) {
    Timer.style.fontFamily = '"Ribeye Marrow", serif';
    Timer.style.fontSize = "150px";
  }
}

radioF.forEach(r => r.addEventListener("change", changeFont));
changeFont();

// Fix to top while running
function VisibleSettings() {
  const isRunning = stat === "CD" || stat === "CU";
  settings.classList.toggle("is-hidden", isRunning);
  float.classList.toggle("is-hidden", isRunning);
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  document.documentElement.style.overflow = isRunning ? "hidden" : "";
}

// Start button
const SBtn = document.getElementById("TBtn");
SBtn.addEventListener("click", () => {
  SBtnSound.currentTime = 0;
  SBtnSound.play();

  if (stat === "stop") {
    hh = 0;
    mm = 0;
    ss = 0;
    gauge.style.width = "0%";
    goalReached = false;
    resetPassed();
    RTimer();
  }

  //ボタン書き換える系の処理
  function btnToStop() {
    SBtn.classList.add("Stop1");

    setTimeout(() => {
      SBtn.value = "Stop";
      SBtn.classList.add("Stop2");

    }, 300);
  }

  function btnToStart() {
    SBtn.classList.remove("Stop2");
    setTimeout(() => {
      SBtn.value = "Start";
      SBtn.classList.remove("Stop1");
    }, 300);
  }

  if (stat === "stop") {
    if (document.getElementById("radio-U").checked) {
      // Count up
      btnToStop();
      stat = "CU";
      VisibleSettings();
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (stat !== "cancel") {
            countUp();
          } else {
            clearInterval(intervalId);
            intervalId = null;
            stat = "stop";
          }
        }, 1000);
      }
    } else {
      // Count down
    }
  } else {
    stat = "cancel";
    btnToStart();
    VisibleSettings();
  }
});

function getGoalSeconds() {
  const minutes = Number(goalInput.value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 0;
}

function updateGauge(sec, goalSec) {
  const ratio = goalSec > 0 ? Math.min(1, sec / goalSec) : 0;
  gauge.style.width = `${ratio * 100}%`;
  gauge.classList.toggle("full", ratio >= 1);
}

function countUp() {
  if (ss + 1 === 60) {
    if (mm + 1 === 60) {
      ss = 0;
      mm = 0;
      hh++;
    } else {
      ss = 0;
      mm++;
    }
  } else {
    ss++;
  }

  totalSec = hh * 3600 + mm * 60 + ss;
  const goalSec = getGoalSeconds();
  updateGauge(totalSec, goalSec);

  if (goalSec > 0 && totalSec >= goalSec) {
    updatePassed(totalSec - goalSec);
    if (!goalReached) {
      goalReached = true;
      if (HFOff.checked) {
        TimerEnd.currentTime = 0;
        TimerEnd.play();
        const ok = confirm("目標時間を達成しました。続行しますか？");
        if (!ok) {
          stat = "cancel";
        }
      } else {
        TimerEnd.currentTime = 0;
        TimerEnd.play();
      }
    }
  } else {
    resetPassed();
  }

  RTimer();
}