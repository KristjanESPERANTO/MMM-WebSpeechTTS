# MMM-WebSpeechTTS

This module is still under construction and only works partially!

A Text-To-Speech module for MagicMirror² which uses the Web Speech API of the browser.

## Features

- Time
- Departures from MMM-PublicTransportHafas

## Installation

1. Clone this repo into `~/MagicMirror/modules` directory.
2. Configure your `~/MagicMirror/config/config.js`:

    ```js
    {
        module: 'MMM-WebSpeechTTS',
        position: 'top_right',
        config: {
            ...
        }
    }
    ```

3. Run command `npm install` in `~/MagicMirror/modules/MMM-WebSpeechTTS` directory.
4. Run command `sudo apt-get install espeak-ng speech-dispathcer`.

## Config options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `text` | `"MMM-WebSpeechTTS"` | Text to display in debug mode, while there's no text to speech. |

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
- Keymap
