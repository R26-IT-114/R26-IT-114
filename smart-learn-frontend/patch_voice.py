#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Link voice assets to LetterListening and WordBuilder."""

NL = '\r\n'

# ═══════════════════════════════════════════════════════════════
# LETTER LISTENING
# ═══════════════════════════════════════════════════════════════
LL = 'src/modules/dyslexia/pages/LetterListening.jsx'
with open(LL, 'rb') as f:
    ll = f.read().decode('utf-8')

# 1. Add audio imports after dynoImg import
old1 = "import dynoImg    from '../../../assets/images/background/dyno.png';"
new1 = (
    "import dynoImg    from '../../../assets/images/background/dyno.png';" + NL +
    NL +
    "/* ─── Letter audio files ─── */" + NL +
    "import gaAudio   from '../../../assets/voice/ga.wav';" + NL +
    "import yaAudio   from '../../../assets/voice/ya.wav';" + NL +
    "import saAudio   from '../../../assets/voice/sa.wav';" + NL +
    "import paAudio   from '../../../assets/voice/pa.mp3';" + NL +
    "import naAudio   from '../../../assets/voice/na.wav';" + NL +
    "import thaAudio  from '../../../assets/voice/tha.wav';" + NL +
    "import kaAudio   from '../../../assets/voice/ka.wav';" + NL +
    "import aAudio    from '../../../assets/voice/a.wav';" + NL +
    "import uAudio    from '../../../assets/voice/u.wav';" + NL +
    "import raAudio   from '../../../assets/voice/ra.wav';" + NL +
    "import daAudio   from '../../../assets/voice/da.wav';" + NL +
    "import taAudio   from '../../../assets/voice/ta.wav';" + NL +
    "import maAudio   from '../../../assets/voice/ma.wav';" + NL +
    "import baAudio   from '../../../assets/voice/ba.wav';"
)
print(f'LL1 found: {old1 in ll}')
if old1 in ll:
    ll = ll.replace(old1, new1, 1)

