// @ts-nocheck
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from "../types";
import { overrideLegacyFontsInHtml } from "./langUtils";
import { FONT_REGISTRY } from "./fontDatabase";

// Speed optimization cache to prevent heavy re-evaluation on large question banks
const normalizationCache = new Map<string, string>();

/**
 * Intelligent Central Text Normalization Engine using Auto-Language Detection Matrix
 */
export function normalizeHindiText(text: string): string {
  if (!text) return "";
  if (normalizationCache.has(text)) {
    return normalizationCache.get(text)!;
  }
  let out = text;
  
  // Exhaustive predefined list of replacements to tackle common Devanagari font import corruptions
  const preReplacements: [RegExp, string][] = [
    [/रा\.ा/g, "राणा"],
    [/धार\.(ा|ा_)/g, "धारण"],
    [/धार\./g, "धारण"],
    [/क्र\./g, "क्रमण"],
    [/ष\./g, "ष्णु"],
    [/ण्डो\./g, "ण्डोर"],
    [/→ारोला/g, "झारोला"],
    [/→ील/g, "झील"],
    [/→ालावाड़/g, "झालावाड़"],
    [/→ालावाड़/g, "झालावाड़"],
    [/दक्षि\.ी/g, "दक्षिणी"],
    [/दक्षि\./g, "दक्षिण"],
    [/माला\.ी/g, "मालाणी"],
    [/बा\.गंगा/g, "बाणगंगा"],
    [/कातंली/g, "कांतली"],
    [/को\.ागाँव/g, "कोणागाँव"],
    [/को\.ा गाँव/g, "कोणा गाँव"],
    [/म\(ह\)\s*नदी/g, "माही नदी"],
    [/म\(ह\)/g, "माही"],
    [/पठ\(र\)/g, "पठार"],
    [/शेखाव\(ट\)/g, "शेखावाटी"],
    [/काक\.व\(ड\)/g, "काकणवाड़ी"],
    [/काक\.व/g, "काकणव"],
    [/क\(ल\)बंगा/g, "कालीबंगा"],
    [/क\(ल\)बंग/g, "कालीबंगा"],
    [/मध्याषा\.काल/g, "मध्यपाषाणकाल"],
    [/साब\.ियां/g, "साबणियां"],
    [/साब\.िया/g, "साबणियां"],
    [/साब\./g, "साबण"],
    [/पुरापाषा\.काल/g, "पुरापाषाणकाल"],
    [/मृदभा\.्ड/g, "मृद्भाण्ड"],
    [/मृदभांड/g, "मृद्भाण्ड"],
    [/सिन्धु\s*घ\(ट\)/g, "सिन्धु घाटी"],
    [/घ\(ट\)/g, "घाटी"],
    [/राजध\(न\)/g, "राजधानी"],
    [/सुन\(र\)/g, "सुनारी"],
    [/यून\(न\)/g, "यूनानी"],
    [/कोठ\(र\)/g, "कोठारी"],
    [/जवाई/g, "जवाई"], // Ensure जवाई remains correct
    [/गिलू\.्ड/g, "गिलूण्ड"],
    [/र\.थम्भौर/g, "रणथम्भौर"],
    [/रणथंभौर/g, "रणथम्भौर"],
    [/आक्रम\.ों/g, "आक्रमणों"],
    [/आक्रम\./g, "आक्रमण"],
    [/म\.्डोरस/g, "मण्डोर"],
    [/म\.्डोर/g, "मण्डोर"],
    [/मुहनौत\s*नै\.सी/g, "मुहणोत नैणसी"],
    [/नै\.सी/g, "नैणसी"],
    [/कानहडदेव/g, "कान्हड़देव"],
    [/सीतलदेव/g, "शीतलदेव"],
    [/दरब\(र\)/g, "दरबार"],
    [/र\.मल/g, "रणमल"],
    [/जैत्रासिंह/g, "जैत्रसिंह"],
    [/नचनचन्द/g, "नयनचन्द"],
    [/चदरबरदाई/g, "चन्दबरदाई"],
    [/gरह\.वंशी/g, "ब्राह्मणवंशी"],
    [/ब्राह\.वंशी/g, "ब्राह्मणवंशी"],
    [/ब्राह\./g, "ब्राह्मण"],
    [/र\(न\)/g, "रानी"],
    [/जीर्\.oद्वार/g, "जीर्णोद्धार"],
    [/जीर्\.ोद्वार/g, "जीर्णोद्धार"],
    [/जीर्\./g, "जीर्ण"],
    [/से\.्ड/g, "सैण्ड"],
    [/क\(ठ\)/g, "काठी"],
    [/कुबड/g, "कूबड़"],
    [/प्रने/g, "पवनें"],
    [/सुर\(ह\)/g, "सुराही"],
    [/वीन\s*सीण\s*मिश्रा/g, "वी.सी. मिश्रा"],
    [/वीन\s*सीण/g, "वी.सी."],
    [/वी\.सी\s*मिश्रा/g, "वी.सी. मिश्रा"],
    [/बत\(य\)/g, "बताया"],
    [/हरिया\.ा/g, "हरियाणा"],
    [/नेहड/g, "नेहड़"],
    [/पोकर\./g, "पोकरण"],
    [/बुन्देलख\.्ड/g, "बुन्देलखण्ड"],
    [/ख\.्ड/g, "खण्ड"],
    [/म\.्डल/g, "मण्डल"],
    [/सम्प\s*सभा/g, "सम्प सभा"],
    [/सम्पसभा/g, "सम्प सभा"],
    [/पारत/g, "भारत"],
    // === NEW HASTILY SPOTTED CORRUPTIONS ===
    [/हैण/g, "है?"],
    [/हैंण/g, "हैं?"],
    [/घोष\.ाओं/g, "घोषणाओं"],
    [/घोष\.ा/g, "घोषणा"],
    [/अधिनियन/g, "अधिनियम"],
    [/दाधवाखारा/g, "दूधवाखारा"],
    [/दूदवा\s*खारा/g, "दूधवा खारा"],
    [/क्षोो/g, "क्षेत्र"],
    [/म़रस्थलीय/g, "मरुस्थलीय"],
    [/म़रस्थल/g, "मरुस्थल"],
    [/म़दंग/g, "मृदंग"],
    [/थाोरियम/g, "थोरियम"],
    [/बोरकु\.्ड/g, "बोरकुण्ड"],
    [/कर\.ी/g, "करणी"],
    [/अभयार\.्य/g, "अभयारण्य"],
    [/गोडाव\./g, "गोडावण"],
    [/मिश्रित\s*पत→ड़/g, "मिश्रित पतझड़"],
    [/पत→ड/g, "पतझड़"],
    [/पत→ड़/g, "पतझड़"],
    [/प\(न\)/g, "पानी"],
    [/म\(न\)\s+ज\(त\)/g, "मानी जाती"],
    [/प\(य\)\s+ज\(त\)/g, "पाई जाती"],
    [/प\(य\)\s+जंूने/g, "पाई जाने"],
    [/प\(य\)\s+जूने/g, "पाई जाने"],
    [/जूने\s+व\(ल\)/g, "जाने वाली"],
    [/जूने/g, "जाने"],
    [/व\(ल\)/g, "वाली"],
    [/फूलव\(र\)/g, "फूलवारी"],
    [/अंकाल/g, "अकाल"],
    [/प्रभB/g, "प्रभावी"],
    [/कल्ल\(ज\)/g, "कल्लाजी"],
    [/गोग\(ज\)/g, "गोगाजी"],
    [/तेज\(ज\)/g, "तेजाजी"],
    [/फत्त\(ज\)/g, "फत्ताजी"],
    [/खेतल\(ज\)/g, "खेतलाजी"],
    [/जसन\(थ\)/g, "जसनाथ"],
    [/जसन\(ध\)/g, "जसनाथ"],
    [/लालद\(स\)/g, "लालदास"],
    [/तिलवाडा/g, "तिलवाड़ा"],
    [/→ुं→ुनूँ/g, "झुंझुनू"],
    [/→ुं→ुनूं/g, "झुंझुनू"],
    [/→ुन्‍→ुन/g, "झुंझुनू"],
    [/→ुं→ुनू/g, "झुंझुनू"],
    [/→ुं→ार/g, "झुंझार"],
    [/कोटाू\s*गाँव/g, "कोलू गाँव"],
    [/कोटाू/g, "कोलू"],
    [/कोटूू\s*गाँव/g, "कोलू गाँव"],
    [/कोटूू/g, "कोलू"],
    [/पथव\(र\)/g, "पथवारी"],
    [/पूप्पा/g, "पूजा"],
    [/देवर\s*की\s*पहाड़ियाँ/g, "दिवेर की पहाड़ियाँ"],
    [/देवर\s*की\s*पहाड़ियों/g, "दिवेर की पहाड़ियों"],
    [/देब\(र\)/g, "देबारी"],
    [/पशचात़/g, "पश्चात"],
    [/अाव\(स\)य/g, "आवासीय"],
    [/आव\(स\)य/g, "आवासीय"],
    [/लापा/g, "लाभ"],
    [/गािवों/g, "गाँवों"],
    [/गािवं/g, "गाँवों"],
    [/गािव/g, "गाँव"],
    [/शाराब/g, "शराब"],
    [/दाोव़ित्ता/g, "छात्रवृत्ति"],
    [/दाोों/g, "छात्रों"],
    [/दाो/g, "छात्र"],
    [/तामश़ा/g, "तामड़ा"],
    [/शश़द/g, "उड़द"],
    [/ोतु/g, "ऋतु"],
    [/पशाुअों/g, "पशुओं"],
    [/पशाु/g, "पशु"],
    [/पाौगोलिक/g, "भौगोलिक"],
    [/द़िष्ल्को\.ा/g, "दृष्टिकोण"],
    [/द़िष्ल्/g, "दृष्टि"],
    [/जलापातर्िकी/g, "जलापूर्ति की"],
    [/जलापातर्ि/g, "जलापूर्ति"],
    [/पावर्ी/g, "पूर्वी"],
    [/पिशाचम/g, "पश्चिम"],
    [/पishचम/g, "पश्चिम"],
    [/पिशचम/g, "पश्चिम"],
    [/अोिशशाा/g, "ओडिशा"],
    [/अान्धव/g, "आंध्र"],
    [/अावश्यकताअों/g, "आवश्यकताओं"],
    [/अावश्यक/g, "आवश्यक"],
    [/अावेदन/g, "आवेदन"],
    [/अाधार/g, "आधार"],
    [/अाधारभूत/g, "आधारभूत"],
    [/अाधारभूूत/g, "आधारभूत"],
    [/अाहात/g, "आहूत"],
    [/अाजीविका/g, "आजीविका"],
    [/अाबा/g, "आबू"],
    [/अादि/g, "आदि"],
    [/अापदा/g, "आपदा"],
    [/गवामों/g, "ग्रामों"],
    [/गवाम/g, "ग्राम"],
    [/शाासन/g, "शासन"],
    [/शाासक/g, "शासक"],
    [/शाासकों/g, "शासकों"],
    [/िशाकायत/g, "शिकायत"],
    [/िशाकायतों/g, "शिकायतों"],
    [/िØयान्वित/g, "क्रियान्वित"],
    [/िØयान्वयन/g, "क्रियान्वयन"],
    [/िØया/g, "क्रिया"],
    [/वक्षावरण/g, "वृक्षावरण"],
    [/व़क्षा/g, "वृक्ष"],
    [/व़िक्ष/g, "वृक्ष"],
    [/व़ि\)/g, "वृद्धि"],
    [/व़द्घि/g, "वृद्धि"],
    [/व़द्वि/g, "वृद्धि"],
    [/व़क्षों/g, "वृक्षों"],
    [/व़क्ष/g, "वृक्ष"],
    [/व़क्षावरण/g, "वृक्षावरण"],
    [/वैद्यानिक/g, "वैधानिक"],
    [/त्रबु→/g, "बुज"],
    [/→ीलड्ड/g, "झील”"],
    [/ड्ड/g, "”"],
    [/त्र/g, "“"],
    [/बोथ्शर/g, "बोल्डर"],
    [/अले/g, "क्ले"]
  ];

  for (const [regex, replacement] of preReplacements) {
    out = out.replace(regex, replacement);
  }

  // =========================================================================
  // AUTO-LANGUAGE DETECTOR: Scan document layout footprint clusters
  // =========================================================================
  let targetConfig = FONT_REGISTRY.kruti_dev_lys; // Standard fallback engine configuration

  const textStr = String(text);
  if (textStr.includes("ोोचत्वज्ोैज्त्ो") || textStr.includes("परु") || textStr.includes("चि%") || /पए\s+पपए/i.test(textStr)) {
    targetConfig = FONT_REGISTRY.kruti_dev_lys;
  } else if (textStr.includes("¿") || textStr.includes("¡")) {
    // Structural footprints context mapping can route to chanakya or shivaji extensions smoothly
    // targetConfig = FONT_REGISTRY.chanakya;
  }

  // =========================================================================
  // EXECUTION PIPELINE LAYER
  // =========================================================================

  // Step 1: Run Word Exception mappings first to preserve complex overlapping definitions securely
  for (const [key, value] of Object.entries(targetConfig.wordExceptions)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escapedKey, 'g'), value);
  }

  // Step 2: CONTEXTUAL REGEX: Dynamic Trailing Dot Cleaner
  // Safe-guard: Maps dot '.' to 'ण' ONLY when immediately adjacent to Devanagari character bounds
  out = out.replace(/([\u0900-\u097F])\.(?=\s|$)/g, "$1ण");
  out = out.replace(/([\u0900-\u097F]+)\(([लटतधड़रषनशडह])\)/g, (match, word, char) => {
    if (char === 'ल') return word + 'ली';
    if (char === 'ट') return word + 'टी';
    if (char === 'ध') return word + 'धी';
    if (char === 'त') return word + 'ती';
    if (char === 'ड़') return word + 'ड़ी';
    if (char === 'र') return word + 'री';
    if (char === 'न') return word + 'नी';
    if (char === 'ड') return word + 'ड़ी';
    if (char === 'ह') return word + 'ही';
    return word + char;
  });

  out = out.replace(/\(\s*\)/g, "");
  out = out.replace(/([\u0900-\u097F])-\([a-zA-Z0-9अ-ह]+\)ए/g, "$1");
  out = out.replace(/([\u0900-\u097F])\)ए/g, "$1");

  // Step 3: CONTEXTUAL REGEX: Universal Financial Numerical Comma Safe-Guard Fixer
  // Safe-guard: Checks bounds to convert 'ए' into comma ',' ONLY between numerical digits (e.g., 30ए400 -> 30,400)
  out = out.replace(/(\d+)ए(\d+)/g, "$1,$2");
