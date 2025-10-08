(() => {
  const helpers = window.MMMWebSpeechTtsHelpers;
  if (!helpers) {
    return;
  }

  const DEFAULT_DELAY = 10000;

  helpers.onReady((api) => {
    const config = helpers.getProducerConfig("greeting");
    if (!config) {
      return;
    }

    const delay = typeof config.delay === "number" && config.delay >= 0
      ? config.delay
      : DEFAULT_DELAY;
    window.setTimeout(() => {
      const text = helpers.combineGreetingAndTime();
      api.say({
        id: "mmm-webspeechtts-startup-greeting",
        text,
        source: "startup-greeting"
      });
    }, delay);
  });
})();
