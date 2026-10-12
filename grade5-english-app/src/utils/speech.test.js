// מדמים את מנוע ההקראה של הדפדפן: כל משפט "מסתיים" כשקוראים ל-finish()
let spoken = [];
let current = null;
const finish = () => { const u = current; current = null; if (u && u.onend) u.onend(); };

beforeAll(() => {
  global.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) { this.text = text; };
  window.speechSynthesis = {
    getVoices: () => [],
    speak: (u) => { spoken.push(u.text); current = u; },
    cancel: () => { current = null; }
  };
});

beforeEach(() => {
  spoken = [];
  current = null;
  jest.useFakeTimers();
  localStorage.clear();
});
afterEach(() => jest.useRealTimers());

const { splitIntoSentences, createReader, getRate, setSpeedId } = require('./speech');

test('splits a passage into sentences, keeping quotes', () => {
  expect(splitIntoSentences('Hi! My name is Ben. He says, "Go!" Then he runs.\nThe end.'))
    .toEqual(['Hi!', 'My name is Ben.', 'He says, "Go!"', 'Then he runs.', 'The end.']);
});

test('pause and play continue from the same sentence, not from the start', () => {
  const reader = createReader('One. Two. Three. Four.');
  reader.play();
  expect(spoken).toEqual(['One.']);
  finish(); jest.runAllTimers();
  expect(spoken).toEqual(['One.', 'Two.']);
  reader.pause();
  jest.runAllTimers();
  expect(spoken).toEqual(['One.', 'Two.']); // nothing more while paused
  reader.play();
  expect(spoken).toEqual(['One.', 'Two.', 'Two.']); // resumes the interrupted sentence
  finish(); jest.runAllTimers();
  expect(spoken[spoken.length - 1]).toBe('Three.');
});

test('stop resets to the beginning and onEnd fires at the end', () => {
  const onEnd = jest.fn();
  const reader = createReader('A. B.', { onEnd });
  reader.play(); finish(); jest.runAllTimers();
  reader.stop();
  reader.play();
  expect(spoken[spoken.length - 1]).toBe('A.');
  finish(); jest.runAllTimers(); finish(); jest.runAllTimers();
  expect(onEnd).toHaveBeenCalledTimes(1);
});

test('three speed levels, slow by default, choice is remembered', () => {
  expect(getRate()).toBe(0.6);
  setSpeedId('normal');
  expect(getRate()).toBe(0.9);
  setSpeedId('nonsense');
  expect(getRate()).toBe(0.6);
});
