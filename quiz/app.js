"use strict";

const exams = {
  "2025_R07": {
    label: "令和7年",
    url: "../data/2025_R07/exam.json",
    baseUrl: "../data/2025_R07/",
    storageKey: "assistant-surveyor-2025-r07-progress",
    notesStorageKey: "assistant-surveyor-2025-r07-notes",
  },
  "2024_R06": {
    label: "令和6年",
    url: "../data/2024_R06/exam.json",
    baseUrl: "../data/2024_R06/",
    storageKey: "assistant-surveyor-2024-r06-progress",
    notesStorageKey: "assistant-surveyor-2024-r06-notes",
  },
  "2022_R04": {
    label: "令和4年",
    url: "../data/2022_R04/exam.json",
    baseUrl: "../data/2022_R04/",
    storageKey: "assistant-surveyor-2022-r04-progress",
    notesStorageKey: "assistant-surveyor-2022-r04-notes",
  },
  "GNSS_FOCUS": {
    label: "GNSS測位",
    url: "../data/GNSS_FOCUS/exam.json",
    baseUrl: "../data/GNSS_FOCUS/",
    storageKey: "assistant-surveyor-gnss-focus-progress",
    notesStorageKey: "assistant-surveyor-gnss-focus-notes",
  },
};

const state = {
  examId: "2025_R07",
  exam: null,
  currentIndex: 0,
  answers: {},
  notes: {},
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
  note: document.querySelector("#question-note"),
  noteSaveStatus: document.querySelector("#note-save-status"),
  examLabel: document.querySelector("#exam-label"),
  examSelect: document.querySelector("#exam-select"),
  previous: document.querySelector("#previous-question"),
  next: document.querySelector("#next-question"),
  listDialog: document.querySelector("#question-list-dialog"),
  list: document.querySelector("#question-list"),
  functionTableDialog: document.querySelector("#function-table-dialog"),
  functionTableAssets: document.querySelector("#function-table-assets"),
  notesDialog: document.querySelector("#notes-dialog"),
  notesSummary: document.querySelector("#notes-summary"),
  notesList: document.querySelector("#notes-list"),
  importStudyData: document.querySelector("#import-study-data"),
  assetTemplate: document.querySelector("#asset-template"),
};

function readStoredObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function loadProgress() {
  state.answers = readStoredObject(exams[state.examId].storageKey);
  state.notes = readStoredObject(exams[state.examId].notesStorageKey);
}

function saveProgress() {
  localStorage.setItem(exams[state.examId].storageKey, JSON.stringify(state.answers));
}

function saveNotes() {
  localStorage.setItem(exams[state.examId].notesStorageKey, JSON.stringify(state.notes));
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
  elements.note.value = state.notes[question.id] || "";
  elements.noteSaveStatus.textContent = "端末内に自動保存";
  renderQuestionList();
}

