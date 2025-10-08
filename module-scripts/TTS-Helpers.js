(() => {
  const readyCallbacks = [];
  let apiInstance = null;

  const isFunction = (value) => typeof value === "function";

  const getTranslator = () => {
    if (typeof window.mmmWebSpeechTtsTranslate === "function") {
      return window.mmmWebSpeechTtsTranslate;
    }
    return (key) => key;
  };

  const translate = (key, variables) => {
    const translator = getTranslator();
    return translator(key, variables);
  };

  const flushReadyCallbacks = () => {
    if (apiInstance === null) {
      return;
    }

    while (readyCallbacks.length > 0) {
      const callback = readyCallbacks.shift();
      try {
        callback(apiInstance);
      } catch (error) {
        Log.error(`MMM-WebSpeechTTS helpers: ready callback failed: ${error.message}`);
      }
    }
  };

  const onReady = (callback) => {
    if (!isFunction(callback)) {
      return;
    }

    if (apiInstance !== null) {
      callback(apiInstance);
      return;
    }

    readyCallbacks.push(callback);
  };

  const notifyReady = (api) => {
    if (!api) {
      return;
    }

    apiInstance = api;
    flushReadyCallbacks();
  };

  const getGreetingString = () => {
    const now = new Date(Date.now());
    const hour = now.getHours();

    if (hour > 18) {
      return translate("GOOD_EVENING");
    }

    if (hour < 10) {
      return translate("GOOD_MORNING");
    }

    return translate("GOOD_DAY");
  };

  const getTimeAnnouncementString = () => {
    const now = new Date(Date.now());
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (minutes === 0) {
      return translate("TIME_ANNOUNCEMENT_FULL_HOUR", {hours});
    }

    if (minutes === 1) {
      return translate("TIME_ANNOUNCEMENT_ONE_MINUTE", {hours, minutes});
    }

    return translate("TIME_ANNOUNCEMENT", {hours, minutes});
  };

  const combineGreetingAndTime = () => {
    const greeting = getGreetingString();
    const timeAnnouncement = getTimeAnnouncementString();
    return `${greeting}. ${timeAnnouncement}`;
  };

  const getProducerConfig = (name) => {
    const rootConfig = window.MMMWebSpeechTTSConfig;
    if (!rootConfig || !rootConfig.producers) {
      return null;
    }

    const producer = rootConfig.producers[name];
    if (!producer || producer.enabled === false) {
      return null;
    }

    return producer;
  };

  window.MMMWebSpeechTtsHelpers = {
    translate,
    getGreetingString,
    getTimeAnnouncementString,
    combineGreetingAndTime,
    getProducerConfig,
    onReady,
    notifyReady
  };
})();