# 2. Replace LEVEL_DATA with audio-enhanced version
old2 = (
    "/* \u2500\u2500\u2500 Two-level letter data \u2500\u2500\u2500 */" + NL +
    "const LEVEL_DATA = {" + NL +
    "  1: [" + NL +
    "    { id: '\u0d9c', letter: '\u0d9c', word: '\u0d9c\u0ddc\u0db1\u0dcf',   img: cowImg,     emoji: '\U0001f404', sound: 'ga'  }," + NL +
    "    { id: '\u0dc4', letter: '\u0dc4', word: '\u0dc4\u0dcf\u0db8\u0dd4',   img: theroImg,   emoji: '\U0001f9d9', sound: 'ha'  }," + NL +
    "    { id: '\u0dba', letter: '\u0dba', word: '\u0dba\u0dad\u0dd4\u0dbb',   img: null,       emoji: '\U0001f511', sound: 'ya'  }," + NL +
    "    { id: '\u0dc3', letter: '\u0dc3', word: '\u0dc3\u0dd2\u0d82\u0dc4',   img: lionImg,    emoji: '\U0001f981', sound: 'sa'  }," + NL +
    "    { id: '\u0db4', letter: '\u0db4', word: '\u0db4\u0dda\u0db1',    img: penImg,     emoji: '\u270f\ufe0f', sound: 'pa'  }," + NL +
    "    { id: '\u0db1', letter: '\u0db1', word: '\u0db1\u0dcf\u0dc3\u0dba',   img: noseImg,    emoji: '\U0001f443', sound: 'na'  }," + NL +
    "    { id: '\u0dad', letter: '\u0dad', word: '\u0dad\u0dcf\u0dbb\u0d9a\u0dcf',  img: null,       emoji: '\u2b50', sound: 'tha' }," + NL +
    "    { id: '\u0d9a', letter: '\u0d9a', word: '\u0d9a\u0dcf\u0d9a\u0dcf',   img: crowImg,    emoji: '\U0001f426', sound: 'ka'  }," + NL +
    "    { id: '\u0d85', letter: '\u0d85', word: '\u0d87\u0dad\u0dcf',    img: eleImg,     emoji: '\U0001f418', sound: 'ah'  }," + NL +
    "  ]," + NL +
    "  2: [" + NL +
    "    { id: '\u0d8b', letter: '\u0d8b', word: '\u0d8c\u0dbb\u0dcf',    img: null,       emoji: '\U0001f437', sound: 'oo'  }," + NL +
    "    { id: '\u0dbb', letter: '\u0dbb', word: '\u0dbb\u0dd2\u0dbd\u0dcf\u0dc0\u0dcf', img: monkImg,    emoji: '\U0001f412', sound: 'ra'  }," + NL +
    "    { id: '\u0daf', letter: '\u0daf', word: '\u0daf\u0dd2\u0dba',    img: null,       emoji: '\U0001f4a7', sound: 'dha' }," + NL +
    "    { id: '\u0da7', letter: '\u0da7', word: '\u0da7\u0dd2\u0d9a\u0dd2\u0dbb\u0dd2', img: null,       emoji: '\U0001f514', sound: 'ta'  }," + NL +
    "    { id: '\u0dbd', letter: '\u0dbd', word: '\u0dbd\u0dcf\u0db8\u0dca\u0db4\u0dd4', img: lampImg,    emoji: '\U0001f4a1', sound: 'la'  }," + NL +
    "    { id: '\u0db8', letter: '\u0db8', word: '\u0db8\u0ddc\u0db1\u0dbb\u0dcf',  img: peacockImg, emoji: '\U0001f99a', sound: 'ma'  }," + NL +
    "    { id: '\u0db6', letter: '\u0db6', word: '\u0db6\u0ddd\u0dbd',    img: ballImg,    emoji: '\u26bd', sound: 'ba'  }," + NL +
    "    { id: '\u0da9', letter: '\u0da9', word: '\u0da9\u0dd2\u0db1\u0ddd',  img: dynoImg,    emoji: '\U0001f995', sound: 'da'  }," + NL +
    "    { id: '\u0d89', letter: '\u0d89', word: '\u0d89\u0dbb',     img: null,       emoji: '\u2600\ufe0f', sound: 'ee'  }," + NL +
    "  ]," + NL +
    "};"
)
new2 = (
    "/* \u2500\u2500\u2500 Two-level letter data \u2500\u2500\u2500 */" + NL +
    "const LEVEL_DATA = {" + NL +
    "  1: [" + NL +
    "    { id: '\u0d9c', letter: '\u0d9c', word: '\u0d9c\u0ddc\u0db1\u0dcf',   img: cowImg,     emoji: '\U0001f404', sound: 'ga',  audio: gaAudio   }," + NL +
    "    { id: '\u0dc4', letter: '\u0dc4', word: '\u0dc4\u0dcf\u0db8\u0dd4',   img: theroImg,   emoji: '\U0001f9d9', sound: 'ha',  audio: null      }," + NL +
    "    { id: '\u0dba', letter: '\u0dba', word: '\u0dba\u0dad\u0dd4\u0dbb',   img: null,       emoji: '\U0001f511', sound: 'ya',  audio: yaAudio   }," + NL +
    "    { id: '\u0dc3', letter: '\u0dc3', word: '\u0dc3\u0dd2\u0d82\u0dc4',   img: lionImg,    emoji: '\U0001f981', sound: 'sa',  audio: saAudio   }," + NL +
    "    { id: '\u0db4', letter: '\u0db4', word: '\u0db4\u0dda\u0db1',    img: penImg,     emoji: '\u270f\ufe0f', sound: 'pa',  audio: paAudio   }," + NL +
    "    { id: '\u0db1', letter: '\u0db1', word: '\u0db1\u0dcf\u0dc3\u0dba',   img: noseImg,    emoji: '\U0001f443', sound: 'na',  audio: naAudio   }," + NL +
    "    { id: '\u0dad', letter: '\u0dad', word: '\u0dad\u0dcf\u0dbb\u0d9a\u0dcf',  img: null,       emoji: '\u2b50', sound: 'tha', audio: thaAudio  }," + NL +
    "    { id: '\u0d9a', letter: '\u0d9a', word: '\u0d9a\u0dcf\u0d9a\u0dcf',   img: crowImg,    emoji: '\U0001f426', sound: 'ka',  audio: kaAudio   }," + NL +
    "    { id: '\u0d85', letter: '\u0d85', word: '\u0d87\u0dad\u0dcf',    img: eleImg,     emoji: '\U0001f418', sound: 'ah',  audio: aAudio    }," + NL +
    "  ]," + NL +
    "  2: [" + NL +
    "    { id: '\u0d8b', letter: '\u0d8b', word: '\u0d8c\u0dbb\u0dcf',    img: null,       emoji: '\U0001f437', sound: 'oo',  audio: uAudio    }," + NL +
    "    { id: '\u0dbb', letter: '\u0dbb', word: '\u0dbb\u0dd2\u0dbd\u0dcf\u0dc0\u0dcf', img: monkImg,    emoji: '\U0001f412', sound: 'ra',  audio: raAudio   }," + NL +
    "    { id: '\u0daf', letter: '\u0daf', word: '\u0daf\u0dd2\u0dba',    img: null,       emoji: '\U0001f4a7', sound: 'dha', audio: daAudio   }," + NL +
    "    { id: '\u0da7', letter: '\u0da7', word: '\u0da7\u0dd2\u0d9a\u0dd2\u0dbb\u0dd2', img: null,       emoji: '\U0001f514', sound: 'ta',  audio: taAudio   }," + NL +
    "    { id: '\u0dbd', letter: '\u0dbd', word: '\u0dbd\u0dcf\u0db8\u0dca\u0db4\u0dd4', img: lampImg,    emoji: '\U0001f4a1', sound: 'la',  audio: null      }," + NL +
    "    { id: '\u0db8', letter: '\u0db8', word: '\u0db8\u0ddc\u0db1\u0dbb\u0dcf',  img: peacockImg, emoji: '\U0001f99a', sound: 'ma',  audio: maAudio   }," + NL +
    "    { id: '\u0db6', letter: '\u0db6', word: '\u0db6\u0ddd\u0dbd',    img: ballImg,    emoji: '\u26bd', sound: 'ba',  audio: baAudio   }," + NL +
    "    { id: '\u0da9', letter: '\u0da9', word: '\u0da9\u0dd2\u0db1\u0ddd',  img: dynoImg,    emoji: '\U0001f995', sound: 'da',  audio: null      }," + NL +
    "    { id: '\u0d89', letter: '\u0d89', word: '\u0d89\u0dbb',     img: null,       emoji: '\u2600\ufe0f', sound: 'ee',  audio: null      }," + NL +
    "  ]," + NL +
    "};"
)
print(f'LL2 found: {old2 in ll}')
if old2 in ll:
    ll = ll.replace(old2, new2, 1)
