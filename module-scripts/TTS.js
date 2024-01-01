// Initialize new SpeechSynthesisUtterance object
const speech = new SpeechSynthesisUtterance();

// Set speech Language
speech.lang = config.language;

function speak(text) {
  speechSynthesis.cancel();
  speech.text = text;
  const wrapper = document.getElementById("mmm-webspeechtts");
  if (wrapper !== null) wrapper.textContent = text;
  Log.log(text);
  speechSynthesis.speak(speech);
}

function getGreetingString() {
  const now = new Date();
  const hour = now.getHours();
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

function getTimeAnnouncementString() {
  const now = new Date();
  const timeString = `Es ist ${now.getHours()} Uhr ${now.getMinutes()} .\n`;
  return timeString;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "g") {
    speak(getGreetingString());
  }
  if (event.key === "s") {
    speak("Ansage angehalten");
  }
  if (event.key === "t") {
    speak(getTimeAnnouncementString());
  }
});
