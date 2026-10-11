(() => {
  const helpers = window.MMMWebSpeechTtsHelpers;
  if (!helpers) {
    return;
  }

  const normalizeKey = (value, fallback) => {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim().toLowerCase();
    }
    return fallback;
  };

  const isEditableTarget = (target) => {
    if (!target) {
      return false;
    }
    if (target.isContentEditable) {
      return true;
    }

    const tagName = typeof target.tagName === "string"
      ? target.tagName.toLowerCase()
      : "";
    return ["input", "textarea", "select"].includes(tagName);
  };

  const handleGreeting = (api) => {
    const text = helpers.getGreetingString();
    api.say({text, source: "keyboard-greeting"});
  };

  const handleStop = (api) => {
    api.stop();
  };

  const handleTime = (api) => {
    const text = helpers.getTimeAnnouncementString();
    api.say({text, source: "keyboard-time"});
  };

  helpers.onReady((api) => {
    const producerConfig = helpers.getProducerConfig("keyboard");
    if (!producerConfig) {
      return;
    }

    const shortcuts = producerConfig.shortcuts || {};
    const keys = {
      greeting: normalizeKey(shortcuts.greeting, "g"),
      stop: normalizeKey(shortcuts.stop, "s"),
      time: normalizeKey(shortcuts.time, "t")
    };

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing || isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === keys.greeting) {
        handleGreeting(api);
        return;
      }

      if (key === keys.stop) {
        handleStop(api);
        return;
      }

      if (key === keys.time) {
        handleTime(api);
      }
    });
  });
})();
