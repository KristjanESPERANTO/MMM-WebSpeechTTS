/* eslint-disable no-restricted-syntax */
/* global config Log getDesparturesString */

// Initialize new SpeechSynthesisUtterance object
const speech = new SpeechSynthesisUtterance();

// Set speech Language
speech.lang = config.language;

function getTimeAnnouncementString() {
  const time = new Date();
  const timeString = `Es ist ${time.getHours()} Uhr ${time.getMinutes()} .\n`;
  return timeString;
}

function speak(text) {
  speechSynthesis.cancel();
  speech.text = text;
  const wrapper = document.getElementById("mmm-webspeechtts");
  if (wrapper !== null) wrapper.innerText = text;
  Log.log(text);
  speechSynthesis.speak(speech);
}

function getGreetingString() {
  const time = new Date();
  const hour = time.getHours();
  let greetingsString;
  if (hour > 18) {
    greetingsString = "Guten Abend. ";
  } else if (hour < 10) {
    greetingsString = "Guten Morgen. ";
  } else {
    greetingsString = "Guten Tag. ";
  }
  return greetingsString;
}

// TODO: Depending on Config
if (true) {
  setTimeout(() => {
    let firstTextToSpeech = getGreetingString();
    firstTextToSpeech += getTimeAnnouncementString();
    speak(firstTextToSpeech);
  }, 10000);

  document.addEventListener("keydown", (event) => {
    if (event.key === "d") {
      speak(`${getTimeAnnouncementString()} - ${getDesparturesString()}`);
    }
    if (event.key === "s") {
      speak("Ansage angehalten");
    }
  });
}