else:
    # Try alternative: just patch each audio: null line from the old level data
    print('LL2 not found - trying partial approach')
    # Find LEVEL_DATA block by looking for the end marker
    idx = ll.find("/* \u2500\u2500\u2500 Two-level letter data \u2500\u2500\u2500 */")
    print(f'LEVEL_DATA block starts at: {idx}')
    if idx >= 0:
        snippet = ll[idx:idx+200]
        print(repr(snippet[:100]))

# 3. Replace pronounceLetter with audio-first version
old3 = (
    "  const pronounceLetter = () => {" + NL +
    "    if (!synthesisRef.current || pronouncing) return;" + NL +
    "    const letter = LEVEL_DATA[level][currentIndex];" + NL +
    "    const utt = new SpeechSynthesisUtterance();" + NL +
    "    utt.text   = letter.sound;" + NL +
    "    utt.lang   = 'en-US';" + NL +
    "    utt.rate   = 0.75;" + NL +
    "    utt.pitch  = 1.1;" + NL +
    "    utt.volume = 1;" + NL +
    "    utt.onstart = () => { setPronouncing(true); setFeedback('\U0001f50a \u0d85\u0dc3\u0db1\u0dca\u0db1!'); setFeedbackType('info'); };" + NL +
    "    utt.onend   = () => { setPronouncing(false); setHasPlayed(true); setFeedback(''); };" + NL +
    "    utt.onerror = () => { setPronouncing(false); setFeedback('\u274c \u0dc1\u0db6\u0dca\u0daf \u0daf\u0ddc\u0dc2\u0dba'); setFeedbackType('bad'); };" + NL +
    "    if (synthesisRef.current.speaking) synthesisRef.current.cancel();" + NL +
    "    synthesisRef.current.speak(utt);" + NL +
    "  };"
)
new3 = (
    "  const pronounceLetter = () => {" + NL +
    "    if (pronouncing) return;" + NL +
    "    const letter = LEVEL_DATA[level][currentIndex];" + NL +
    "    setPronouncing(true);" + NL +
    "    setFeedback('\U0001f50a \u0d85\u0dc3\u0db1\u0dca\u0db1!');" + NL +
    "    setFeedbackType('info');" + NL +
    NL +
    "    const useTTS = () => {" + NL +
    "      if (!synthesisRef.current) { setPronouncing(false); return; }" + NL +
    "      const utt = new SpeechSynthesisUtterance();" + NL +
    "      utt.text   = letter.sound;" + NL +
    "      utt.lang   = 'en-US';" + NL +
    "      utt.rate   = 0.75;" + NL +
    "      utt.pitch  = 1.1;" + NL +
    "      utt.volume = 1;" + NL +
    "      utt.onend   = () => { setPronouncing(false); setHasPlayed(true); setFeedback(''); };" + NL +
    "      utt.onerror = () => { setPronouncing(false); setFeedback('\u274c \u0dc1\u0db6\u0dca\u0daf \u0daf\u0ddc\u0dc2\u0dba'); setFeedbackType('bad'); };" + NL +
    "      if (synthesisRef.current.speaking) synthesisRef.current.cancel();" + NL +
    "      synthesisRef.current.speak(utt);" + NL +
    "    };" + NL +
    NL +
    "    if (letter.audio) {" + NL +
    "      const audioEl = new Audio(letter.audio);" + NL +
    "      audioEl.onended = () => { setPronouncing(false); setHasPlayed(true); setFeedback(''); };" + NL +
    "      audioEl.onerror = () => useTTS();" + NL +
    "      audioEl.play().catch(() => useTTS());" + NL +
    "    } else {" + NL +
    "      useTTS();" + NL +
    "    }" + NL +
    "  };"
)
print(f'LL3 found: {old3 in ll}')
if old3 in ll:
    ll = ll.replace(old3, new3, 1)

