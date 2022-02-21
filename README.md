# MMM-WebSpeechTTS

A Text-To-Speech module for MagicMirror² which uses the Web Speech API of the browser.

**This module is still under construction and only works partially!**

So far, only German is supported, but other languages are to follow. Support would be very welcome!

## Features

- Greeting with time at the start of the MagicMirror².
- Read aloud by pressing key:
  - Time
  - Departures from MMM-PublicTransportHafas

## Installation

1. Clone this module into your MagicMirror² modules folder.
   `git clone https://github.com/KristjanESPERANTO/MMM-WebSpeechTTS/`
2. Add the configuration of the module to your `config.js`:

    ```js
    {
      module: "MMM-WebSpeechTTS",
      position: "top_left",
      config: {
        greetingsAtStartup: true,
        modules: ["MMM-PublicTransportHafas"]
      }
    },
    ```

3. Run command `sudo apt-get install espeak-ng speech-dispatcher`.

## Config options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `greetingsAtStartup` | true | If true, the MagicMirror² will greet you after it has started. |
| `hidden` | `true` | Set the value to `false` if you want to see the text that is read out on your mirror. |
| `modules` | `[]` | Array of modules which you wanna use. Till now only "MMM-PublicTransportHafas" is possible. |
| `text` | `"MMM-WebSpeechTTS"` | Text to display at startup if `hidden:false`. |

## Keyboard control

| **Key** | **Modul** | **Description** |
| --- | --- | --- |
| `g` | `built-in` | **G**reeting. |
| `s` | `built-in` | **S**top the reading. |
| `t` | `built-in` | Tell the **t**ime. |
| `d` | `"MMM-WebSpeechTTS"` | Read the **d**epartures. |

## Run it

### with Electron

You have to modify the way you are starting the MagicMirror². You have to two option:

1. Adapt `package.json` of MagicMirror²:
   Add script to package.json:
   `"start:tts": "speech-dispatcher -s -t 0 & DISPLAY=\"${DISPLAY:=:0}\" ./node_modules/.bin/electron --enable-speech-dispatcher js/electron.js",`

   Start with: `npm run start:tts`

2. Run `speech-dispatcher -s -t 0 & npm run start -- --enable-speech-dispatcher` instead of `npm run start`

## Server mode

- ToDo: Test with different browsers

## ToDo

- Mention in MMM-Public-TransportHafas that TTS is possible with this module
- Translations
