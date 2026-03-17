console.log("'logging_tool.js' loaded");

const logContainer = document.getElementById("log-container");

const userLog = (message, type) => {                                            // logs message to the UI

  let logsCollection = logContainer.getElementsByTagName("p");

  let logColor = {
    success: "green",
    error: "red",
    warning: "orange"
  }[type];
  let log = document.createElement("p");
  log.textContent = `${message}`;
  log.style.color = logColor;
  log.style.height = 0;
  log.style.opacity = 0;

  // Insert the new log at the beginning of the log container
  logContainer.insertBefore(log, logContainer.firstChild);
  requestAnimationFrame(() => {
    const fullHeight = log.scrollHeight + "px";
    log.style.height = fullHeight;
    log.style.opacity = 1;
    // Removing excess log
    if (logsCollection.length > 3) {
      let earlyLog = logsCollection[logsCollection.length - 1];
      earlyLog.style.height = earlyLog.scrollHeight + "px";
      earlyLog.style.height = 0;
      earlyLog.style.opacity = 0;
      setTimeout(() => {
        logContainer.removeChild(logsCollection[logsCollection.length - 1]);
      }, 1000);
    }
  });
}