function renderExplanationLink(question) {
  if (!["2025_R07", "2024_R06", "2022_R04", "GNSS_FOCUS"].includes(state.examId)) {
    elements.explanationLink.hidden = true;
    elements.explanationLink.removeAttribute("href");
    return;
  }
  elements.explanationLink.hidden = false;
  elements.explanationLink.href =
    `../explanations/${state.examId}/q${String(question.number).padStart(2, "0")}.html`;
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
document.querySelector("#open-notes").addEventListener("click", () => {
  renderNotesList();
  elements.notesDialog.showModal();
});
document.querySelector("#clear-question-note").addEventListener("click", () => {
  const question = state.exam.questions[state.currentIndex];
  if (!state.notes[question.id]) return;
  if (!window.confirm("この問題のメモを削除しますか？")) return;
  delete state.notes[question.id];
  saveNotes();
  render();
});
elements.note.addEventListener("input", () => {
  const question = state.exam.questions[state.currentIndex];
  const value = elements.note.value;
  if (value.trim()) {
    state.notes[question.id] = value;
  } else {
    delete state.notes[question.id];
  }
  saveNotes();
  elements.noteSaveStatus.textContent = "保存済み";
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

function storedStudyData() {
  const saved = {};
  for (const [examId, exam] of Object.entries(exams)) {
    saved[examId] = {
      answers: readStoredObject(exam.storageKey),
      notes: readStoredObject(exam.notesStorageKey),
    };
  }
  return saved;
}

function questionNumber(questionId) {
  const match = questionId.match(/_q(\d+)$/);
  return match ? Number(match[1]) : null;
}

function noteEntries() {
  const entries = [];
  for (const [examId, data] of Object.entries(storedStudyData())) {
    for (const [questionId, note] of Object.entries(data.notes)) {
      if (typeof note !== "string" || !note.trim()) continue;
      const number = questionNumber(questionId);
      if (number === null) continue;
      entries.push({ examId, questionId, number, note });
    }
  }
  return entries.sort((a, b) => a.examId.localeCompare(b.examId) || a.number - b.number);
}

function renderNotesList() {
  const entries = noteEntries();
  elements.notesSummary.textContent = `保存されているメモ: ${entries.length}件`;
  elements.notesList.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "note-empty";
    empty.textContent = "保存されているメモはありません。";
    elements.notesList.append(empty);
    return;
  }
  for (const entry of entries) {
    const button = document.createElement("button");
    const title = document.createElement("strong");
    const preview = document.createElement("span");
    button.className = "note-list-item";
    button.type = "button";
    title.textContent = `${exams[entry.examId].label} No. ${entry.number}`;
    preview.textContent = entry.note.replace(/\s+/g, " ");
    button.append(title, preview);
    button.addEventListener("click", () => {
      loadExam(entry.examId)
        .then(() => {
          const index = state.exam.questions.findIndex((question) => question.id === entry.questionId);
          if (index >= 0) state.currentIndex = index;
          elements.notesDialog.close();
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(showLoadError);
    });
    elements.notesList.append(button);
  }
}

function exportStudyData() {
  const backup = {
    schema: "assistant-surveyor-study-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    exams: storedStudyData(),
  };
  const blob = new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `assistant-surveyor-study-${backup.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function mergeImportedObject(current, imported, isValid) {
  if (!imported || typeof imported !== "object" || Array.isArray(imported)) return current;
  const merged = { ...current };
  for (const [key, value] of Object.entries(imported)) {
    if (isValid(key, value)) merged[key] = value;
  }
  return merged;
}

async function importStudyData() {
  const [file] = elements.importStudyData.files;
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (
      backup.schema !== "assistant-surveyor-study-backup" ||
      backup.version !== 1 ||
      !backup.exams ||
      typeof backup.exams !== "object"
    ) {
      throw new Error("対応していないJSON形式です。");
    }
    if (!window.confirm("JSONの回答履歴とメモを現在のデータへ統合しますか？")) return;
    for (const [examId, imported] of Object.entries(backup.exams)) {
      const exam = exams[examId];
      if (!exam || !imported || typeof imported !== "object") continue;
      const questionPrefix = `assistant_surveyor_${examId}_q`;
      const isQuestionId = (key) => key.startsWith(questionPrefix);
      const answers = mergeImportedObject(
        readStoredObject(exam.storageKey),
        imported.answers,
        (key, value) => isQuestionId(key) && ["1", "2", "3", "4", "5"].includes(value),
      );
      const notes = mergeImportedObject(
        readStoredObject(exam.notesStorageKey),
        imported.notes,
        (key, value) => isQuestionId(key) && typeof value === "string",
      );
      localStorage.setItem(exam.storageKey, JSON.stringify(answers));
      localStorage.setItem(exam.notesStorageKey, JSON.stringify(notes));
    }
    loadProgress();
    render();
    renderNotesList();
    window.alert("JSONを読み込みました。");
  } catch (error) {
    window.alert(`JSONを読み込めませんでした: ${error.message}`);
  } finally {
    elements.importStudyData.value = "";
  }
}

document.querySelector("#export-study-data").addEventListener("click", exportStudyData);
elements.importStudyData.addEventListener("change", importStudyData);

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

const searchParams = new URLSearchParams(window.location.search);
const requestedExam = searchParams.get("exam");
loadExam(exams[requestedExam] ? requestedExam : state.examId)
  .then(() => {
    if (searchParams.get("list") === "1") elements.listDialog.showModal();
  })
  .catch(showLoadError);
