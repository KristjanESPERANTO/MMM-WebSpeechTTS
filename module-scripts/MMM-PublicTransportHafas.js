(() => {
  const helpers = window.MMMWebSpeechTtsHelpers;
  if (!helpers) {
    return;
  }

  const translate = (key, variables) => helpers.translate(key, variables);

  const sanitizeRowText = (text) => {
    if (typeof text !== "string") {
      return "";
    }

    return text
      .replaceAll("\n", " ")
      .replaceAll(translate("STREET_SHORT"), translate("STREET"))
      .replaceAll(translate("STREET_SHORT_CAP"), translate("STREET_CAP"))
      .replaceAll(translate("STREET_SHORT_ALLCAP"), translate("STREET_CAP"))
      .replaceAll("\t", " ")
      .replaceAll("  ", " ");
  };

  const describeTable = (table) => {
    const workingTable = table;
    const head = workingTable.querySelector("thead");
    if (head) {
      head.remove();
    }

    const timeCells = workingTable.getElementsByClassName("mmm-pth-time-cell");
    for (const timeCell of timeCells) {
      const replaced = timeCell.textContent.replaceAll(":", ` ${translate("HOUR")} `);
      timeCell.textContent = `${replaced} `;
    }

    const lineCells = workingTable.getElementsByClassName("mmm-pth-sign");
    for (const lineCell of lineCells) {
      const firstCharacter = lineCell.textContent[0];
      const isNumber = (/^\d$/u).test(firstCharacter);
      if (isNumber) {
        lineCell.textContent = `${translate("LINE")} ${lineCell.textContent} `;
      }
    }

    const directionCells = workingTable.getElementsByClassName("mmm-pth-direction-cell");
    for (const directionCell of directionCells) {
      directionCell.textContent = `${translate("DIRECTION")} ${directionCell.textContent} `;
    }

    const platformCells = workingTable.getElementsByClassName("mmm-pth-platform-cell");
    for (const platformCell of platformCells) {
      if (platformCell.textContent !== "") {
        platformCell.textContent = ` ${translate("PLATFORM")} ${platformCell.textContent}`;
      }
    }

    const rows = workingTable.getElementsByTagName("tr");
    if (rows.length === 0) {
      return "";
    }

    let counter = 0;
    let rowsAnnouncement = "";

    for (const row of rows) {
      let departureText;
      if (row.textContent.includes("⚠️")) {
        const [, warningText] = row.textContent.split("⚠️");
        departureText = sanitizeRowText(warningText);
      } else {
        counter += 1;
        const rowText = sanitizeRowText(row.textContent);
        departureText = `${translate("DEPARTURE")} ${counter}: ${rowText}`;
      }

      rowsAnnouncement += `${departureText}.\n`;
    }

    let description = "";
    description += `${translate("DEPARTURES_COUNT", {count: counter})}\n`;
    description += rowsAnnouncement;
    return description;
  };

  const buildDeparturesText = () => {
    let announcement = "";
    const wrappers = document.getElementsByClassName("mmm-pth-wrapper");

    for (const wrapper of wrappers) {
      const clone = wrapper.cloneNode(true);
      const stationHeader = clone.getElementsByTagName("header")[0];
      if (stationHeader) {
        announcement += `\n${translate("STATION")} ${stationHeader.textContent}.\n`;
      }

      const table = clone.getElementsByClassName("mmm-pth-table")[0];
      if (table) {
        announcement += describeTable(table);
      }
    }

    return announcement;
  };

  const speakDepartures = (api) => {
    const departuresText = buildDeparturesText();
    if (departuresText.trim() === "") {
      return;
    }

    const timeAnnouncement = helpers.getTimeAnnouncementString();
    const combined = `${timeAnnouncement} ${departuresText}`;
    api.say({
      id: "mmm-webspeechtts-public-transport",
      text: combined,
      source: "public-transport"
    });
  };

  const registerKeyboardShortcut = (api, config) => {
    const shortcut = typeof config.shortcut === "string" && config.shortcut.trim() !== ""
      ? config.shortcut.trim().toLowerCase()
      : "d";

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key.toLowerCase() === shortcut) {
        speakDepartures(api);
      }
    });
  };

  helpers.onReady((api) => {
    const config = helpers.getProducerConfig("publicTransport");
    if (!config) {
      return;
    }

    registerKeyboardShortcut(api, config);
  });
})();
