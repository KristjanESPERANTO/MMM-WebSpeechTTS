Module.register("MMM-WebSpeechTTS", {
  defaults: {
    hidden: true,
    text: "WebSpeechTTS",
    speechLang: "",
    speechVoice: "",
    speechRate: 1,
    speechPitch: 1,
    speechVolume: 1,
    translationLang: "",
    producers: {
      greeting: {
        enabled: true,
        delay: 10000
      },
      keyboard: {
        enabled: true,
        shortcuts: {
          greeting: "g",
          stop: "s",
          time: "t"
        }
      },
      publicTransport: {
        enabled: false,
        shortcut: "d"
      }
    }
  },

  start () {
    Log.info(`Starting module: ${this.name} with identifier: ${this.identifier}`);
    this.displayText = this.config.text;
    this.currentJobId = null;

    this.producerConfig = this.buildProducerConfig();
    this.serviceConfig = this.buildServiceConfig();
    this.translationLanguage = this.resolveTranslationLanguage();

    this.setupTranslation();
    this.setupService();
    this.setupGlobalApi();

    this.updateDom();
  },

  notificationReceived (notification, payload) {
    if (notification === "WEB_SPEECH_TTS_SAY") {
      this.handleSay(payload || {}, "notification");
      return;
    }

    if (notification === "WEB_SPEECH_TTS_STOP") {
      this.handleStop(payload?.id, "notification");
      return;
    }

    if (notification === "WEB_SPEECH_TTS_GET_VOICES") {
      this.handleGetVoices(payload?.requestId, "notification");
    }
  },

  getDom () {
    const wrapper = document.createElement("div");
    if (this.config.hidden) {
      wrapper.style.visibility = "hidden";
    } else {
      wrapper.id = "mmm-webspeechtts";
      wrapper.innerHTML = this.displayText;
    }
    return wrapper;
  },

  getScripts () {
    if (!this.producerConfig) {
      this.producerConfig = this.buildProducerConfig();
    }

    const scripts = [
      this.file("module-scripts/TTS-Helpers.js"),
      this.file("module-scripts/TTS.js")
    ];

    if (this.producerConfig.keyboard.enabled) {
      scripts.push(this.file("module-scripts/TTS-Keyboard.js"));
    }

    if (this.producerConfig.greeting.enabled) {
      scripts.push(this.file("module-scripts/TTS-GreetingsAtStartup.js"));
    }

    if (this.producerConfig.publicTransport.enabled) {
      scripts.push(this.file("module-scripts/MMM-PublicTransportHafas.js"));
    }

    return scripts;
  },

  getTranslations () {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  },

  buildProducerConfig () {
    const defaultConfig = JSON.parse(JSON.stringify(this.defaults.producers));
    return this.mergeDeep(defaultConfig, this.config.producers || {});
  },

  buildServiceConfig () {
    const normalizeNumber = (value, fallback, min, max) => {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return fallback;
      }
      if (typeof min === "number" && value < min) {
        return min;
      }
      if (typeof max === "number" && value > max) {
        return max;
      }
      return value;
    };

    const serviceConfig = this.config.service || {};

    const pickString = (value) => {
      if (typeof value === "string") {
        return value.trim();
      }
      return "";
    };

    const speechLangCandidates = [
      pickString(serviceConfig.speechLang ?? this.config.speechLang),
      pickString(config.locale),
      pickString(config.language),
      "en-US"
    ];

    const speechLang = speechLangCandidates.find((candidate) => candidate !== "") || "en-US";

    return {
      speechLang,
      speechVoice: serviceConfig.speechVoice ?? this.config.speechVoice ?? "",
      speechRate: normalizeNumber(serviceConfig.speechRate ?? this.config.speechRate ?? this.defaults.speechRate, 1, 0.1, 10),
      speechPitch: normalizeNumber(serviceConfig.speechPitch ?? this.config.speechPitch ?? this.defaults.speechPitch, 1, 0, 2),
      speechVolume: normalizeNumber(serviceConfig.speechVolume ?? this.config.speechVolume ?? this.defaults.speechVolume, 1, 0, 1)
    };
  },

  resolveTranslationLanguage () {
    let explicitLang = "";
    if (typeof this.config.translationLang === "string") {
      explicitLang = this.config.translationLang.trim();
    }
    if (explicitLang !== "") {
      return explicitLang;
    }

    const derivedFromSpeech = this.serviceConfig.speechLang.split("-")[0];
    if (derivedFromSpeech !== "") {
      return derivedFromSpeech;
    }

    return config.language || "en";
  },

  setupTranslation () {
    window.mmmWebSpeechTtsLang = this.serviceConfig.speechLang;
    window.mmmWebSpeechTtsTranslate = (key, variables) => this.translate(key, variables);

    const fallbackLanguage = (config.language || "en").toLowerCase();
    const requestedLanguage = (this.translationLanguage || fallbackLanguage).toLowerCase();

    if (requestedLanguage === fallbackLanguage) {
      return;
    }

    const loadTranslation = async (langCode) => {
      try {
        const response = await fetch(this.file(`translations/${langCode}.json`));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        Log.warn(`MMM-WebSpeechTTS: Failed to load translations for ${langCode}: ${error.message}`);
        return {};
      }
    };

    const applyTemplate = (templateString, variables = {}) => {
      const replacement = (match) => {
        const placeholder = match.slice(1, -1).trim();
        if (Object.hasOwn(variables, placeholder)) {
          return variables[placeholder];
        }
        return match;
      };

      return templateString.replace(/\{[^}]+\}/gu, replacement);
    };

    (async () => {
      const translations = await loadTranslation("en");
      if (requestedLanguage !== "en") {
        const requestedTranslations = await loadTranslation(requestedLanguage);
        Object.assign(translations, requestedTranslations);
      }

      window.mmmWebSpeechTtsTranslate = (key, variables) => {
        const templateString = translations[key];
        if (templateString) {
          return applyTemplate(templateString, variables);
        }
        return this.translate(key, variables);
      };
      Log.info(`MMM-WebSpeechTTS: Loaded translations for ${requestedLanguage} (fallback ${fallbackLanguage})`);
    })();
  },

  setupService () {
    if (typeof window.MMMWebSpeechTtsService !== "function") {
      Log.error("MMM-WebSpeechTTS: Missing TTS service implementation. Did the script fail to load?");
      return;
    }

    this.service = new window.MMMWebSpeechTtsService({
      defaults: {
        lang: this.serviceConfig.speechLang,
        voice: this.serviceConfig.speechVoice,
        rate: this.serviceConfig.speechRate,
        pitch: this.serviceConfig.speechPitch,
        volume: this.serviceConfig.speechVolume
      },
      callbacks: {
        onVoices: (voices, requestId) => {
          this.sendNotification("WEB_SPEECH_TTS_VOICES_LIST", {voices, requestId});
        },
        onStart: (job) => {
          this.currentJobId = job.id;
          this.displayText = job.text;
          this.updateDom();
          this.sendNotification("WEB_SPEECH_TTS_STARTED", {id: job.id, text: job.text});
        },
        onEnd: (job) => {
          if (this.currentJobId === job.id) {
            this.currentJobId = null;
            if (this.service.isIdle()) {
              this.displayText = this.config.text;
              this.updateDom();
            }
          }
          this.sendNotification("WEB_SPEECH_TTS_ENDED", {id: job.id, text: job.text, reason: job.reason, error: job.error});
        }
      }
    });
  },

  setupGlobalApi () {
    const api = window.mmmWebSpeechTts || {};
    api.say = (payload) => {
      this.handleSay(payload || {}, "global-api");
    };
    api.stop = (id) => {
      this.handleStop(id, "global-api");
    };
    api.getVoices = (requestId) => {
      this.handleGetVoices(requestId, "global-api");
    };
    window.mmmWebSpeechTts = api;

    window.MMMWebSpeechTTSConfig = {
      producers: this.producerConfig
    };

    if (window.MMMWebSpeechTtsHelpers && typeof window.MMMWebSpeechTtsHelpers.notifyReady === "function") {
      window.MMMWebSpeechTtsHelpers.notifyReady(api);
    }
  },

  handleSay (payload, source) {
    if (!payload || typeof payload.text !== "string" || payload.text.trim() === "") {
      Log.warn(`MMM-WebSpeechTTS: Ignoring say request without text (source: ${source})`);
      return;
    }

    if (!this.service) {
      Log.error("MMM-WebSpeechTTS: Service not initialized. Cannot speak.");
      return;
    }

    const job = this.normalizeJob(payload, source);
    this.service.enqueue(job);
  },

  handleStop (id, source) {
    if (!this.service) {
      Log.error("MMM-WebSpeechTTS: Service not initialized. Cannot stop.");
      return;
    }
    this.service.stop(id);
    if (!id) {
      this.displayText = this.config.text;
      this.updateDom();
    }
    Log.debug(`MMM-WebSpeechTTS: Stop request processed (source: ${source}, id: ${id ?? "all"}).`);
  },

  handleGetVoices (requestId, source) {
    if (!this.service) {
      Log.error("MMM-WebSpeechTTS: Service not initialized. Cannot fetch voices.");
      return;
    }
    this.service.getVoices(requestId);
    Log.debug(`MMM-WebSpeechTTS: Voice list requested (source: ${source}).`);
  },

  normalizeJob (payload, source) {
    return {
      id: typeof payload.id === "string" && payload.id !== ""
        ? payload.id
        : this.generateJobId(),
      text: payload.text,
      lang: typeof payload.lang === "string" && payload.lang !== ""
        ? payload.lang
        : this.serviceConfig.speechLang,
      voice: typeof payload.voice === "string"
        ? payload.voice
        : this.serviceConfig.speechVoice,
      rate: typeof payload.rate === "number"
        ? payload.rate
        : this.serviceConfig.speechRate,
      pitch: typeof payload.pitch === "number"
        ? payload.pitch
        : this.serviceConfig.speechPitch,
      volume: typeof payload.volume === "number"
        ? payload.volume
        : this.serviceConfig.speechVolume,
      source
    };
  },

  generateJobId () {
    if (!this.jobCounter) {
      this.jobCounter = 0;
    }
    this.jobCounter += 1;
    return `${this.identifier}-job-${Date.now()}-${this.jobCounter}`;
  },

  mergeDeep (target, source) {
    const result = {...target};
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
        const targetValue = result[key] && typeof result[key] === "object"
          ? result[key]
          : {};
        result[key] = this.mergeDeep(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
    return result;
  }
});
