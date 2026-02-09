
// Timer globals
let stat = "stop"; // stop, CD, CU, rest, cancel
let hh = 0;
let mm = 0;
let ss = 0;
let totalSec = 0;
let goalReached = false;
let cycle = 0;

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
function getStudyMinutes() {
  const minutes = Number(studyInput.value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

function getRestMinutes() {
  const minutes = Number(restInput.value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

// Sounds
const TimerEnd = new Audio("./sounds/Timer-End.mp3");
const Select = new Audio("./sounds/select.mp3");
const SBtnSound = new Audio("./sounds/Start.mp3");
const CBtnSound = new Audio("./sounds/clearBtn.mp3");

let intervalId = null;

function loadData() {
  var jsonObj = localStorage.getItem('Settings');
  var jsObj = JSON.parse(jsonObj);
  document.getElementById(jsObj.Count).checked = true;
  document.getElementById(jsObj.Font).checked = true;
  document.getElementById(jsObj.HF).checked = true;
  document.getElementById("StudyTime").value = jsObj.STime;
  document.getElementById("RestTime").value = jsObj.RTime;
  document.getElementById("Goal").value = jsObj.GTime;
}

//読み込み終わった後にlocalstorageをロード
window.addEventListener("load", () => {
  if (localStorage.getItem("Settings") !== null) {
    loadData();
    changeFont();
  }
});


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

radioC.forEach(r => r.addEventListener("change", () => {
  toggleTime();
}));
toggleTime();

// Fonts
const radioF = document.querySelectorAll('[name="font"]');
const mqSmall = window.matchMedia("(max-width: 650px)");

function changeFont() {
  const scale = mqSmall.matches ? 0.5 : 1;
  let baseSize = 200;
  if (document.getElementById("ShareTech").checked) {
    Timer.style.fontFamily = '"Share Tech", sans-serif';
    baseSize = 200;
  } else if (document.getElementById("Quantico").checked) {
    Timer.style.fontFamily = '"Quantico", sans-serif';
    baseSize = 150;
  } else if (document.getElementById("Geo").checked) {
    Timer.style.fontFamily = '"Geo", sans-serif';
    baseSize = 200;
  } else if (document.getElementById("MajorMonoDisplay").checked) {
    Timer.style.fontFamily = '"Major Mono Display", monospace';
    baseSize = 120;
  } else if (document.getElementById("Offside").checked) {
    Timer.style.fontFamily = '"Offside", sans-serif';
    baseSize = 150;
  } else if (document.getElementById("Plaster").checked) {
    Timer.style.fontFamily = '"Plaster", sans-serif';
    baseSize = 110;
  } else if (document.getElementById("RibeyeMarrow").checked) {
    Timer.style.fontFamily = '"Ribeye Marrow", serif';
    baseSize = 150;
  }
  Timer.style.fontSize = `${baseSize * scale}px`;
}

radioF.forEach(r => r.addEventListener("change", changeFont));
mqSmall.addEventListener("change", changeFont);
changeFont();

// Fix to top while running
function VisibleSettings() {
  const isRunning = stat === "CD" || stat === "CU" || stat === "rest";
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
      if (stat === "CD") {
        mm = getStudyMinutes();
      } else {
        mm = getRestMinutes();
      }
      mm = getStudyMinutes();
      cycle++;
      btnToStop();
      stat = "CD";
      VisibleSettings();
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (stat !== "cancel") {
            CountDown();
          } else {
            clearInterval(intervalId);
            intervalId = null;
            stat = "stop";
          }
        }, 1000);
      }
    }
  } else {
    stat = "cancel";
    btnToStart();
    VisibleSettings();
    cycle = 0;
    resetPassed();
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

function getStudySeconds() {
  const minutes = Number(studyInput.value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 0;
}

function CountDown() {
  passedSection.style.display = "block";
  passedTxt.textContent = `Cycle(s):${cycle}`;
  if (hh === 0 && mm === 0 && ss === 0) {
    // 終わり
  } else {
    const total = hh * 3600 + mm * 60 + ss - 1;
    hh = Math.floor(total / 3600);
    mm = Math.floor((total % 3600) / 60);
    ss = total % 60;
  }
  const studyMin = getStudyMinutes();
  const restMin = getRestMinutes();
  totalSec = stat === "CD" ? (studyMin * 60) - (hh * 3600 + mm * 60 + ss) : hh * 3600 + mm * 60 + ss;
  const SRsec = stat === "CD" ? studyMin * 60 : restMin * 60;
  updateGauge(totalSec, SRsec);
    if (hh === 0 && mm === 0 && ss === 0) {
    if (!goalReached) {
      goalReached = true;
      if (HFOff.checked) {
        TimerEnd.currentTime = 0;
        TimerEnd.play();
        let ok2;
        if (stat === "rest") {
          ok2 = confirm("休憩時間が終了しました。続けますか？");
        } else {
          ok2 = confirm("勉強時間が終了しました。続けますか？");
        }
        if (!ok2) {
          stat = "cancel";
        } else {
          mm = stat === "CD" ? getRestMinutes() : getStudyMinutes();
          stat = stat === "CD" ? "rest" : "CD";
          cycle = stat === "CD" ? cycle + 1 : cycle;
          goalReached = null;
        }
      } else {
        if (stat === "rest") {
          TimerEnd.currentTime = 0;
          TimerEnd.play();
        }
        mm = stat === "CD" ? getRestMinutes() : getStudyMinutes();
        stat = stat === "CD" ? "rest" : "CD";
        cycle = stat === "CD" ? cycle + 1 : cycle;
        goalReached = null;
      }
    }
  } else {
    
  }
  RTimer();
}

//データクリアボタン
CBtn = document.getElementById("clearBtn");
CBtn.addEventListener("click", () => {
  CBtnSound.currentTime = 0;
  CBtnSound.play();
  const confirmClear = confirm("本当にデータを削除してもよろしいですか？");
  if (confirmClear) {
    localStorage.clear();
    location.reload();
  }
});

//データのあれこれ
function saveData() {
  const obj = {
    Count: document.querySelector('input[name="Count-R"]:checked')?.id,
    STime: document.getElementById("StudyTime").value,
    RTime: document.getElementById("RestTime").value,
    GTime: document.getElementById("Goal").value,
    Font: document.querySelector('input[name="font"]:checked')?.id,
    HF: document.querySelector('input[name="Handfree"]:checked')?.id
  };
  localStorage.setItem('Settings', JSON.stringify(obj));
}

//保存
const radios = document.querySelectorAll('input[type="radio"][name="Count-R"], input[type="radio"][name="font"], input[type="radio"][name="Handfree"]');
const textboxes = document.querySelectorAll('input[type="text"]');

radios.forEach(el => {
  el.addEventListener("change", () => {
    saveData();
  });
});

textboxes.forEach(el => {
  el.addEventListener("input", () => {
    saveData();
  });
});
