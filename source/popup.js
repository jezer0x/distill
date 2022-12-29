const resultDiv = document.getElementById("result");
const buttonsDiv = document.getElementById("buttons");
const keyDiv = document.getElementById("key");

const handleButtonClick = (spell) => {
	// TODO: Hide the buttons
	buttonsDiv.style.display = "none";
	keyDiv.style.display = "none";
	resultDiv.textContent = "Processing...";
	chrome.runtime.sendMessage({
		type: "request",
		spell: spell,
	});
};

const handleAPIKeyButton = () => {
	// show the key div
	keyDiv.style.display = "block";
	buttonsDiv.style.display = "none";
};

const handleAPIKeySubmit = () => {
	// get the key from the input
	const key = document.getElementById("key-input").value;
	// send the key to the background script
	chrome.runtime.sendMessage({
		type: "key",
		key: key,
	});
	// hide the key div
	keyDiv.style.display = "none";
	buttonsDiv.style.display = "block";
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

document.getElementById("key-button").addEventListener("click", () => {
	handleAPIKeyButton();
});

document.getElementById("key-submit").addEventListener("click", () => {
	handleAPIKeySubmit();
});

chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "result") {
		// Display the summary text in the result div
		resultDiv.textContent = message.answer;
	}
});