// Custom regex pattern to target single hanging arrow tokens gracefully
  out = out.replace(/→/g, "झ");
  // Step 4: CONTEXTUAL REGEX: Universal Mathematical Ratio/Colon Safe-Guard Fixer
  // Safe-guard: Checks bounds to convert 'रू' into colon ':' ONLY between numerical digits (e.g., 2रू3 -> 2:3)
  out = out.replace(/(\d+)रू(\d+)/g, "$1:$2");

  // Step 5: Global Root Substring replacements setup mapping execution
  for (const [key, value] of Object.entries(targetConfig.rootSubMappings)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escapedKey, 'g'), value);
  }

  // Step 6: Dynamic Fallback Character Core replacements execution
  for (const [key, value] of Object.entries(targetConfig.dynamicFallbackSymbols)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escapedKey, 'g'), value);
  }

  // Corrupted formatting option markers/match-codes layout processing block
  out = out.replace(/।-?\s?\(?पपप\)?[ए]?\s?/g, "A-iii, ");
  out = out.replace(/।-?\(?पप\)?[ए]?\s?/g, "A-ii, ");
  out = out.replace(/।-?\(?प\)?[ए]?\s?/g, "A-i, ");
  out = out.replace(/इ-?\s?\(?पपप\)?[ए]?\s?/g, "B-iii, ");
  out = out.replace(/इ-?\(?पप\)?[ए]?\s?/g, "B-ii, ");
  out = out.replace(/इ-?\(?प\)?[ए]?\s?/g, "B-i, ");
  out = out.replace(/ब-?\s?\(?पपप\)?[ए]?\s?/g, "C-iii, ");
  out = out.replace(/ब-?\(?पप\)?[ए]?\s?/g, "C-ii, ");
  out = out.replace(/ब-?\(?प\)?[ए]?\s?/g, "C-i, ");

  out = out.replace(/।-([१२३४५६७८९०0-9]+)ए?\s?/g, "A-$1, ");
  out = out.replace(/इ-([१२३४५६७८९०0-9]+)ए?\s?/g, "B-$1, ");
  out = out.replace(/ब-([१२३४५६७८९०0-9]+)ए?\s?/g, "C-$1, ");
  out = out.replace(/अ-([१२३४५६७८९०0-9]+)ए?\s?/g, "D-$1, ");
  out = out.replace(/य-([१२३४५६७८९०0-9]+)ए?\s?/g, "E-$1, ");
  
  out = out.replace(/(^|\s)।\.\s/g, "$1A. ");
  out = out.replace(/(^|\s)इ\.\s/g, "$1B. ");
  out = out.replace(/(^|\s)ब\.\s/g, "$1C. ");
  out = out.replace(/(^|\s)अ\.\s/g, "$1D. ");

  out = out.replace(/ा(\d+)ी/g, "($1)");
  out = out.replace(/ा([A-Za-z]+)ी/g, "($1)");
  out = out.replace(/ा([अ-ह]़?)ी/g, "($1)");
  out = out.replace(/ा([अ-ह]़?[A-Za-z0-9\s]+)ी/g, "($1)"); 
  
  out = out.replace(/(\d+)\.\s?।\s/g, "$1. I ");
  out = out.replace(/(\d+)\.\s?॥\s/g, "$1. II ");
  out = out.replace(/\s?।\s?-\s?\((प+य?)\)/g, " - ($1)");
  out = out.replace(/\((प+य?)\)ए\s/g, "($1), ");
  out = out.replace(/ध्\([१२३४५६७८९०0-9]\)/g, "");

  // Translation mapping array for Hindi numbers sequence standard notation
  const digitMap: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  for (const [hindi, english] of Object.entries(digitMap)) {
    out = out.replace(new RegExp(hindi, 'g'), english);
  }

  out = out.replace(/(\d)\.(\d)/g, "$1.$2");
  out = out.replace(/(\d)%/g, "$1%");
  out = out.replace(/([0-9])\.([0-9])\./g, "$1.$2");
  out = out.replace(/\.त्र/g, "%");
  out = out.replace(/ण(\d)/g, ".$1"); 
  out = out.replace(/(\d)त्र/g, "$1%");
  
  out = out.replace(/झ/g, "→");
  out = out.replace(/\(प\)/g, "(i)");
  out = out.replace(/\(पप\)/g, "(ii)");
  out = out.replace(/\(पपप\)/g, "(iii)");
  out = out.replace(/\(पअ\)/g, "(iv)");
 
  // =========================================================================
  // UNIVERSAL SANITIZATION PURGE: Auto-clears lingering fragments safely
  // =========================================================================
  out = out.replace(/ोोचत्वज्ोैज्त्ो\d*ोो/g, "");
  out = out.replace(/\dोो/g, "");
  out = out.replace(/ोोचत्वज्ोैज्त्ो/g, "");
  out = out.replace(/[अबम्]-\([a-z0-9A-Zअ-ह]+\)ए/g, "");
  out = out.replace(/[अबम्]\)ए/g, "");
  out = out.replace(/\(\s*\)/g, ""); // Dynamic standalone bracket layout cleaner

  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/,\s*,/g, ", ");
  out = out.replace(/,\s*$/g, "");
  
  const result = out.trim();
  normalizationCache.set(text, result);
  return result;
}

