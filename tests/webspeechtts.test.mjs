import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import test from "node:test";

const moduleSource = readFileSync(new URL("../MMM-WebSpeechTTS.js", import.meta.url), "utf8");
const serviceSource = readFileSync(new URL("../module-scripts/TTS.js", import.meta.url), "utf8");

const toPlainObject = (value) => JSON.parse(JSON.stringify(value));

const loadModule = (moduleConfig = {}, mirrorConfig = {}) => {
  let definition;
  const context = {
    config: mirrorConfig,
    Log: {},
    Module: {
      register: (_name, moduleDefinition) => {
        definition = moduleDefinition;
      }
    },
    window: {}
  };
  runInNewContext(moduleSource, context);
  return Object.assign(Object.create(definition), {config: moduleConfig});
};

const loadService = () => {
  const utterances = [];
  const endedJobs = [];
  const speechSynthesis = {
    addEventListener: () => null,
    cancel: () => null,
    getVoices: () => [],
    speak: (utterance) => utterances.push(utterance)
  };
  class FakeUtterance {
    constructor (text) {
      this.text = text;
      this.listeners = {};
    }

    addEventListener (eventName, callback) {
      this.listeners[eventName] = callback;
    }

    dispatch (eventName) {
      this.listeners[eventName]();
    }
  }
  const context = {
    Log: {error: () => null, log: () => null},
    window: {SpeechSynthesisUtterance: FakeUtterance, speechSynthesis}
  };
  runInNewContext(serviceSource, context);
  const service = new context.window.MMMWebSpeechTtsService({
    callbacks: {onEnd: (job) => endedJobs.push(job)}
  });
  return {endedJobs, service, utterances};
};

test("service config resolves language and clamps numeric options", () => {
  const module = loadModule({speechRate: 20, speechPitch: -1, speechVolume: 2}, {locale: " de-DE "});

  assert.deepEqual(toPlainObject(module.buildServiceConfig()), {
    speechLang: "de-DE",
    speechVoice: "",
    speechRate: 10,
    speechPitch: 0,
    speechVolume: 1
  });
});

test("producer config deep-merges nested shortcut overrides", () => {
  const module = loadModule({producers: {keyboard: {shortcuts: {greeting: "h"}}}});
  const producers = module.buildProducerConfig();

  assert.equal(producers.keyboard.shortcuts.greeting, "h");
  assert.equal(producers.keyboard.shortcuts.stop, "s");
  assert.equal(producers.greeting.enabled, true);
});

test("job normalization applies service defaults and generates an id", () => {
  const module = loadModule();
  module.identifier = "tts";
  module.serviceConfig = {speechLang: "en-US", speechVoice: "Voice", speechRate: 1.2, speechPitch: 0.8, speechVolume: 0.7};

  const job = module.normalizeJob({text: "Hello"}, "notification");

  assert.match(job.id, /^tts-job-\d+-1$/u);
  assert.equal(job.lang, "en-US");
  assert.equal(job.voice, "Voice");
  assert.equal(job.rate, 1.2);
  assert.equal(job.pitch, 0.8);
  assert.equal(job.volume, 0.7);
  assert.equal(job.source, "notification");
});

test("service processes queued speech in FIFO order", () => {
  const {endedJobs, service, utterances} = loadService();

  service.enqueue({id: "first", text: "First"});
  service.enqueue({id: "second", text: "Second"});
  assert.equal(utterances.length, 1);
  assert.equal(service.queue.length, 1);

  utterances[0].dispatch("end");
  assert.equal(utterances.length, 2);
  assert.equal(utterances[1].text, "Second");
  assert.equal(endedJobs[0].id, "first");
  assert.equal(endedJobs[0].reason, "completed");
});

test("stopping the active job starts the next queued job", () => {
  const {endedJobs, service, utterances} = loadService();

  service.enqueue({id: "active", text: "Active"});
  service.enqueue({id: "next", text: "Next"});
  service.stop("active");

  assert.equal(endedJobs[0].id, "active");
  assert.equal(endedJobs[0].reason, "cancelled");
  assert.equal(utterances.length, 2);
  assert.equal(utterances[1].text, "Next");
});
