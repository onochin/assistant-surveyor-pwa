"use strict";

const exams = {
  "2025_R07": {
    label: "令和7年",
    url: "../data/2025_R07/exam.json",
    baseUrl: "../data/2025_R07/",
    storageKey: "assistant-surveyor-2025-r07-progress",
  },
  "2024_R06": {
    label: "令和6年",
    url: "../data/2024_R06/exam.json",
    baseUrl: "../data/2024_R06/",
    storageKey: "assistant-surveyor-2024-r06-progress",
  },
  "2022_R04": {
    label: "令和4年",
    url: "../data/2022_R04/exam.json",
    baseUrl: "../data/2022_R04/",
    storageKey: "assistant-surveyor-2022-r04-progress",
  },
};

const state = {
  examId: "2025_R07",
  exam: null,
  currentIndex: 0,
  answers: {},
};

const elements = {
  title: document.querySelector("#question-title"),
  prompt: document.querySelector("#question-prompt"),
  choices: document.querySelector("#choices"),
  assets: document.querySelector("#question-assets"),
  position: document.querySelector("#question-position"),
  score: document.querySelector("#score-summary"),
  progress: document.querySelector("#progress-bar"),
  result: document.querySelector("#answer-result"),
  explanationLink: document.querySelector("#explanation-link"),
  examLabel: document.querySelector("#exam-label"),
  examSelect: document.querySelector("#exam-select"),
  previous: document.querySelector("#previous-question"),
  next: document.querySelector("#next-question"),
  listDialog: document.querySelector("#question-list-dialog"),
  list: document.querySelector("#question-list"),
  functionTableDialog: document.querySelector("#function-table-dialog"),
  functionTableAssets: document.querySelector("#function-table-assets"),
  assetTemplate: document.querySelector("#asset-template"),
};

function loadProgress() {
  try {
    state.answers = JSON.parse(localStorage.getItem(exams[state.examId].storageKey)) || {};
  } catch {
    state.answers = {};
  }
}

function saveProgress() {
  localStorage.setItem(exams[state.examId].storageKey, JSON.stringify(state.answers));
}

function assetElement(asset) {
  const fragment = elements.assetTemplate.content.cloneNode(true);
  const link = fragment.querySelector("a");
  const image = fragment.querySelector("img");
  const url = `${exams[state.examId].baseUrl}${asset.path}`;
  link.href = url;
  image.src = url;
  image.alt = asset.type === "map" ? "問題に使用する地図" : "問題に使用する図表";
  return fragment;
}

function renderAssets(container, assets) {
  container.replaceChildren(...assets.map(assetElement));
}

function renderChoices(question, answer) {
  elements.choices.replaceChildren();
  for (const choice of question.choices) {
    const label = document.createElement("label");
    label.className = "choice";
    if (answer && choice.id === question.correct_choice) label.classList.add("correct");
    if (answer && choice.id === answer && answer !== question.correct_choice) {
      label.classList.add("incorrect");
    }

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = choice.id;
    input.checked = answer === choice.id;
    input.addEventListener("change", () => answerQuestion(question, choice.id));

    const number = document.createElement("span");
    number.className = "choice-number";
    number.textContent = `${choice.id}.`;

    const text = document.createElement("span");
    text.textContent = choice.text;
    label.append(input, number, text);
    elements.choices.append(label);
  }
}

function answerQuestion(question, choiceId) {
  state.answers[question.id] = choiceId;
  saveProgress();
  render();
}

function renderResult(question, answer) {
  elements.result.className = "answer-result";
  if (!answer) {
    elements.result.textContent = "";
    return;
  }
  const isCorrect = answer === question.correct_choice;
  elements.result.classList.add(isCorrect ? "correct" : "incorrect");
  elements.result.textContent = isCorrect
    ? "正解です。"
    : `不正解です。正解は ${question.correct_choice} です。`;
}

function renderQuestionList() {
  elements.list.replaceChildren();
  state.exam.questions.forEach((question, index) => {
    const button = document.createElement("button");
    const answer = state.answers[question.id];
    button.type = "button";
    button.textContent = question.number;
    if (index === state.currentIndex) button.classList.add("current");
    if (answer) button.classList.add("answered");
    if (answer && answer !== question.correct_choice) button.classList.add("incorrect");
    button.addEventListener("click", () => {
      state.currentIndex = index;
      elements.listDialog.close();
      render();
    });
    elements.list.append(button);
  });
}

function render() {
  const questions = state.exam.questions;
  const question = questions[state.currentIndex];
  const answer = state.answers[question.id];
  const answeredCount = questions.filter((item) => state.answers[item.id]).length;
  const correctCount = questions.filter(
    (item) => state.answers[item.id] === item.correct_choice,
  ).length;

  elements.title.textContent = `No. ${question.number}`;
  elements.prompt.textContent = question.prompt;
  elements.position.textContent = `No. ${question.number} / ${questions.length}`;
  elements.score.textContent = `回答 ${answeredCount} / ${questions.length} ・ 正解 ${correctCount}`;
  elements.progress.style.width = `${(answeredCount / questions.length) * 100}%`;
  elements.previous.disabled = state.currentIndex === 0;
  elements.next.disabled = state.currentIndex === questions.length - 1;
  renderAssets(elements.assets, question.assets);
  renderChoices(question, answer);
  renderResult(question, answer);
  renderExplanationLink(question);
  renderQuestionList();
}

function renderExplanationLink(question) {
  if (state.examId !== "2025_R07") {
    elements.explanationLink.hidden = true;
    elements.explanationLink.removeAttribute("href");
    return;
  }
  elements.explanationLink.hidden = false;
  elements.explanationLink.href =
    `../explanations/2025_R07/q${String(question.number).padStart(2, "0")}.html`;
}

function moveQuestion(amount) {
  const nextIndex = state.currentIndex + amount;
  if (nextIndex < 0 || nextIndex >= state.exam.questions.length) return;
  state.currentIndex = nextIndex;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelector("#show-question-list").addEventListener("click", () => {
  elements.listDialog.showModal();
});
document.querySelector("#open-function-table").addEventListener("click", () => {
  elements.functionTableDialog.showModal();
});
document.querySelector("#reset-progress").addEventListener("click", () => {
  if (!window.confirm("回答履歴をリセットしますか？")) return;
  state.answers = {};
  saveProgress();
  render();
  elements.listDialog.close();
});
elements.examSelect.addEventListener("change", () => {
  loadExam(elements.examSelect.value).catch(showLoadError);
});
elements.previous.addEventListener("click", () => moveQuestion(-1));
elements.next.addEventListener("click", () => moveQuestion(1));
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

async function loadExam(examId) {
  state.examId = examId;
  state.currentIndex = 0;
  state.exam = null;
  elements.examLabel.textContent = exams[examId].label;
  elements.examSelect.value = examId;
  elements.title.textContent = "読み込み中...";
  elements.prompt.textContent = "";
  loadProgress();
  const response = await fetch(exams[examId].url);
  if (!response.ok) throw new Error(`問題データを読み込めませんでした: ${response.status}`);
  state.exam = await response.json();
  renderAssets(elements.functionTableAssets, state.exam.supplementary_assets);
  render();
}

function showLoadError(error) {
  elements.title.textContent = "読み込みエラー";
  elements.prompt.textContent = `${error.message}\nHTTPサーバー経由で開いてください。`;
}

const requestedExam = new URLSearchParams(window.location.search).get("exam");
loadExam(exams[requestedExam] ? requestedExam : state.examId).catch(showLoadError);
