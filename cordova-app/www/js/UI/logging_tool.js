console.log("'logging_tool.js' loaded");

const logContainer = document.getElementById("log-container");

const userLog = (message, type) => {                                            // logs message to the UI

  let logColor = {
    success: "green",
    error: "red",
    warning: "orange"
  }[type];
  let log = document.createElement("p");
  log.textContent = `${message}`;
  log.style.color = logColor;

  // Insert the new log at the beginning of the log container
  logContainer.insertBefore(log, logContainer.firstChild);

  let logsCollection = logContainer.getElementsByTagName("p");
  if (logsCollection.length > 3) {
    logContainer.removeChild(logsCollection[logsCollection.length - 1]);
  }
}
