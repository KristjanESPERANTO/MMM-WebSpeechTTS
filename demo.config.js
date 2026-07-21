/**
 * Demo configuration for MMM-WebSpeechTTS module development
 * This config is used for testing the module in isolation
 *
 * Usage: node --run demo
 */

let config = {
  port: 8080,
  address: "localhost",
  language: "en",
  logLevel: ["INFO", "LOG", "WARN", "ERROR"],
  timeFormat: 24,
  units: "metric",

  modules: [
    {
      module: "alert"
    },
    {
      module: "clock",
      position: "top_left",
      config: {
        timeFormat: 24,
        showSunTimes: true
      }
    },
    {
      module: "compliments",
      position: "lower_third",
      config: {
        compliments: {
          anytime: ["⌨️\ng: greeting\ns: stop\nt: time"]
        },
        updateInterval: 1000000
      }
    },

    /*
     * Main Text-to-Speech service module
     * Note: Usually only ONE instance is needed - this is a service module
     * with a central speech queue that other modules can use via notifications
     */
    {
      module: "MMM-WebSpeechTTS",
      position: "top_right",
      config: {
        hidden: false, // Show the display text for demo purposes
        text: "Speech Ready",
        speechLang: "en-US", // Or "de-DE" for German
        speechVoice: "", // Leave empty for auto-selection
        speechRate: 0.75, // 0.1 - 10
        speechPitch: 1, // 0 - 2
        speechVolume: 1, // 0 - 1
        translationLang: "", // Auto-detected from speechLang
        producers: {
          greeting: {
            enabled: true,
            delay: 8000 // Wait 8 seconds before greeting
          },
          keyboard: {
            enabled: true,
            shortcuts: {
              greeting: "g", // Press 'g' for greeting
              stop: "s", // Press 's' to stop speech
              time: "t" // Press 't' for current time
            }
          },
          publicTransport: {
            enabled: false, // Enable if you have MMM-PublicTransportHafas
            shortcut: "d" // Press 'd' for departures
          }
        }
      }
    }

    /*
     * Alternative configurations (choose ONE, not multiple instances):
     *
     * German language variant:
     * {
     *   module: "MMM-WebSpeechTTS",
     *   position: "top_right",
     *   config: {
     *     hidden: true,
     *     speechLang: "de-DE",
     *     speechRate: 1.1,
     *     translationLang: "de",
     *     producers: {
     *       greeting: { enabled: true, delay: 8000 },
     *       keyboard: { enabled: true, shortcuts: { greeting: "g", stop: "s", time: "t" } },
     *       publicTransport: { enabled: false, shortcut: "d" }
     *     }
     *   }
     * },
     *
     * With Public Transport integration (requires MMM-PublicTransportHafas):
     * {
     *   module: "MMM-WebSpeechTTS",
     *   position: "top_right",
     *   config: {
     *     hidden: true,
     *     speechLang: "de-DE",
     *     producers: {
     *       greeting: { enabled: true, delay: 8000 },
     *       keyboard: { enabled: true, shortcuts: { greeting: "g", stop: "s", time: "t" } },
     *       publicTransport: { enabled: true, shortcut: "d" }
     *     }
     *   }
     * },
     *
     * Optional: MMM-PublicTransportHafas for testing public transport producer
     * {
     *   module: "MMM-PublicTransportHafas",
     *   position: "bottom_left",
     *   config: {
     *     stationID: "8012202",
     *     stationName: "Wilhelm-Leuschner-Platz",
     *     maxReachableDepartures: 5
     *   }
     * }
     */
  ]
};

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = config;
}