function isLikelyEnglish(text: string): boolean {
  if (!text) return false;
  // If it has standard English words
  const englishWords = /\b(the|and|is|of|on|in|to|not|which|select|correct|incorrect|both|only|neither|nor|passes|through|district|region|of|was|were|called|by|who|which)\b/i;
  if (englishWords.test(text)) return true;
  // Also Koppen climate region codes or pure English/symbols
  if (/^[a-zA-Z0-9\s\-\.\,\/\(\)\:\'\"]+$/.test(text)) {
    if (text.length < 25) return true;
    if (/[aeiou]{2,}/i.test(text)) {
      const spaceCount = (text.match(/\s/g) || []).length;
      if (spaceCount > 0) {
        return true;
      }
    }
  }
  return false;
}

function convertHtmlWithDevLys(text: string): string {
  if (!text) return "";
  
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length; 
  if (devanagariCount > text.length * 0.05) return normalizeHindiText(text);

  if (isLikelyEnglish(text)) {
    return text;
  }

  const protectedStrings: string[] = [];
  let workingText = text.replace(/\[IMAGE: [^\]]+\]/g, (match) => {
    protectedStrings.push(match);
    return ` __PROT_STR_${protectedStrings.length - 1}__ `;
  });

  const optionCodesRegex = /[A-Ea-e]\s*[-=:]\s*[0-9](?:[\s,]*[A-Ea-e]\s*[-=:]\s*[0-9])*/g;
  workingText = workingText.replace(optionCodesRegex, (match) => {
    protectedStrings.push(match.toUpperCase());
    return ` __PROT_STR_${protectedStrings.length - 1}__ `;
  });

  const listRegex = /(^|\s)([\(\[]?)([A-Ea-e])([\.\):\]])(?=\s|$)/g;
  workingText = workingText.replace(listRegex, (match, p1, p2, p3, p4) => {
    protectedStrings.push(`${p1}${p2}${p3.toUpperCase()}${p4}`);
    return ` __PROT_STR_${protectedStrings.length - 1}__ `;
  });

  const char_mapping: { [key: string]: string } = {
    "a": "ं", "b": "व", "c": "ब", "d": "क", "e": "म", "f": "ि", "g": "ह", "h": "ी", "i": "प", "j": "र", "k": "ा", "l": "स", "m": "श", "n": "द", "o": "व", "p": "च", "q": "ु", "r": "त", "s": "े", "t": "ज", "u": "न", "v": "अ", "w": "ा", "x": "ग", "y": "ल", "z": "व",
    "A": "।", "B": "इ", "C": "ब", "D": "अ", "E": "म्", "F": "थ", "G": "ह", "H": "प", "I": "प", "J": "च", "K": "ा", "L": "स्", "M": "श", "N": "द", "O": "व", "P": "च", "Q": "फ", "R": "त्", "S": "ै", "T": "ज्", "U": "न्", "V": "ल्", "W": "ड", "X": "क्ष", "Y": "थ्", "Z": "र्",
    "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
    "[": "ख्", "]": "comma", "{": "क्ष", "}": "ज्ञ", "(": "(", ")": ")", "=": "¾", "+": "़", " ": " ",
    "&": "द", "*": "ड्ड", "/": "ध्", ";": "य", ":": "रू", "'": "श", "\"": "ष्", ",": "ए", ".": "ण", "<": "ढ़", ">": "झ", "?": "घ",
    "@": "ा", "#": "्र", "$": "रु", "%": "त्र", "^": "त्र", "_": "ो", "`": "़", "~": "़",
    "¼": "ा", "½": "ी", "¾": "ो", "Ù": "त्त", "ù": "ु", "ú": "ू", "û": "ृ", "ü": "े", "ý": "ै", "þ": "ो", "ÿ": "ौ",
    "ª": "ि", "«": "ी", "¬": "ा", "®": "ि", "¯": "ी", "à": "ा", "|": "।", "¡": "ि", "¢": "ी"
  };

  let str = workingText;
  str = str.replace(/f([A-Z\/\*\[\{]*)([a-z\]\}\<\>\?\/&;:=])/g, "$1$2f");
  str = str.replace(/([a-z\]\}\<\>\?\/&;:=])Z/g, "Z$1"); 
  str = str.replace(/([A-Z\/\*\[\{]+)([a-z\]\}\<\>\?\/&;:=])Z/g, "Z$1$2"); 
  
  let output = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (char_mapping[c]) {
      output += char_mapping[c];
    } else if (c === "Z") {
      output += "र्";
    } else {
      output += c;
    }
  }

  output = output.replace(/ाे/g, "ो");
  output = output.replace(/ाै/g, "ौ");
  output = output.replace(/ेे/g, "े");
  output = output.replace(/ैै/g, "ै");
  output = output.replace(/्ा/g, "");
  output = output.replace(/comma/g, ",");

  protectedStrings.forEach((str, i) => {
    output = output.replace(`__PROT_STR_${i}__`, str);
  });

  const normalizations: {[key: string]: string} = {
    "कथान": "कथन", "असतय": "असत्य", "पवशन": "प्रश्न", "अनुत्तारति": "अनुत्तरित",
    "िपर": "पर", "नदप": "नदी", "कनारे": "किनारे", "वश़ा": "बड़ा", "पाागश़ा": "पायरा",
    "दोलप": "दोली", "पयारप": "प्यारी", "हैद": "है।", "गमतप": "गोमती", "अवस्थाति": "अवस्थित",
    "नकालपिगयप": "निकाली गई", " नम्र": " निम्न", "असत्य कथन": "असत्य कथन", "संचावर्ि": "सिंचाई"
  };

  for (const [key, value] of Object.entries(normalizations)) {
    output = output.replace(new RegExp(key, 'g'), value);
  }

  output = output.replace(/ि /g, "ि");
  output = output.replace(/ ् /g, "्");
  output = output.replace(/् /g, "्");
  output = output.replace(/ा े/g, "ो");
  output = output.replace(/ा ै/g, "ौ");
  
  return normalizeHindiText(output);
}