with open(LL, 'wb') as f:
    f.write(ll.encode('utf-8'))
print('LetterListening done.')

# ═══════════════════════════════════════════════════════════════
# WORD BUILDER
# ═══════════════════════════════════════════════════════════════
WB = 'src/modules/dyslexia/pages/WordBuilder.jsx'
with open(WB, 'rb') as f:
    wb = f.read().decode('utf-8')

# 1. Add audio imports after FloatingJungleAnimals import
old_wb1 = "import FloatingJungleAnimals from '../components/FloatingJungleAnimals';"
new_wb1 = (
    "import FloatingJungleAnimals from '../components/FloatingJungleAnimals';" + NL +
    NL +
    "/* ─── Word audio files ─── */" + NL +
    "import gasaAudio   from '../../../assets/voice/gasa.wav';" + NL +
    "import hayaAudio   from '../../../assets/voice/haya.wav';" + NL +
    "import hathaAudio  from '../../../assets/voice/hatha.wav';" + NL +
    "import kahaAudio   from '../../../assets/voice/kaha.wav';" + NL +
    "import iraAudio    from '../../../assets/voice/ira.wav';" + NL +
    "import malaAudio   from '../../../assets/voice/mala.wav';" + NL +
    "import rataAudio   from '../../../assets/voice/rata.wav';" + NL +
    "import pahaAudio   from '../../../assets/voice/paha.wav';" + NL +
    "import kayaAudio   from '../../../assets/voice/kaya.wav';" + NL +
    "import yataAudio   from '../../../assets/voice/yata.wav';" + NL +
    "import payaAudio   from '../../../assets/voice/paya.wav';" + NL +
    "import daraAudio   from '../../../assets/voice/dara.wav';" + NL +
    "import yahanaAudio from '../../../assets/voice/yahana.wav';" + NL +
    "import pahanaAudio from '../../../assets/voice/pahana.wav';" + NL +
    "import nayanaAudio from '../../../assets/voice/nayana.wav';" + NL +
    "import gaganaAudio from '../../../assets/voice/gagana.wav';" + NL +
    "import pasaAudio   from '../../../assets/voice/pasa.wav';" + NL +
    "import kadayaAudio from '../../../assets/voice/kadaya.wav';" + NL +
    "import bataAudio   from '../../../assets/voice/bata.wav';"
)
print(f'WB1 found: {old_wb1 in wb}')
if old_wb1 in wb:
    wb = wb.replace(old_wb1, new_wb1, 1)

