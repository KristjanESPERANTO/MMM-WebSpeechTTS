# MMM-WebSpeechTTS

An experimental Text-To-Speech module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) which uses the Web Speech API of the browser.

## Project status

**This module is still under construction and only works partially!**

The architecture of the module is still not good, but the approach of using the Web Speech API makes sense and is worth pursuing further.

I am currently investing my time in other projects, but I am happy to receive PRs or talk about issues.

So far, only German is supported, but other languages are to follow. Support would be very welcome!

## Features

- Greeting with time at the start of the MagicMirror².
- Read aloud by pressing key:
  - Time
  - Departures from MMM-PublicTransportHafas

## Installation

1. Clone this module into your MagicMirror² modules folder.

   ```bash
   cd ~/MagicMirror/modules
   git clone https://github.com/KristjanESPERANTO/MMM-WebSpeechTTS
   ```

2. Install dependencies:

   ```bash
   sudo apt-get install espeak-ng speech-dispatcher
   ```

## Configuration

Add the configuration of the module to your `config.js`:

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

### Config options

| **Option**           | **Default**          | **Description**                                                                             |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `greetingsAtStartup` | `true`               | If true, the MagicMirror² will greet you after it has started.                              |
| `hidden`             | `true`               | Set the value to `false` if you want to see the text that is read out on your mirror.       |
| `modules`            | `[]`                 | Array of modules which you wanna use. Till now only "MMM-PublicTransportHafas" is possible. |
| `text`               | `"MMM-WebSpeechTTS"` | Text to display at startup if `hidden:false`.                                               |

## Keyboard control

| **Key** | **Module**           | **Description**          |
| ------- | -------------------- | ------------------------ |
| `g`     | `built-in`           | **G**reeting.            |
| `s`     | `built-in`           | **S**top the reading.    |
| `t`     | `built-in`           | Tell the **t**ime.       |
| `d`     | `"MMM-WebSpeechTTS"` | Read the **d**epartures. |

## Run it

You have to modify the way you are starting MagicMirror². You have three options:

### A. Adapt `package.json` of MagicMirror²

Add script to package.json:
`"start:tts": "speech-dispatcher -s -t 0 & npm run start -- --enable-speech-dispatcher",`

Start with: `npm run start:tts`

### B. Run command

Run `speech-dispatcher -s -t 0 & npm run start -- --enable-speech-dispatcher` instead of `npm run start`.

### C. Server mode

Start with: `npm run server` and open MagicMirror² in Firefox.

ToDo: Test with other browsers.

## Update

Go to the module’s directory and pull the latest version from GitHub:

```bash
cd ~/MagicMirror/modules/MMM-WebSpeechTTS
git pull
```

## ToDo

- Use [MMM-Keypress](https://github.com/ItsMeBrille/MMM-Keypress) instead of self handling keys
- Mention in MMM-Public-TransportHafas that TTS is possible with this module
- Translations
- Read messages from notifications like other modules.

## Contributing

If you find any problems, bugs or have questions, please [open a GitHub issue](https://github.com/KristjanESPERANTO/MMM-WebSpeechTTS/issues) in this repository.

Pull requests are of course also very welcome 🙂

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

### Developer commands

- `npm install` - Install development dependencies.
- `npm run lint` - Run linting and formatter checks.
- `npm run lint:fix` - Fix linting and formatter issues.
- `npm run test` - Run linting and formatter checks + Run spelling check.
- `npm run test:spelling` - Run spelling check.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