function classifyTextSubject(text: string): string {
  const content = text.toLowerCase();
  const rules = [
    { sub: "Rajasthan GK", keywords: ["राजस्थान", "जयपुर", "जोधपुर", "उदयपुर", "अरावली", "मेवाड़", "मारवाड़", "लूनी", "बनास", "झील", "बावड़ी", "गढ़", "सांगा", "कुम्भा", "प्रताप", "बीकानेर", "कोटा", "भरतपुर", "अलवर"] },
    { sub: "Geography", keywords: ["नदी", "पर्वत", "पहाड़", "जलवायु", "मानसून", "मिट्टी", "वनस्पति", "वन्यजीव", "अभयारण्य", "पठार", "मरुस्थल", "महासागर", "द्वीप", "भूकंप", "ज्वालामुखी"] },
    { sub: "History", keywords: ["शासक", "युद्ध", "अभिलेख", "सभ्यता", "शिलालेख", "आंदोलन", "क्रांति", "स्वतंत्रता", "रियासत", "मुगल", "अंग्रेज", "सल्तनत", "मौर्य", "गुप्त"] },
    { sub: "Polity", keywords: ["विधानसभा", "राज्यपाल", "मुख्यमंत्री", "पंचायत", "नगरपालिका", "अनुच्छेद", "संविधान", "लोकसभा", "राज्यसभा", "राष्ट्रपति", "प्रधानमंत्री", "न्यायालय", "अधिकार"] },
    { sub: "Culture", keywords: ["मेला", "त्यौहार", "नृत्य", "वाद्य", "मंदिर", "वेशभूषा", "कला", "साहित्य", "अकादमी", "गीत", "लोकनृत्य", "दुर्ग", "छतरी", "हवेली"] },
    { sub: "General Science", keywords: ["विटामिन", "कोशिका", "तत्व", "ऊर्जा", "प्रकाश", "ध्वनि", "मानव", "रोग", "पौधे", "धातु", "अधातु"] }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => content.includes(k))) return rule.sub;
  }
  return "General Studies";
}

