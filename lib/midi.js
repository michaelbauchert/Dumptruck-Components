import WebMidi from "webmidi";

WebMidi
    .enable()
    .then(onEnabled)
    .catch(err => console.error(err));

const inputs = WebMidi.inputs