# 2. Replace WORDS array with audio-linked version
old_wb2 = (
    "/* \u2500\u2500\u2500 Word data \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */" + NL +
    "const WORDS = [" + NL +
    "  { word: '\u0d9c\u0dc4',   letters: ['\u0d9c', '\u0dc4'],         hint: '\u0d9c\u0dc3\u0d9a\u0dca \U0001f333' }," + NL +
    "  { word: '\u0db1\u0dc4\u0dba',  letters: ['\u0db1', '\u0dc4', '\u0dba'],    hint: '\u0dc1\u0dbb\u0dda\u0dbb\u0dba\u0dda \u0d9a\u0ddc\u0da7\u0dc3\u0d9a\u0dca \U0001f443' }," + NL +
    "  { word: '\u0dba\u0dc4\u0db1',  letters: ['\u0dba', '\u0dc4', '\u0db1'],    hint: '\u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1\u0dcf \U0001f6cf\ufe0f' }," + NL +
    "  { word: '\u0db4\u0dc4\u0db1',  letters: ['\u0db4', '\u0dc4', '\u0db1'],    hint: '\u0d86\u0dbd\u0ddc\u0d9a\u0dba \u0daf\u0dda\u0db1 \U0001f56f\ufe0f' }," + NL +
    "  { word: '\u0db1\u0dba\u0db1',  letters: ['\u0db1', '\u0dba', '\u0db1'],    hint: '\u0daf\u0dda\u0dc3 \u0db6\u0dbd\u0db1 \U0001f441\ufe0f' }," + NL +
    "  { word: '\u0d9c\u0d9f\u0db1',  letters: ['\u0d9c', '\u0d9f', '\u0db1'],    hint: '\u0d86\u0d9a\u0dcf\u0dc1\u0dba \U0001f30c' }," + NL +
    "  { word: '\u0d9a\u0dbb',   letters: ['\u0d9a', '\u0dbb'],          hint: '\u0dc1\u0dbb\u0dda\u0dbb\u0dba\u0dda \U0001f4aa' }," + NL +
    "  { word: '\u0dc3\u0dd2\u0dba',  letters: ['\u0dc3', '\u0dd2', '\u0dba'],    hint: '100 \U0001f522' }," + NL +
    "  { word: '\u0daf\u0dd2\u0dba',  letters: ['\u0daf', '\u0dd2', '\u0dba'],    hint: '\u0da2\u0dbd\u0dba \U0001f4a7' }," + NL +
    "  { word: '\u0dbd\u0d9a\u0dbd',  letters: ['\u0dbd', '\u0d9a', '\u0dbd'],    hint: '\u0dbd\u0d9a\u0dbd \u0dc4\u0dbb\u0dd2\u0dba \U0001f33f' }," + NL +
    "  { word: '\u0dad\u0dbb\u0dbd',  letters: ['\u0dad', '\u0dbb', '\u0dbd'],    hint: '\u0da2\u0dbd\u0dba / oil \U0001f4a7' }," + NL +
    "  { word: '\u0db6\u0dbd',   letters: ['\u0db6', '\u0dbd'],          hint: '\u0dc1\u0d9a\u0dca\u0dad\u0dd2\u0dba \U0001f4aa' }," + NL +
    "  { word: '\u0db1\u0dbd',   letters: ['\u0db1', '\u0dbd'],          hint: '\u0da2\u0dbd \u0db1\u0dbd\u0dba \U0001f6bf' }," + NL +
    "  { word: '\u0d9a\u0dbd',   letters: ['\u0d9a', '\u0dbd'],          hint: '\u0d9a\u0dbd\u0dcf\u0dc0 \U0001f3a8' }," + NL +
    "  { word: '\u0d9c\u0dbd',   letters: ['\u0d9c', '\u0dbd'],          hint: '\u0db4\u0dcf\u0dc2\u0dcf\u0dab \U0001fab8' }," + NL +
    "];"
)
new_wb2 = (
    "/* \u2500\u2500\u2500 Word data \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */" + NL +
    "const WORDS = [" + NL +
    "  { word: '\u0d9c\u0dc3',  letters: ['\u0d9c', '\u0dc3'],      hint: '\u0d9c\u0dc4 \U0001f333',            audio: gasaAudio   }," + NL +
    "  { word: '\u0dc4\u0dba',  letters: ['\u0dc4', '\u0dba'],      hint: '\u0d9c\u0dab\u0db1\u0dba \U0001f522',          audio: hayaAudio   }," + NL +
    "  { word: '\u0dc4\u0dad',  letters: ['\u0dc4', '\u0dad'],      hint: '\u0d9c\u0dab\u0db1\u0dba \U0001f522',          audio: hathaAudio  }," + NL +
    "  { word: '\u0d9a\u0dc4',  letters: ['\u0d9a', '\u0dc4'],      hint: '\u0d9a\u0dc4 \u0db4\u0dcf\u0da7 \U0001f33b',        audio: kahaAudio   }," + NL +
    "  { word: '\u0d89\u0dbb',  letters: ['\u0d89', '\u0dbb'],      hint: '\u0d86\u0dbd\u0ddc\u0d9a\u0dba \u2600\ufe0f',         audio: iraAudio    }," + NL +
    "  { word: '\u0db8\u0dbd',  letters: ['\u0db8', '\u0dbd'],      hint: '\u0dc3\u0dd4\u0db1\u0dca\u0daf\u0dbb \U0001f338',          audio: malaAudio   }," + NL +
    "  { word: '\u0dbb\u0da7',  letters: ['\u0dbb', '\u0da7'],      hint: '\u0dbb\u0da7\u0d9a\u0dca \U0001f30d',           audio: rataAudio   }," + NL +
    "  { word: '\u0db4\u0dc4',  letters: ['\u0db4', '\u0dc4'],      hint: '\u0d9c\u0dab\u0db1\u0dba \U0001f590\ufe0f',           audio: pahaAudio   }," + NL +
    "  { word: '\u0d9a\u0dba',  letters: ['\u0d9a', '\u0dba'],      hint: '\u0dc1\u0dbb\u0dda\u0dbb\u0dba \U0001f3c3',           audio: kayaAudio   }," + NL +
    "  { word: '\u0dba\u0da7',  letters: ['\u0dba', '\u0da7'],      hint: '\u0db4\u0dc4\u0dbd \u2193',             audio: yataAudio   }," + NL +
    "  { word: '\u0db4\u0dba',  letters: ['\u0db4', '\u0dba'],      hint: '\u0d9c\u0db8\u0db1\u0dca \u0d9a\u0dbb\u0dba\u0dd2 \U0001f9b6',    audio: payaAudio   }," + NL +
    "  { word: '\u0daf\u0dbb',  letters: ['\u0daf', '\u0dbb'],      hint: '\u0dbd\u0dd3 \u2734\ufe0f',              audio: daraAudio   }," + NL +
    "  { word: '\u0dba\u0dc4\u0db1', letters: ['\u0dba', '\u0dc4', '\u0db1'], hint: '\u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1\u0dcf \U0001f6cf\ufe0f',     audio: yahanaAudio }," + NL +
    "  { word: '\u0db4\u0dc4\u0db1', letters: ['\u0db4', '\u0dc4', '\u0db1'], hint: '\u0d86\u0dbd\u0ddc\u0d9a\u0dba \u0daf\u0dda\u0db1 \U0001f56f\ufe0f',    audio: pahanaAudio }," + NL +
    "  { word: '\u0db1\u0dba\u0db1', letters: ['\u0db1', '\u0dba', '\u0db1'], hint: '\u0daf\u0dda\u0dc3 \u0db6\u0dbd\u0db1 \U0001f441\ufe0f',      audio: nayanaAudio }," + NL +
    "  { word: '\u0d9c\u0d9f\u0db1', letters: ['\u0d9c', '\u0d9f', '\u0db1'], hint: '\u0d86\u0d9a\u0dcf\u0dc1\u0dba \U0001f30c',          audio: gaganaAudio }," + NL +
    "  { word: '\u0db4\u0dc3',  letters: ['\u0db4', '\u0dc3'],      hint: '\u0dc3\u0d82\u0d9a\u0dca\u200d\u0dba\u0dcf 5 \U0001f590\ufe0f',        audio: pasaAudio   }," + NL +
    "  { word: '\u0d9a\u0da9\u0dba', letters: ['\u0d9a', '\u0da9', '\u0dba'], hint: '\u0dc0\u0dca\u200d\u0dba\u0dcf\u0db4\u0dcf\u0dbb\u0dba \U0001f3ea',      audio: kadayaAudio }," + NL +
    "  { word: '\u0db6\u0dad',  letters: ['\u0db6', '\u0dad'],      hint: '\u0d86\u0dc4\u0dcf\u0dbb \U0001f35a',            audio: bataAudio   }," + NL +
    "  { word: '\u0daf\u0dd2\u0dba',  letters: ['\u0daf', '\u0dd2', '\u0dba'],   hint: '\u0da2\u0dbd\u0dba \U0001f4a7',            audio: null        }," + NL +
    "  { word: '\u0dc3\u0dd2\u0dba',  letters: ['\u0dc3', '\u0dd2', '\u0dba'],   hint: '100 \U0001f522',              audio: null        }," + NL +
    "];"
)
print(f'WB2 found: {old_wb2 in wb}')
if old_wb2 in wb:
    wb = wb.replace(old_wb2, new_wb2, 1)