export function stripHtmlToText(html: string): string {
  if (!html) return "";
  let text = String(html);
  
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<\/td>/gi, " \t ");
  text = text.replace(/<\/th>/gi, " \t ");
  text = text.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, " [IMAGE: $1] ");
  text = text.replace(/<\/?(?:div|p|ul|ol|li|br|h1|h2|h3|h4|h5|h6|section|article|header|footer)[^>]*>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  
  text = text.replace(/&nbsp;/ig, " ");
  text = text.replace(/&lt;/ig, "<");
  text = text.replace(/&gt;/ig, ">");
  text = text.replace(/&amp;/ig, "&");
  text = text.replace(/&quot;/ig, '"');
  text = text.replace(/&#39;/ig, "'");
  text = text.replace(/&mdash;/ig, "-");
  text = text.replace(/&ndash;/ig, "-");
  text = text.replace(/comma/g, ",");
  text = text.replace(/&lsquo;/ig, "'");
  text = text.replace(/&rsquo;/ig, "'");
  text = text.replace(/&ldquo;/ig, '"');
  text = text.replace(/&rdquo;/ig, '"');
  
  text = text.split('\n').map(line => line.trim()).filter(line => line !== '').join('\n');
  return text.trim();
}

function findMatchingOptionIndex(options: string[], answerText: string): number {
  if (!answerText) return -1;
  const cleanAns = stripHtmlToText(answerText).toLowerCase().trim();
  
  // 1. Exact match
  let idx = options.findIndex(o => stripHtmlToText(o).toLowerCase().trim() === cleanAns);
  if (idx !== -1) return idx;
  
  // 2. Contains match (meaningful length)
  if (cleanAns.length > 2) {
    idx = options.findIndex(o => {
       const cleanO = stripHtmlToText(o).toLowerCase().trim();
       if (!cleanO) return false;
       return cleanO.includes(cleanAns) || cleanAns.includes(cleanO);
    });
    if (idx !== -1) return idx;
  }
  
  // 3. Fallback to basic character keys
  const char = answerText.trim().toUpperCase();
  if (char === 'A' || char === '1' || char === 'अ' || char === 'क') return 0;
  if (char === 'B' || char === '2' || char === 'ब' || char === 'ख') return 1;
  if (char === 'C' || char === '3' || char === 'स' || char === 'ग') return 2;
  if (char === 'D' || char === '4' || char === 'द' || char === 'घ') return 3;
  if (char === 'E' || char === '5' || char === 'य' || char === 'ङ') return 4;

  return -1;
}

function extractAnswerIndexFromJsonItem(item: any, options: string[]): number {
  if (!item) return 0;
  
  // Potential index fields (0-based)
  const indexKeys = ['correctAnswerIndex', 'answerIndex', 'correct_answer_index', 'answer_index', 'correct_idx', 'answerIdx'];
  for (const key of indexKeys) {
    if (item[key] !== undefined && item[key] !== null) {
       const val = Number(item[key]);
       if (!isNaN(val)) return val;
    }
  }

  // Potential value fields (1-based numbers, letters, or string matches)
  const valKeys = ['correctAnswer', 'answer', 'correct_answer', 'correct', 'Answer', 'CorrectAnswer', 'Ans', 'ans'];
  for (const key of valKeys) {
    if (item[key] !== undefined && item[key] !== null) {
       const val = item[key];
       if (typeof val === 'number') {
          if (val === 0) return 0; // If they literally put 0, assume it's 0-based
          return val - 1; // Assuming 1-based if it's a number like 1, 2, 3, 4
       }
       if (typeof val === 'string') {
          const oIdx = findMatchingOptionIndex(options, val);
          if (oIdx !== -1) return oIdx;

          // If it looks like a clean number but didn't match (e.g. a higher number index)
          const num = Number(val);
          if (!isNaN(num) && val.trim() !== '') {
             if (num === 0) return 0;
             return num - 1;
          }
       }
    }
  }
  return 0; // Default fallback
}

export async function parseUniversalHTML(htmlString: string, targetExam: string): Promise<Question[]> {
  const questions: Question[] = [];
  if (!htmlString) return questions;

  const isValidParsedQuestion = (qText: string): boolean => {
    if (!qText) return false;
    let cleanQ = qText.replace(/[\n\r]+/g, ' ').trim();
    
    // Remove "Question X:" prefix if it exists before checking for garbage length
    cleanQ = cleanQ.replace(/^(?:Question|Q)\s*[0-9]+[:.\-]?\s*/i, "");
    
    if (cleanQ.length < 5) return false;
    
    const lowerQ = cleanQ.toLowerCase();
    
    // Explicit blacklist of standard UI text from test websites
    const garbagePrefixes = [
      "samyak", "instructions", "this test contains", "each question has only",
      "you will have", "questions have different marks", "click on the option to",
      "you can mark questions", "you can navigate between", "click \"submit\"",
      "test results", "score", "time taken", "avg time", "positive marks", 
      "negative marks", "detailed breakdown", "leave test", "your progress will be lost",
      "confirm submission", "you have attempted", "options:", "correct answer:",
      "start test", "join channel", "contact admin", "question navigation",
      "take again", "review test", "eo-ro administrative", "questions navigation"
    ];
    
    for (const g of garbagePrefixes) {
      if (lowerQ === g || lowerQ.startsWith(g) || lowerQ.includes(g)) return false;
    }
    
    // Pattern matching for typical garbage strings (e.g. "120 Questions\n120 Total Marks")
    if (/^[0-9\s]*(?:questions|total marks|min\s*duration|duration|unattempted|marked for review|incorrect answers|correct answers|attempted|%|accuracy)/i.test(lowerQ)) {
      return false;
    }

    // specific strict checking for small strings
    if (cleanQ.length < 20 && (/^[0-9]+$/i.test(cleanQ) || /^(?:Option|Question)\s+[0-9]+$/i.test(cleanQ))) {
      return false;
    }
    
    return true;
  };

  try {
    // Execution pipeline string cleanup before document element traversal begins
    const cleanedHtmlInput = normalizeHindiText(htmlString);

    // 0. CHECK FOR EMBEDDED JSON SCRIPT DATA OR REMOTE JSON_URL
    const jsonUrlMatch = cleanedHtmlInput.match(/const\s+JSON_URL\s*=\s*["']([^"']+)["']/i);
    if (jsonUrlMatch && jsonUrlMatch[1]) {
      try {
        const response = await fetch(jsonUrlMatch[1]);
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          const itemsArray = Array.isArray(items) ? items : [];
          return itemsArray.map((q: any, i: number) => {
            const options: string[] = [];
            for (let j = 1; j <= 10; j++) {
              const opt = q[`option_${j}`] || q[`option${j}`] || q[`opt${j}`];
              if (opt && String(opt).trim() !== "") {
                options.push(stripHtmlToText(String(opt)));
              }
            }
            while (options.length < 4) options.push(`Option ${options.length + 1}`);
            let correctIdx = extractAnswerIndexFromJsonItem(q, options);
            if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= Math.max(1, options.length)) {
              correctIdx = 0;
            }
            const qText = stripHtmlToText(q.question || q.text || "");
            const expText = stripHtmlToText(q.solution || q.explanation || q.solution_text || "No explanation provided.");
            
            return {
              id: `remote-json-${Date.now()}-${i}-${Math.random().toString(36).substring(4)}`,
              questionText: overrideLegacyFontsInHtml(convertHtmlWithDevLys(qText)),
              options: options.map(opt => overrideLegacyFontsInHtml(convertHtmlWithDevLys(opt))),
              correctAnswerIndex: correctIdx,
              explanation: overrideLegacyFontsInHtml(convertHtmlWithDevLys(expText)),
              subject: q.subject || targetExam || "General",
              topic: q.topic || "",
              subtopic: q.concept || "",
              difficulty: "Medium",
              sourceType: "embedded-json",
              timesAnswered: 0,
              timesCorrect: 0,
              targetExam: targetExam
            };
          }).filter((q: Question) => isValidParsedQuestion(q.questionText));
        }
      } catch (err) {
        console.warn("Failed to fetch remote JSON:", err);
      }
    }

    let jsonMatchStartIndex = -1;
    const regexMatch = cleanedHtmlInput.match(/const\s+QUESTIONS\s*=/i);
    if (regexMatch && regexMatch.index !== undefined) {
      jsonMatchStartIndex = regexMatch.index + regexMatch[0].length;
    }
    
    if (jsonMatchStartIndex !== -1) {
      let openBrackets = 0, arrayText = "", started = false, inString = false, escapeNext = false;
      for (let i = jsonMatchStartIndex; i < cleanedHtmlInput.length; i++) {
         const char = cleanedHtmlInput[i];
         if (!escapeNext && char === '"') inString = !inString;
         if (!inString && char === '[') { openBrackets++; started = true; }
         if (!inString && char === ']') openBrackets--;
         escapeNext = char === '\\' && !escapeNext;
         arrayText += char;
         if (started && openBrackets === 0) break;
      }
      
      try {
        const parsedJson = JSON.parse(arrayText.trim());
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
          return parsedJson.map((q: any, i: number) => {
            const options: string[] = [];
            for (let j = 1; j <= 10; j++) {
              const val = q[`option_${j}`] || q[`option${j}`];
              if (val && String(val).trim() !== "") options.push(stripHtmlToText(String(val)));
            }
            while (options.length < 4) options.push(`Option ${options.length + 1}`);
            let correctIdx = extractAnswerIndexFromJsonItem(q, options);
            if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= Math.max(1, options.length)) {
              correctIdx = 0;
            }
            return {
              id: `json-${Date.now()}-${i}-${Math.random().toString(36).substring(4)}`,
              questionText: overrideLegacyFontsInHtml(convertHtmlWithDevLys(stripHtmlToText(q.question || ""))),
              options: options.map(opt => overrideLegacyFontsInHtml(convertHtmlWithDevLys(opt))),
              correctAnswerIndex: correctIdx,
              explanation: overrideLegacyFontsInHtml(convertHtmlWithDevLys(stripHtmlToText(q.solution_text || q.explanation || "No explanation provided."))),
              subject: q.subject || targetExam || "General",
              topic: q.topic || "",
              subtopic: q.concept || "",
              difficulty: "Medium",
              sourceType: "embedded-json",
              timesAnswered: 0,
              timesCorrect: 0,
              targetExam: targetExam
            };
          });
        }
      } catch (err) {
        console.error("Failed to parse embedded JSON:", err);
      }
    }

    const stylesFound: string[] = [];
    const styleMatches = cleanedHtmlInput.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
    if (styleMatches) {
      styleMatches.forEach((s) => { if (!stylesFound.includes(s)) stylesFound.push(s); });
    }

    const cleanTextOnly = (html: string): string => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    const cleanQuestionPreamble = (qText: string): string => {
      if (!qText) return "";
      const lines = qText.split(/\r?\n/);
      const cleanedLines: string[] = [];
      let foundActualQuestionStart = false;

      for (let line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          if (cleanedLines.length > 0) cleanedLines.push(line);
          continue;
        }
        if (!foundActualQuestionStart) {
          const lower = trimmedLine.toLowerCase();
          if (
            lower.includes("still there are error") || lower.includes("parsed successfully") ||
            lower.includes("here is") || lower.includes("create this type of") ||
            lower.includes("pasted below") || lower.includes("mcq to parse") ||
            lower.includes("following question") || lower.includes("please parse") ||
            lower.includes("fix the parser") || lower.includes("the current mcq") ||
            (trimmedLine.length < 120 && /^(still|error|parsing|parse|here|create|type|test|hi|hello|hey|assist|solve|this|correct|wrong|bad|good)\b/i.test(trimmedLine) && !trimmedLine.includes("?"))
          ) continue;
          foundActualQuestionStart = true;
        }
        cleanedLines.push(line);
      }
      return cleanedLines.join("\n").trim();
    };

    const findOptionEndIndex = (html: string, startIndex: number, limit: number): number => {
      const remnant = html.substring(startIndex, limit);
      const closeMatch = remnant.match(/<\/(?:p|div|span|b|font)>\s*/i);
      if (closeMatch && closeMatch.index !== undefined) return startIndex + closeMatch.index + closeMatch[0].length;
      
      const firstNonWhitespaceMatch = remnant.match(/[^\s\r\n]/);
      if (firstNonWhitespaceMatch && firstNonWhitespaceMatch.index !== undefined) {
        const contentRemnant = remnant.substring(firstNonWhitespaceMatch.index);
        const nlIdx = contentRemnant.indexOf("\n");
        if (nlIdx !== -1) return startIndex + firstNonWhitespaceMatch.index + nlIdx + 1;
      } else {
        const nlIdx = remnant.indexOf("\n");
        if (nlIdx !== -1) return startIndex + nlIdx + 1;
      }
      return limit;
    };

    // DOM LAYOUT TRAVERSAL SCANNER LAYER
    const textNodeQuestions: Question[] = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedHtmlInput, "text/html");
      const textNodes: { node: Text; text: string; parent: HTMLElement }[] = [];
      const walk = doc.createTreeWalker(doc.body || doc, NodeFilter.SHOW_TEXT, null);
      let node;
      while (node = walk.nextNode()) {
        if ((node.nodeValue || "").trim()) {
          textNodes.push({ node: node as Text, text: node.nodeValue || "", parent: node.parentElement as HTMLElement });
        }
      }

      const optARegex = /^\s*(?:[\(\[\\{]?A[\)\]\\}][\s\.\-\:]*|A[\.\-\:]+\s*|A\s*$)/i;
      const optBRegex = /^\s*(?:[\(\[\\{]?B[\)\]\\}][\s\.\-\:]*|B[\.\-\:]+\s*|B\s*$)/i;
      const optCRegex = /^\s*(?:[\(\[\\{]?C[\)\]\\}][\s\.\-\:]*|C[\.\-\:]+\s*|C\s*$)/i;
      const optDRegex = /^\s*(?:[\(\[\\{]?D[\)\]\\}][\s\.\-\:]*|D[\.\-\:]+\s*|D\s*$)/i;
      const optERegex = /^\s*(?:[\(\[\\{]?E[\)\]\\}][\s\.\-\:]*|E[\.\-\:]+\s*|E\s*$)/i;

      const isOptionEMarker = (text: string): boolean => {
        const clean = text.trim().toLowerCase();
        if (optERegex.test(text)) return true;
        return clean.includes("अनुत्तरित") || clean.includes("unanswered") || clean.includes("vuqùkfjr") || clean.includes("vuqÙkfjr");
      };

      interface ScannedMarker { type: "A" | "B" | "C" | "D" | "E"; nodeIndex: number; matchLength: number; text: string; parent: HTMLElement; }
      const markers: ScannedMarker[] = [];
      for (let i = 0; i < textNodes.length; i++) {
        const text = textNodes[i].text;
        if (optARegex.test(text)) markers.push({ type: "A", nodeIndex: i, matchLength: text.match(optARegex)?.[0].length || 0, text, parent: textNodes[i].parent });
        else if (optBRegex.test(text)) markers.push({ type: "B", nodeIndex: i, matchLength: text.match(optBRegex)?.[0].length || 0, text, parent: textNodes[i].parent });
        else if (optCRegex.test(text)) markers.push({ type: "C", nodeIndex: i, matchLength: text.match(optCRegex)?.[0].length || 0, text, parent: textNodes[i].parent });
        else if (optDRegex.test(text)) markers.push({ type: "D", nodeIndex: i, matchLength: text.match(optDRegex)?.[0].length || 0, text, parent: textNodes[i].parent });
        else if (isOptionEMarker(text)) {
          let mLen = text.match(optERegex)?.[0].length || text.match(/^\s*(?:vuqÙkfjr\s*iz'u|vuqùkfjr\s*iz'u|अनुत्तरित\s*प्रश्न)/i)?.[0].length || 0;
          markers.push({ type: "E", nodeIndex: i, matchLength: mLen, text, parent: textNodes[i].parent });
        }
      }

      const aMarkers = markers.filter(m => m.type === "A");
      let lastQuestionEndNodeIdx = 0;

      for (let i = 0; i < aMarkers.length; i++) {
        const currentA = aMarkers[i], nextA = aMarkers[i + 1];
        const limitNodeIdx = nextA ? nextA.nodeIndex : textNodes.length;
        const group = markers.filter(m => m.nodeIndex > currentA.nodeIndex && m.nodeIndex < limitNodeIdx);
        const currentB = group.find(m => m.type === "B");
        const currentC = group.find(m => m.type === "C" && (!currentB || m.nodeIndex > currentB.nodeIndex));
        const currentD = group.find(m => m.type === "D" && (!currentC || m.nodeIndex > currentC.nodeIndex));
        const currentE = group.find(m => m.type === "E" && (!currentD || m.nodeIndex > currentD.nodeIndex));

        if (currentB && currentC && currentD) {
          const extractRangeHtml = (startM: ScannedMarker, endM: ScannedMarker | undefined, limIdx: number): string => {
            const startIdx = startM.nodeIndex, endIdx = endM ? endM.nodeIndex : limIdx;
            if (startM.parent === (endM ? endM.parent : null)) {
              const p = startM.parent.innerHTML, sOff = p.indexOf(startM.text), eOff = endM ? p.indexOf(endM.text) : p.length;
              if (sOff !== -1 && eOff !== -1 && eOff > sOff) return p.substring(sOff + startM.matchLength, eOff).trim();
            }
            let htmlParts: string[] = [], processed = new Set<HTMLElement>();
            for (let idx = startIdx; idx < endIdx; idx++) {
              const parent = textNodes[idx].parent;
              if (!processed.has(parent)) {
                processed.add(parent);
                let part = parent.innerHTML;
                if (idx === startIdx) {
                  const off = part.indexOf(startM.text);
                  part = off !== -1 ? part.substring(off + startM.matchLength) : part.replace(/^\s*[\(\[\\{]?[A-E][\)\]\\}]?[\s\.\-\:]*/i, "");
                }
                if (endM && idx === endIdx - 1) { const off = part.indexOf(endM.text); if (off !== -1) part = part.substring(0, off); }
                htmlParts.push(part.trim());
              }
            }
            return htmlParts.join(" ");
          };

          const extractQuestionHtml = (startIdx: number, aM: ScannedMarker): string => {
            let parts: string[] = [], processed = new Set<HTMLElement>();
            for (let idx = startIdx; idx < aM.nodeIndex; idx++) {
              const p = textNodes[idx].parent;
              if (!processed.has(p)) { processed.add(p); let prt = p.innerHTML; if (idx === aM.nodeIndex - 1) { const off = prt.indexOf(aM.text); if (off !== -1) prt = prt.substring(0, off); } parts.push(prt.trim()); }
            }
            return parts.join(" ");
          };

          const rawQ = extractQuestionHtml(lastQuestionEndNodeIdx, currentA);
          const rawA = extractRangeHtml(currentA, currentB, limitNodeIdx);
          const rawB = extractRangeHtml(currentB, currentC, limitNodeIdx);
          const rawC = extractRangeHtml(currentC, currentD, limitNodeIdx);
          let rawD = currentE ? extractRangeHtml(currentD, currentE, limitNodeIdx) : extractRangeHtml(currentD, undefined, limitNodeIdx);
          let rawE = currentE ? extractRangeHtml(currentE, undefined, limitNodeIdx) : "";

          const qParsed = stripHtmlToText(cleanQuestionPreamble(rawQ));
          const options = [stripHtmlToText(rawA), stripHtmlToText(rawB), stripHtmlToText(rawC), stripHtmlToText(rawD)].filter(Boolean);
          if (rawE) options.push(stripHtmlToText(rawE));
          while (options.length < 4) options.push(`Option ${options.length + 1}`);

          let correctIdx = 0;
          let blockText = "";
          for (let idx = currentA.nodeIndex; idx < limitNodeIdx; idx++) blockText += " " + textNodes[idx].text;
          const ansMatch = cleanTextOnly(blockText).match(/(?:Ans|Answer|Correct|Key|उत्तर|सही उत्तर|सही विकल्प)[\s\.\-\:]*(.*)/i);
          if (ansMatch) {
            const val = ansMatch[1].trim();
            const upperVal = val.substring(0, 1).toUpperCase();
            if (["A", "1", "अ", "क"].includes(upperVal)) correctIdx = 0;
            else if (["B", "2", "ब", "ख"].includes(upperVal)) correctIdx = 1;
            else if (["C", "3", "स", "ग"].includes(upperVal)) correctIdx = 2;
            else if (["D", "4", "द", "घ"].includes(upperVal)) correctIdx = 3;
            else if (["E", "5", "य", "ङ"].includes(upperVal)) correctIdx = 4;
            else {
               const oIdx = findMatchingOptionIndex(options, val);
               if (oIdx !== -1) correctIdx = oIdx;
            }
          }

          textNodeQuestions.push({
            id: `text-node-${Date.now()}-${i}-${Math.random().toString(36).substring(4)}`,
            questionText: qParsed, options, correctAnswerIndex: correctIdx,
            explanation: "Dynamic text execution maps processed via central normalizer rules.",
            subject: classifyTextSubject(cleanTextOnly(qParsed)), topic: "Rajasthan GK", subtopic: "",
            difficulty: "Medium", sourceType: "notes", timesAnswered: 0, timesCorrect: 0, targetExam
          });
          lastQuestionEndNodeIdx = limitNodeIdx;
        }
      }
    } catch (err) { console.error("Text layer layout tree generation boundary failure:", err); }

    if (textNodeQuestions.length > 0) {
      const validTextNodes = textNodeQuestions.filter(q => isValidParsedQuestion(q.questionText));
      if (validTextNodes.length > 0) {
        return validTextNodes.map(q => ({
          ...q,
          questionText: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.questionText)),
          options: q.options.map(opt => overrideLegacyFontsInHtml(convertHtmlWithDevLys(opt))),
          explanation: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.explanation))
        }));
      }
    }

    // FALLBACK TAG STRUCTURE SEGMENTER
    const hasStructuredMarkers = /A<style/i.test(cleanedHtmlInput) || /E<style/i.test(cleanedHtmlInput) || /(?:^|[\s\r\n>])A(?:\s*<(?:style|p|span|div|b|i|font)\b)/i.test(cleanedHtmlInput);
    if (hasStructuredMarkers) {
      const markerRegex = /(?:^|[\s\r\n>])([A-E])(?=\s*<style\b|\s*<(?:p|span|div|b|i|font)\b)/gi;
      let match;
      const markers: { index: number; label: string; length: number }[] = [];
      while ((match = markerRegex.exec(cleanedHtmlInput)) !== null) {
        const lbl = match[1].toUpperCase(), raw = match[0], lblIdx = raw.toUpperCase().lastIndexOf(lbl);
        markers.push({ index: match.index + lblIdx, label: lbl, length: raw.length - lblIdx });
      }
      const outsideTagMarkers = markers.filter(m => {
        const b = cleanedHtmlInput.substring(0, m.index);
        return (b.match(/</g) || []).length === (b.match(/>/g) || []).length;
      });
      const aMarkers = outsideTagMarkers.filter(m => m.label === "A");

      if (aMarkers.length > 0) {
        const parsedList: Question[] = [];
        let currentQuestionStart = 0;
        for (let i = 0; i < aMarkers.length; i++) {
          const curA = aMarkers[i], nextA = aMarkers[i + 1], limit = nextA ? nextA.index : cleanedHtmlInput.length;
          const curGroup = outsideTagMarkers.filter(m => m.index > curA.index && m.index < limit);
          const curB = curGroup.find(m => m.label === "B"), curC = curGroup.find(m => m.label === "C"), curD = curGroup.find(m => m.label === "D"), curE = curGroup.find(m => m.label === "E");

          if (curB && curC && curD) {
            let optA = cleanedHtmlInput.substring(curA.index + curA.length, curB.index).trim();
            let optB = cleanedHtmlInput.substring(curB.index + curB.length, curC.index).trim();
            let optC = cleanedHtmlInput.substring(curC.index + curC.length, curD.index).trim();
            let optD = "", optE = "", lastOptEndIdx = limit;
            if (curE) {
              optD = cleanedHtmlInput.substring(curD.index + curD.length, curE.index).trim();
              lastOptEndIdx = findOptionEndIndex(cleanedHtmlInput, curE.index + curE.length, limit);
              optE = cleanedHtmlInput.substring(curE.index + curE.length, lastOptEndIdx).trim();
            } else {
              lastOptEndIdx = findOptionEndIndex(cleanedHtmlInput, curD.index + curD.length, limit);
              optD = cleanedHtmlInput.substring(curD.index + curD.length, lastOptEndIdx).trim();
            }

            let qText = cleanedHtmlInput.substring(currentQuestionStart, curA.index).trim();
            const qParsed = stripHtmlToText(cleanQuestionPreamble(qText));
            const options = [stripHtmlToText(optA), stripHtmlToText(optB), stripHtmlToText(optC), stripHtmlToText(optD)].filter(Boolean);
            if (optE) options.push(stripHtmlToText(optE));
            while (options.length < 4) options.push(`Option ${options.length + 1}`);

            let correctIdx = 0;
            const ansMatch = cleanTextOnly(cleanedHtmlInput.substring(currentQuestionStart, limit)).match(/(?:Ans|Answer|Correct|Key|उत्तर|सही उत्तर)[\s\.\-\:]*(.*)/i);
            if (ansMatch) {
              const val = ansMatch[1].trim();
              const upperVal = val.substring(0, 1).toUpperCase();
              if (["A", "1", "अ", "क"].includes(upperVal)) correctIdx = 0;
              else if (["B", "2", "ब", "ख"].includes(upperVal)) correctIdx = 1;
              else if (["C", "3", "स", "ग"].includes(upperVal)) correctIdx = 2;
              else if (["D", "4", "द", "घ"].includes(upperVal)) correctIdx = 3;
              else if (["E", "5", "य", "ङ"].includes(upperVal)) correctIdx = 4;
              else {
                 const oIdx = findMatchingOptionIndex(options, val);
                 if (oIdx !== -1) correctIdx = oIdx;
              }
            }

            parsedList.push({
              id: `pro-${Date.now()}-${i}-${Math.random().toString(36).substring(4)}`,
              questionText: qParsed, options, correctAnswerIndex: correctIdx,
              explanation: "Preserved master dynamic layouts sheets mapping configuration.",
              subject: classifyTextSubject(cleanTextOnly(qParsed)), topic: "Rajasthan GK", subtopic: "",
              difficulty: "Medium", sourceType: "notes", timesAnswered: 0, timesCorrect: 0, targetExam
            });
            currentQuestionStart = limit;
          }
        }
        const filteredParsedList = parsedList.filter(q => isValidParsedQuestion(q.questionText));
        if (filteredParsedList.length > 0) return filteredParsedList.map(q => ({
          ...q,
          questionText: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.questionText)),
          options: q.options.map(opt => overrideLegacyFontsInHtml(convertHtmlWithDevLys(opt))),
          explanation: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.explanation))
        }));
      }
    }

    // COMPONENT LAYOUT DOM FALLBACK
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedHtmlInput, "text/html");
    const blocks = doc.querySelectorAll(".question-block, .mcq, .quiz-question, .question-card");
    if (blocks.length > 0) {
      blocks.forEach((block, idx) => {
        const qEl = block.querySelector(".question, .question-text, .q-text, h3, h4");
        const optEls = block.querySelectorAll(".option, .opt, li");
        if (qEl) {
          const qText = stripHtmlToText(cleanQuestionPreamble(qEl.innerHTML.trim()));
          const options: string[] = [];
          optEls.forEach((opt) => { if (opt.innerHTML.trim()) options.push(stripHtmlToText(opt.innerHTML.trim())); });
          while (options.length < 4) options.push(`Option ${options.length + 1}`);
          
          let correctIdx = 0;
          optEls.forEach((opt, oIdx) => {
            if (block.classList.contains("correct") || opt.getAttribute("data-correct") === "true") correctIdx = oIdx;
          });

          questions.push({
            id: `dom-${Date.now()}-${idx}-${Math.random().toString(36).substring(4)}`,
            questionText: qText, options, correctAnswerIndex: correctIdx, explanation: "Extracted via card wrapper template tags stream.",
            subject: classifyTextSubject(cleanTextOnly(qText)), topic: "General", subtopic: "", difficulty: "Medium",
            sourceType: "notes", timesAnswered: 0, timesCorrect: 0, targetExam
          });
        }
      });
    }

    const filteredQuestions = questions.filter(q => isValidParsedQuestion(q.questionText));
    if (filteredQuestions.length > 0) return filteredQuestions.map(q => ({
      ...q,
      questionText: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.questionText)),
      options: q.options.map(opt => overrideLegacyFontsInHtml(convertHtmlWithDevLys(opt))),
      explanation: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.explanation))
    }));

    // RAW PARAGRAPH BLOCKS STREAM ENGINE FALLBACK
    const paragraphs = Array.from(doc.querySelectorAll("p, div, li, span, h1, h2, h3, h4"));
    let currentQText = "", currentOptions: string[] = [], currentCorrect = 0;
    const optRegex = /^\s*[\(\[\\{]?(?:[A-Ea-e]|[1-5]|अ|ब|स|द|य)[\)\]\\}]?[\s\.\-\:]*(.*)$/i;
    const ansRegex = /^\s*(?:Ans|Answer|Correct|Key|उत्तर|सही)[\s\.\-\:]*(.*)$/i;

    paragraphs.forEach((p, idx) => {
      const text = (p.textContent || "").trim();
      if (!text) return;

      const ansMatch = text.match(ansRegex);
      if (ansMatch) {
        const val = ansMatch[1].trim().toUpperCase();
        if (["A", "1", "अ"].includes(val)) currentCorrect = 0;
        else if (["B", "2", "ब"].includes(val)) currentCorrect = 1;
        else if (["C", "3", "स"].includes(val)) currentCorrect = 2;
        else if (["D", "4", "द"].includes(val)) currentCorrect = 3;
        else if (["E", "5", "य"].includes(val)) currentCorrect = 4;
        return;
      }

      const optMatch = text.match(optRegex);
      if (optMatch && currentOptions.length < 5) {
        if (p.innerHTML.trim()) currentOptions.push(p.innerHTML.trim());
        return;
      }

      if (currentQText && currentOptions.length > 0) {
        while (currentOptions.length < 4) currentOptions.push(`Option ${currentOptions.length + 1}`);
        questions.push({
          id: `dom-b-${Date.now()}-${idx}`,
          questionText: stripHtmlToText(cleanQuestionPreamble(currentQText)),
          options: currentOptions.map(o => stripHtmlToText(o)),
          correctAnswerIndex: currentCorrect, explanation: "Processed parsing iteration stream configuration.",
          subject: classifyTextSubject(cleanTextOnly(currentQText)), topic: "General Knowledge Studies", subtopic: "",
          difficulty: "Medium", sourceType: "notes", timesAnswered: 0, timesCorrect: 0, targetExam
        });
        currentQText = ""; currentOptions = []; currentCorrect = 0;
      }

      if (!optMatch && !ansMatch) currentQText += " " + p.innerHTML;
    });

  } catch (err) {
    console.error("Centralized compilation parser exception event:", err);
  }

  return questions.filter(q => isValidParsedQuestion(q.questionText)).map(q => ({
    ...q,
    questionText: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.questionText)),
    options: q.options.map(opt => overrideLegacyFontsInHtml(convertHtmlWithDevLys(opt))),
    explanation: overrideLegacyFontsInHtml(convertHtmlWithDevLys(q.explanation))
  }));
}

