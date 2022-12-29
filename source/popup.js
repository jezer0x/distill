const resultDiv = document.getElementById("result");
const buttonsDiv = document.getElementById("buttons");

const handleButtonClick = (spell) => {
  // TODO: Hide the buttons
  buttonsDiv.style.display = "none";
  resultDiv.textContent = "\u{1F916} Processing...";
  chrome.runtime.sendMessage({
    type: "request",
    spell: spell,
  });
};

document.getElementById("summarize-button").addEventListener("click", () => {
  handleButtonClick("summarize");
});

document.getElementById("highlights-button").addEventListener("click", () => {
  handleButtonClick("highlights");
});

document.getElementById("assumptions-button").addEventListener("click", () => {
  handleButtonClick("assumptions");
});

document.getElementById("factcheck-button").addEventListener("click", () => {
  handleButtonClick("factcheck");
});

document.getElementById("devil-button").addEventListener("click", () => {
  handleButtonClick("devil");
});

document.getElementById("bias-button").addEventListener("click", () => {
  handleButtonClick("bias");
});

document.getElementById("eli5-button").addEventListener("click", () => {
  handleButtonClick("eli5");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "result") {
    // Display the summary text in the result div
    resultDiv.textContent = message.answer;
  }
});