else:
    print('WB2 not found, trying partial search...')
    idx = wb.find("const WORDS = [")
    if idx >= 0:
        print(repr(wb[idx:idx+100]))

# 3. Replace speakWord function
old_wb3 = (
    "function speakWord(word, soundOn) {" + NL +
    "  if (!soundOn) return;" + NL +
    "  window.speechSynthesis.cancel();" + NL +
    "  const utt = new SpeechSynthesisUtterance(word);" + NL +
    "  utt.lang = 'si-LK';" + NL +
    "  utt.rate = 0.75;" + NL +
    "  utt.pitch = 1.1;" + NL +
    "  window.speechSynthesis.speak(utt);" + NL +
    "}"
)
new_wb3 = (
    "function speakWord(word, soundOn, audioFile) {" + NL +
    "  if (!soundOn) return;" + NL +
    "  if (audioFile) {" + NL +
    "    const audioEl = new Audio(audioFile);" + NL +
    "    audioEl.play().catch(() => {" + NL +
    "      window.speechSynthesis.cancel();" + NL +
    "      const utt = new SpeechSynthesisUtterance(word);" + NL +
    "      utt.lang = 'si-LK'; utt.rate = 0.75; utt.pitch = 1.1;" + NL +
    "      window.speechSynthesis.speak(utt);" + NL +
    "    });" + NL +
    "  } else {" + NL +
    "    window.speechSynthesis.cancel();" + NL +
    "    const utt = new SpeechSynthesisUtterance(word);" + NL +
    "    utt.lang = 'si-LK'; utt.rate = 0.75; utt.pitch = 1.1;" + NL +
    "    window.speechSynthesis.speak(utt);" + NL +
    "  }" + NL +
    "}"
)
print(f'WB3 found: {old_wb3 in wb}')
if old_wb3 in wb:
    wb = wb.replace(old_wb3, new_wb3, 1)

# 4. Update speakWord calls to pass audio
wb = wb.replace(
    "speakWord(currentWord.word, soundOn), 600",
    "speakWord(currentWord.word, soundOn, currentWord.audio), 600"
)
wb = wb.replace(
    "speakWord(w.word, soundOn), 400",
    "speakWord(w.word, soundOn, w.audio), 400"
)
wb = wb.replace(
    "onClick={() => speakWord(currentWord.word, soundOn)}",
    "onClick={() => speakWord(currentWord.word, soundOn, currentWord.audio)}"
)
print('WB4 calls updated')

with open(WB, 'wb') as f:
    f.write(wb.encode('utf-8'))
print('WordBuilder done.')
print('All changes applied.')
