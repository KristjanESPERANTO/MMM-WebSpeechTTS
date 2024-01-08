/* global getTimeAnnouncementString speak */
function getDesparturesString () {
  let announcementText = "";

  // Set the text property with the value of the textarea
  const pthWrappers = document.getElementsByClassName("mmm-pth-wrapper");

  for (const pthWrapper of pthWrappers) {
    const pthWrapperClone = pthWrapper.cloneNode(true);

    // Station
    const station = pthWrapperClone.getElementsByTagName("header")[0];
    announcementText += `\nHaltestelle ${station.textContent}.\n`;

    const pthTable = pthWrapperClone.getElementsByClassName("mmm-pth-table")[0];
    const thead = pthWrapperClone.querySelector("thead");
    if (thead !== null) {
      thead.remove();
    }

    // Time
    const departureTimes = pthTable.getElementsByClassName("mmm-pth-time-cell");
    for (const departureTime of departureTimes) {
      departureTime.textContent = `${departureTime.textContent.replaceAll(
        ":",
        " Uhr "
      )}`;
      // Add a gap in case there is a number at the end of the line. This way it is not read out as an ordinal number.
      departureTime.textContent += " ";
    }

    // Line
    const lines = pthTable.getElementsByClassName("mmm-pth-sign");
    for (const line of lines) {
      const isLineWithoutPrefix = (/^\d$/u).test(line.textContent[0]);
      if (isLineWithoutPrefix) {
        line.textContent = `Linie ${line.textContent} `;
      }
    }

    // Direction
    const directions = pthTable.getElementsByClassName("mmm-pth-direction-cell");
    for (const direction of directions) {
      direction.textContent = `in Richtung ${direction.textContent} `;
    }

    // Platform
    const platforms = pthTable.getElementsByClassName("mmm-pth-platform-cell");

    for (const platform of platforms) {
      if (platform.textContent !== "") {
        platform.textContent = ` von Steig ${platform.textContent}`;
      }
    }

    const rows = pthTable.getElementsByTagName("tr");

    if (rows.length > 0) {
      let departureCounter = 0;
      let allDesparturesString = "";

      for (const row of rows) {
        let departureString;
        if (row.textContent.includes("⚠️")) {
          departureString = row.textContent.split("⚠️")[1];
        } else {
          departureCounter += 1;
          departureString = `Abfahrt ${departureCounter}: ${row.textContent}`;
        }
        departureString = departureString
          .replaceAll("\n", " ")
          .replaceAll("str.", "straße")
          .replaceAll("Str.", "Straße")
          .replaceAll("STR.", "Straße");
        allDesparturesString += `${departureString}.\n`;
      }
      announcementText += `Es gibt ${departureCounter} Abfahrten.\n`;
      announcementText += allDesparturesString
        .replaceAll("\t", " ")
        .replaceAll("  ", " ");
    }
  }

  // Start Speaking
  return announcementText;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "d") {
    speak(`${getTimeAnnouncementString()} - ${getDesparturesString()}`);
  }
});
