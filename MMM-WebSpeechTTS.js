/* global config Module Log */

Module.register("MMM-WebSpeechTTS", {
  defaults: {
    text: "WebSpeechTTS"
  },

  start() {
    Log.info(
      `Starting module: ${this.name} with identifier: ${this.identifier}`
    );
    this.tts = this.config.text;
    this.sendSocketNotification("CONFIG", this.config);
  },

  notificationReceived(notification, payload) {
    if (notification === "WebSpeechTTS") {
      this.sendSocketNotification("TTS", payload);
      this.tts = payload;
      this.updateDom();
    }
  },

  socketNotificationReceived(notification) {
    if (notification === "HIDE") {
      this.tts = this.config.text;
      this.updateDom();
    }
  },

  getDom() {
    const wrapper = document.createElement("div");
    if (config.logLevel.includes("DEBUG")) {
      wrapper.id = "mmm-webspeechtts";
      wrapper.innerHTML = this.tts;
    } else {
      wrapper.visibility = "hidden";
    }
    return wrapper;
  },

  getScripts() {
    return [
      this.file("module-scripts/TTS.js"),
      this.file("module-scripts/MMM-PublicTransportHafas.js")
    ];
  },

  getTranslations() {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  }
});
