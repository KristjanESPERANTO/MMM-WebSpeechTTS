/* global Log Module */

Module.register("MMM-WebSpeechTTS", {
  defaults: {
    greetingsAtStartup: true,
    hidden: true,
    modules: [],
    text: "WebSpeechTTS"
  },

  start () {
    Log.info(`Starting module: ${this.name} with identifier: ${this.identifier}`);
    this.tts = this.config.text;
    this.sendSocketNotification("CONFIG", this.config);
  },

  notificationReceived (notification, payload) {
    if (notification === "WebSpeechTTS") {
      this.sendSocketNotification("TTS", payload);
      this.tts = payload;
      this.updateDom();
    }
  },

  socketNotificationReceived (notification) {
    if (notification === "HIDE") {
      this.tts = this.config.text;
      this.updateDom();
    }
  },

  getDom () {
    const wrapper = document.createElement("div");
    if (this.config.hidden) {
      wrapper.visibility = "hidden";
    } else {
      wrapper.id = "mmm-webspeechtts";
      wrapper.innerHTML = this.tts;
    }
    return wrapper;
  },

  getScripts () {
    const scripts = [];
    scripts.push(this.file("module-scripts/TTS.js"));
    if (this.config.greetingsAtStartup) {
      scripts.push(this.file("module-scripts/TTS-GreetingsAtStartup.js"));
    }
    if (this.config.modules.includes("MMM-PublicTransportHafas")) {
      scripts.push(this.file("module-scripts/MMM-PublicTransportHafas.js"));
    }

    return scripts;
  },

  getTranslations () {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  }
});