export function parseJSONQuestions(text: string, defaultSubject: string, defaultTargetExam: string): Question[] {
  try {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : [data];
    return list.map((item: any, idx: number) => {
      let options: string[] = [];
      if (Array.isArray(item.options)) {
        options = item.options.map((o: any) => String(o));
      } else if (item.choices && Array.isArray(item.choices)) {
        options = item.choices.map((c: any) => String(c));
      } else if (item.A || item.a) {
        options = [
          item.A || item.a,
          item.B || item.b || "",
          item.C || item.c || "",
          item.D || item.d || ""
        ].filter(Boolean);
      }
      
      let correctIdx = extractAnswerIndexFromJsonItem(item, options);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= Math.max(1, options.length)) {
        correctIdx = 0;
      }

      return {
        id: `json-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        questionText: item.questionText || item.question || item.text || "Untitled Question",
        options,
        correctAnswerIndex: correctIdx,
        correctAnswer: options[correctIdx] || "",
        explanation: item.explanation || item.exp || item.solution || "",
        subject: item.subject || defaultSubject || "General",
        targetExam: item.targetExam || defaultTargetExam || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Question;
    });
  } catch (err) {
    console.error("JSON parsing failed:", err);
    return [];
  }
}

export function parseTXTQuestions(text: string, defaultSubject: string, defaultTargetExam: string): Question[] {
  const lines = text.split(/\r?\n/);
  const questionsList: Question[] = [];
  
  let currentQText = "";
  let currentOptions: string[] = [];
  let currentCorrectIdx: number = 0;
  let currentExplanation = "";
  
  const saveCurrent = () => {
    if (currentQText.trim() && currentOptions.length >= 2) {
      questionsList.push({
        id: `txt-${Date.now()}-${questionsList.length}-${Math.random().toString(36).substr(2, 4)}`,
        questionText: currentQText.trim(),
        options: [...currentOptions],
        correctAnswerIndex: currentCorrectIdx,
        correctAnswer: currentOptions[currentCorrectIdx] || "",
        explanation: currentExplanation.trim(),
        subject: defaultSubject || "General",
        targetExam: defaultTargetExam || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Question);
    }
    currentQText = "";
    currentOptions = [];
    currentCorrectIdx = 0;
    currentExplanation = "";
  };

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const qMatch = trimmed.match(/^(?:Q(?:uestion)?\s*\d+[:.]?|\d+[:.])\s*(.*)$/i);
    if (qMatch) {
      saveCurrent();
      currentQText = qMatch[1] || trimmed;
      continue;
    }

    const optMatch = trimmed.match(/^(?:[A-D]|[a-d])\s*[\).\s-]\s*(.*)$/);
    if (optMatch) {
      currentOptions.push(optMatch[1]);
      continue;
    }

    const ansMatch = trimmed.match(/^(?:Answer|Ans|Correct|Key)\s*[:.-]?\s*(.*)$/i);
    if (ansMatch) {
      const val = ansMatch[1].trim();
      const oIdx = findMatchingOptionIndex(currentOptions, val);
      if (oIdx !== -1) currentCorrectIdx = oIdx;
      continue;
    }

    const expMatch = trimmed.match(/^(?:Explanation|Sol|Solution|Exp)\s*[:.-]?\s*(.*)$/i);
    if (expMatch) {
      currentExplanation = expMatch[1] || "";
      continue;
    }

    if (currentExplanation) {
      currentExplanation += " " + trimmed;
    } else if (currentOptions.length > 0) {
      currentOptions[currentOptions.length - 1] += " " + trimmed;
    } else if (currentQText) {
      currentQText += " " + trimmed;
    } else {
      currentQText = trimmed;
    }
  }
  
  saveCurrent();
  return questionsList;
}
