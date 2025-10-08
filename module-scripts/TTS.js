
(() => {
  const LOG_PREFIX = "MMM-WebSpeechTTS";

  const hasSpeechSupport = () => typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  class MMMWebSpeechTtsService {
    constructor (options) {
      const config = options || {};
      const defaults = config.defaults || {};
      const callbacks = config.callbacks || {};

      this.defaults = {
        lang: defaults.lang || "en-US",
        voice: defaults.voice || "",
        rate: typeof defaults.rate === "number"
          ? defaults.rate
          : 1,
        pitch: typeof defaults.pitch === "number"
          ? defaults.pitch
          : 1,
        volume: typeof defaults.volume === "number"
          ? defaults.volume
          : 1
      };

      this.callbacks = {
        onVoices: typeof callbacks.onVoices === "function"
          ? callbacks.onVoices
          : null,
        onStart: typeof callbacks.onStart === "function"
          ? callbacks.onStart
          : null,
        onEnd: typeof callbacks.onEnd === "function"
          ? callbacks.onEnd
          : null
      };

      this.queue = [];
      this.currentJob = null;
      this.pendingVoiceRequests = [];
      this.isSpeechAvailable = hasSpeechSupport();
      this.voicesReady = false;

      if (!this.isSpeechAvailable) {
        Log.error(`${LOG_PREFIX}: Web Speech API is not available in this environment.`);
        return;
      }

      this.handleVoicesChanged = this.handleVoicesChanged.bind(this);
      window.speechSynthesis.addEventListener("voiceschanged", this.handleVoicesChanged);
      this.preloadVoices();
    }

    enqueue (job) {
      if (!this.isSpeechAvailable) {
        this.emitSyntheticEnd(job, "unavailable", new Error("Speech synthesis not supported."));
        return;
      }

      const preparedJob = this.prepareJob(job);
      this.queue.push(preparedJob);
      this.maybeStartNext();
    }

    stop (jobId) {
      if (!this.isSpeechAvailable) {
        return;
      }

      if (typeof jobId === "string" && jobId !== "") {
        this.queue = this.queue.filter((queuedJob) => queuedJob.id !== jobId);
        if (this.currentJob !== null && this.currentJob.id === jobId) {
          window.speechSynthesis.cancel();
          this.finishCurrentJob("cancelled");
        }
        return;
      }

      this.queue = [];
      if (this.currentJob !== null) {
        window.speechSynthesis.cancel();
        this.finishCurrentJob("stopped");
      }
    }

    getVoices (requestId) {
      if (!this.isSpeechAvailable) {
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        const id = typeof requestId === "string"
          ? requestId
          : null;
        this.pendingVoiceRequests.push(id);
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          this.flushPendingVoiceRequests();
        }, {once: true});
        return;
      }

      this.emitVoices(voices, requestId || null);
    }

    isIdle () {
      return this.currentJob === null && this.queue.length === 0;
    }

    prepareJob (job) {
      const payload = job || {};
      const text = typeof payload.text === "string"
        ? payload.text.trim()
        : "";
      const hasLang = typeof payload.lang === "string" && payload.lang.trim() !== "";
      const lang = hasLang
        ? payload.lang.trim()
        : this.defaults.lang;
      const voice = typeof payload.voice === "string"
        ? payload.voice.trim()
        : this.defaults.voice;
      const rate = typeof payload.rate === "number"
        ? payload.rate
        : this.defaults.rate;
      const pitch = typeof payload.pitch === "number"
        ? payload.pitch
        : this.defaults.pitch;
      const volume = typeof payload.volume === "number"
        ? payload.volume
        : this.defaults.volume;
      if (text === "") {
        throw new Error("MMMWebSpeechTtsService: Cannot enqueue empty text");
      }

      return {
        id: typeof payload.id === "string" && payload.id !== ""
          ? payload.id
          : this.generateJobId(),
        text,
        lang,
        voice,
        rate,
        pitch,
        volume,
        source: payload.source || "unknown"
      };
    }

    maybeStartNext () {
      if (!this.isSpeechAvailable) {
        return;
      }
      if (this.currentJob !== null) {
        return;
      }
      if (this.queue.length === 0) {
        return;
      }

      const nextJob = this.queue.shift();
      this.startJob(nextJob);
    }

    startJob (job) {
      const utterance = new window.SpeechSynthesisUtterance(job.text);
      utterance.lang = job.lang;
      utterance.rate = job.rate;
      utterance.pitch = job.pitch;
      utterance.volume = job.volume;
      const selectedVoice = MMMWebSpeechTtsService.selectVoice(job.voice, job.lang);
      if (selectedVoice !== null) {
        utterance.voice = selectedVoice;
      }

      this.currentJob = {
        ...job,
        utterance,
        reason: "completed",
        error: null
      };

      utterance.addEventListener("start", () => {
        if (this.callbacks.onStart) {
          this.callbacks.onStart({...this.currentJob});
        }
      });

      utterance.addEventListener("end", () => {
        const reason = this.currentJob?.reason ?? "completed";
        const error = this.currentJob?.error ?? null;
        this.finishCurrentJob(reason, error);
      });

      utterance.addEventListener("error", (event) => {
        const message = event.error || event.message || "Speech synthesis error";
        this.finishCurrentJob("error", message);
      });

      let voiceName = "default";
      if (utterance.voice) {
        voiceName = utterance.voice.name;
      }
      Log.log(`${LOG_PREFIX}: Speaking (${utterance.lang}, ${voiceName}) -> ${job.text}`);
      window.speechSynthesis.speak(utterance);
    }

    static selectVoice (voiceName, lang) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        return null;
      }

      if (voiceName !== "") {
        const exact = voices.find((voiceItem) => voiceItem.name === voiceName);
        if (exact) {
          return exact;
        }
      }

      const perfectMatch = voices.find((voiceItem) => voiceItem.lang === lang);
      if (perfectMatch) {
        return perfectMatch;
      }

      const langPrefix = lang.split("-")[0];
      const partialMatch = voices.find((voiceItem) => voiceItem.lang.startsWith(langPrefix));
      if (partialMatch) {
        return partialMatch;
      }

      return voices[0];
    }

    handleVoicesChanged () {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.voicesReady = true;
        this.flushPendingVoiceRequests();
      }
    }

    flushPendingVoiceRequests () {
      if (!this.callbacks.onVoices) {
        this.pendingVoiceRequests = [];
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        return;
      }

      while (this.pendingVoiceRequests.length > 0) {
        const requestId = this.pendingVoiceRequests.shift();
        this.emitVoices(voices, requestId);
      }
    }

    emitVoices (voices, requestId) {
      if (!this.callbacks.onVoices) {
        return;
      }
      const payload = voices.map((voiceItem) => ({
        name: voiceItem.name,
        lang: voiceItem.lang,
        localService: voiceItem.localService,
        default: voiceItem.default
      }));
      this.callbacks.onVoices(payload, requestId);
    }

    preloadVoices () {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.voicesReady = true;
      }
    }

    emitSyntheticEnd (job, reason, error) {
      if (!this.callbacks.onEnd) {
        return;
      }
      let jobId = this.generateJobId();
      if (job && job.id) {
        jobId = job.id;
      }

      let jobText = "";
      if (job && job.text) {
        jobText = job.text;
      }

      let errorMessage = "";
      if (error) {
        errorMessage = error.message;
      }

      const payload = {
        id: jobId,
        text: jobText,
        reason,
        error: errorMessage
      };
      this.callbacks.onEnd(payload);
    }

    finishCurrentJob (reason, error) {
      if (this.currentJob === null) {
        return;
      }

      const job = this.currentJob;
      this.currentJob = null;

      const summary = {
        id: job.id,
        text: job.text,
        reason: reason ?? job.reason ?? "completed",
        error: error ?? job.error ?? null
      };

      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(summary);
      }

      this.maybeStartNext();
    }

    generateJobId () {
      if (!this.jobCounter) {
        this.jobCounter = 0;
      }
      this.jobCounter += 1;
      return `job-${Date.now()}-${this.jobCounter}`;
    }
  }

  window.MMMWebSpeechTtsService = MMMWebSpeechTtsService;
})();
