export const SPEECH_ALTERNATIVE_LIMIT = 3;
// Preserve Sinhala combining marks; ignore formatting only.
export const normalizeSpeechAnswer = (value = '') => String(value).normalize('NFKC').toLowerCase().replace(/[\s\p{P}\u200B-\u200D\uFEFF]+/gu, '');
export const matchesSpeechAnswer = (expected, transcript, acceptedAnswers = []) => {
 const heard = normalizeSpeechAnswer(transcript);
 return Boolean(heard) && [expected, ...acceptedAnswers].some(answer => Boolean(answer) && normalizeSpeechAnswer(answer) === heard);
};
export const getSpeechTranscripts = result => Array.from({length: Math.min(result?.length ?? 0, SPEECH_ALTERNATIVE_LIMIT)}, (_, i) => result[i]?.transcript?.trim()).filter(Boolean);
