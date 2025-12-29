({
    load(force = false) {
        const LIB = $.__lib = $.__lib || {};
        if (!force && LIB.text) {
            return LIB.text;
        }
        const REGEX_BY_CLASS = (() => {
            const Hiragana = /\p{Script=Hiragana}/u;
            const Katakana = /\p{Script=Katakana}/u;
            const Han = /\p{Script=Han}/u;
            const Hangul = /\p{Script=Hangul}/u;
            const Latin = /\p{Script=Latin}/u;
            const Greek = /\p{Script=Greek}/u;
            const Cyrillic = /\p{Script=Cyrillic}/u;
            const Arabic = /\p{Script=Arabic}/u;
            const Hebrew = /\p{Script=Hebrew}/u;
            const Armenian = /\p{Script=Armenian}/u;
            const Georgian = /\p{Script=Georgian}/u;
            const Devanagari = /\p{Script=Devanagari}/u;
            const Bengali = /\p{Script=Bengali}/u;
            const Gurmukhi = /\p{Script=Gurmukhi}/u;
            const Gujarati = /\p{Script=Gujarati}/u;
            const Oriya = /\p{Script=Oriya}/u;
            const Tamil = /\p{Script=Tamil}/u;
            const Telugu = /\p{Script=Telugu}/u;
            const Kannada = /\p{Script=Kannada}/u;
            const Malayalam = /\p{Script=Malayalam}/u;
            const Sinhala = /\p{Script=Sinhala}/u;
            const Thai = /\p{Script=Thai}/u;
            const Lao = /\p{Script=Lao}/u;
            const Khmer = /\p{Script=Khmer}/u;
            const Myanmar = /\p{Script=Myanmar}/u;
            const Ethiopic = /\p{Script=Ethiopic}/u;
            const Lowercase = /\p{Lowercase_Letter}/u;
            const Uppercase = /\p{Uppercase_Letter}/u;
            const Modifier = /\p{Modifier_Letter}/u;
            const Alphabetic = /\p{Alphabetic}/u;
            const Letter = /\p{Letter}/u;
            const Decimal = /\p{Decimal_Number}/u;
            const Number = /\p{Number}/u;
            const Emoji = /\p{Extended_Pictographic}/u;
            const Symbol = /\p{Symbol}/u;
            const Punctuation = /\p{Punctuation}/u;
            const Yakumono = /[、。，．・：；？！…―ー〜～「」『』（）［］｛｝〈〉《》【】]/;
            const Space = /\p{Space_Separator}/u;
            const Separator = /\p{Separator}/u;
            return {
                Hiragana,
                Katakana,
                Kanji: Han,
                Han,
                Hangul,
                Latin,
                Greek,
                Cyrillic,
                Arabic,
                Hebrew,
                Armenian,
                Georgian,
                Devanagari,
                Bengali,
                Gurmukhi,
                Gujarati,
                Oriya,
                Tamil,
                Telugu,
                Kannada,
                Malayalam,
                Sinhala,
                Thai,
                Lao,
                Khmer,
                Myanmar,
                Ethiopic,
                Lowercase,
                Uppercase,
                Modifier,
                Alphabetic,
                Letter,
                Decimal,
                Number,
                Emoji,
                Symbol,
                Punctuation,
                Symbols: [Symbol, Punctuation],
                Yakumono,
                Space,
                Separator,
            };
        })();
        const CharClass = {
            Hiragana: "Hiragana",
            Katakana: "Katakana",
            Kanji: "Kanji",
            Han: "Han",
            Hangul: "Hangul",
            Latin: "Latin",
            Greek: "Greek",
            Cyrillic: "Cyrillic",
            Arabic: "Arabic",
            Hebrew: "Hebrew",
            Armenian: "Armenian",
            Georgian: "Georgian",
            Devanagari: "Devanagari",
            Bengali: "Bengali",
            Gurmukhi: "Gurmukhi",
            Gujarati: "Gujarati",
            Oriya: "Oriya",
            Tamil: "Tamil",
            Telugu: "Telugu",
            Kannada: "Kannada",
            Malayalam: "Malayalam",
            Sinhala: "Sinhala",
            Thai: "Thai",
            Lao: "Lao",
            Khmer: "Khmer",
            Myanmar: "Myanmar",
            Ethiopic: "Ethiopic",
            Lowercase: "Lowercase",
            Uppercase: "Uppercase",
            Modifier: "Modifier",
            Alphabetic: "Alphabetic",
            Letter: "Letter",
            Decimal: "Decimal",
            Number: "Number",
            Emoji: "Emoji",
            Symbol: "Symbol",
            Punctuation: "Punctuation",
            Symbols: "Symbols",
            Yakumono: "Yakumono",
            Space: "Space",
            Separator: "Separator",
        };
        function mergeRanges(ranges) {
            if (ranges.length === 0)
                return [];
            const sorted = [...ranges].sort((a, b) => a.from - b.from);
            const result = [sorted[0]];
            for (let i = 1; i < sorted.length; i++) {
                const prev = result[result.length - 1];
                const curr = sorted[i];
                const prevEnd = prev.from + prev.count;
                const currEnd = curr.from + curr.count;
                if (curr.from <= prevEnd) {
                    prev.count = Math.max(prevEnd, currEnd) - prev.from;
                }
                else {
                    result.push(curr);
                }
            }
            return result;
        }
        function toRegExp(m) {
            if (typeof m === "string") {
                const r = REGEX_BY_CLASS[m];
                if (!r)
                    throw new Error(`Unsupported CharClass: ${m}`);
                return r;
            }
            else {
                return m;
            }
        }
        function annotateByCharClassOverlay(text, charClass) {
            const res = (() => {
                if (Array.isArray(charClass))
                    return charClass.flatMap(toRegExp);
                return [toRegExp(charClass)].flat();
            })();
            const ranges = [];
            for (const re0 of res) {
                const flags = re0.flags.includes("g") ? re0.flags : re0.flags + "g";
                const re = new RegExp(re0.source, flags);
                let m;
                while ((m = re.exec(text)) !== null) {
                    ranges.push({
                        from: m.index,
                        count: m[0].length,
                    });
                    if (m[0].length === 0) {
                        re.lastIndex++;
                    }
                }
            }
            return mergeRanges(ranges);
        }
        function annotateByCharClassExclusive(text, charClasses) {
            const rules = charClasses.map(cls => {
                if (Array.isArray(cls))
                    return cls.flatMap(toRegExp);
                return [toRegExp(cls)].flat();
            });
            const ranges = [];
            let i = 0;
            while (i < text.length) {
                let matchedIndex = -1;
                let matchLength = 1;
                for (let idx = 0; idx < rules.length; idx++) {
                    const res = rules[idx];
                    for (const re of res) {
                        const m = re.exec(text.slice(i));
                        if (m && m.index === 0) {
                            matchedIndex = idx;
                            matchLength = m[0].length;
                            break;
                        }
                    }
                    if (matchedIndex !== -1)
                        break;
                }
                if (matchedIndex === -1) {
                    let end = i + 1;
                    while (end < text.length) {
                        const anyMatch = rules.some(regexList => regexList.some(r => r.exec(text.slice(end))?.index === 0));
                        if (anyMatch)
                            break;
                        end++;
                    }
                    matchLength = end - i;
                }
                const last = ranges[ranges.length - 1];
                if (last && last.index === matchedIndex) {
                    last.count += matchLength;
                }
                else {
                    ranges.push({ from: i, count: matchLength, index: matchedIndex });
                }
                i += matchLength;
            }
            return ranges;
        }
        function applyTextLayoutField(style, field, value) {
            switch (field) {
                case "direction":
                    return style.setDirection(value);
                case "firstLineIndent":
                    return style.setFirstLineIndent(value);
                case "isEveryLineComposer":
                    return style.setEveryLineComposer(value);
                case "isHangingRoman":
                    return style.setHangingRoman(value);
                case "justification":
                    return style.setJustification(value);
                case "leadingType":
                    return style.setLeadingType(value);
                case "leftMargin":
                    return style.setLeftMargin(value);
                case "rightMargin":
                    return style.setRightMargin(value);
                case "spaceAfter":
                    return style.setSpaceAfter(value);
                case "spaceBefore":
                    return style.setSpaceBefore(value);
            }
            throw new Error(`Invalid field: ${field}`);
        }
        function applyTextLayout(style, layout) {
            for (const field in layout) {
                style = applyTextLayoutField(style, field, layout[field]);
            }
            return style;
        }
        function applyStyleField(style, field, value, startIndex, numOfCharacters) {
            switch (field) {
                case "applyFill":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setApplyFill(value, startIndex + n, 1);
                    }
                    return style;
                case "applyStroke":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setApplyStroke(value, startIndex + n, 1);
                    }
                    return style;
                case "baselineDirection":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setBaselineDirection(value, startIndex + n, 1);
                    }
                    return style;
                case "baselineOption":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setBaselineOption(value, startIndex + n, 1);
                    }
                    return style;
                case "baselineShift":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setBaselineShift(value, startIndex + n, 1);
                    }
                    return style;
                case "digitSet":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setDigitSet(value, startIndex + n, 1);
                    }
                    return style;
                case "fillColor":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFillColor(value, startIndex + n, 1);
                    }
                    return style;
                case "font":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFont(value, startIndex + n, 1);
                    }
                    return style;
                case "fontSize":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFontSize(value, startIndex + n, 1);
                    }
                    return style;
                case "horizontalScaling":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setHorizontalScaling(value, startIndex + n, 1);
                    }
                    return style;
                case "isAllCaps":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setAllCaps(value, startIndex + n, 1);
                    }
                    return style;
                case "isAutoLeading":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setAutoLeading(value, startIndex + n, 1);
                    }
                    return style;
                case "isFauxBold":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFauxBold(value, startIndex + n, 1);
                    }
                    return style;
                case "isFauxItalic":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFauxItalic(value, startIndex + n, 1);
                    }
                    return style;
                case "isLigature":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setLigature(value, startIndex + n, 1);
                    }
                    return style;
                case "isSmallCaps":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setSmallCaps(value, startIndex + n, 1);
                    }
                    return style;
                case "kerning":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setKerning(value, startIndex + n);
                    }
                    return style;
                case "kerningType":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setKerningType(value, startIndex + n, 1);
                    }
                    return style;
                case "leading":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setLeading(value, startIndex + n, 1);
                    }
                    return style;
                case "lineJoin":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setLineJoin(value, startIndex + n, 1);
                    }
                    return style;
                case "strokeColor":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setStrokeColor(value, startIndex + n, 1);
                    }
                    return style;
                case "strokeWidth":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setStrokeWidth(value, startIndex + n, 1);
                    }
                    return style;
                case "tracking":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setTracking(value, startIndex + n, 1);
                    }
                    return style;
                case "tsume":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setTsume(value, startIndex + n, 1);
                    }
                    return style;
                case "verticalScaling":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setVerticalScaling(value, startIndex + n, 1);
                    }
                    return style;
            }
            throw new Error(`Invalid field: ${field}`);
        }
        function applyStyle(style, options, startIndex, numOfCharacters) {
            for (const field in options) {
                style = applyStyleField(style, field, options[field], startIndex, numOfCharacters);
            }
            return style;
        }
        function isStyleOnly(a, b) {
            return b === undefined;
        }
        class TextStyleBuilder {
            layoutOptions = {};
            rule(a, b) {
                if (isStyleOnly(a, b)) {
                    return this.addRule(this.defaultRule, a);
                }
                else {
                    return this.addRule(a, b);
                }
            }
            layout(layout) {
                this.layoutOptions = { ...this.layoutOptions, ...layout };
                return this;
            }
            applyLayout(style) {
                return applyTextLayout(style, this.layoutOptions);
            }
        }
        class CharClassTextStyleBuilder extends TextStyleBuilder {
            charClasses = [];
            styles = [];
            doExclusive = false;
            get defaultRule() {
                return /[\s\S]+/;
            }
            exclusive() {
                this.doExclusive = true;
                return this;
            }
            overlay() {
                this.doExclusive = false;
                return this;
            }
            addRule(rule, style) {
                this.charClasses.push(rule);
                this.styles.push(style);
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = this.applyLayout(style);
                if (this.doExclusive) {
                    const ranges = annotateByCharClassExclusive(property.value, this.charClasses);
                    for (const range of ranges) {
                        if (range.index < 0) {
                            continue;
                        }
                        const startIndex = range.from;
                        const numOfCharacters = range.count;
                        style = applyStyle(style, this.styles[range.index], startIndex, numOfCharacters);
                    }
                }
                else {
                    for (let i = 0; i < this.charClasses.length; i++) {
                        const ranges = annotateByCharClassOverlay(property.value, this.charClasses[i]);
                        for (const range of ranges) {
                            const startIndex = range.from;
                            const numOfCharacters = range.count;
                            style = applyStyle(style, this.styles[i], startIndex, numOfCharacters);
                        }
                    }
                }
                return style;
            }
        }
        function convertGraphemeRangesForText(text, rules, line = 0) {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
            const utf16Offsets = [];
            let offset = 0;
            for (const grapheme of graphemes) {
                utf16Offsets.push(offset);
                offset += grapheme.segment.length;
            }
            utf16Offsets.push(offset);
            const result = [];
            for (const rule of rules) {
                let range = [];
                if (typeof rule === "number") {
                    if (rule < graphemes.length) {
                        const fromUtf16 = utf16Offsets[rule];
                        const toUtf16 = utf16Offsets[rule + 1];
                        range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                    }
                }
                else if (typeof rule === "function") {
                    for (let i = 0; i < graphemes.length; i++) {
                        if (rule(i, line)) {
                            const fromUtf16 = utf16Offsets[i];
                            const toUtf16 = utf16Offsets[i + 1];
                            range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                        }
                    }
                    range = mergeRanges(range);
                }
                else {
                    const start = rule.from;
                    const end = rule.count != null ? Math.min(start + rule.count, graphemes.length) : graphemes.length;
                    const fromUtf16 = utf16Offsets[start];
                    const toUtf16 = utf16Offsets[end];
                    range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                }
                result.push(range);
            }
            return result;
        }
        function convertGraphemeRangesByLine(text, rules) {
            const lineRanges = annotateByLine(text);
            const result = rules.map(() => []);
            for (let i = 0; i < lineRanges.length; i++) {
                const line = lineRanges[i];
                const lineText = text.slice(line.from, line.from + line.count);
                const perLine = convertGraphemeRangesForText(lineText, rules, i);
                for (let i = 0; i < perLine.length; i++) {
                    for (const r of perLine[i]) {
                        result[i].push({
                            from: line.from + r.from,
                            count: r.count,
                        });
                    }
                }
            }
            for (let i = 0; i < result.length; i++) {
                result[i] = mergeRanges(result[i]);
            }
            return result;
        }
        class PositionTextStyleBuilder extends TextStyleBuilder {
            rules = [];
            styles = [];
            doLine = false;
            get defaultRule() {
                return { from: 0 };
            }
            line() {
                this.doLine = true;
                return this;
            }
            global() {
                this.doLine = false;
                return this;
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = this.applyLayout(style);
                const rangesList = this.doLine ? convertGraphemeRangesByLine(property.value, this.rules) : convertGraphemeRangesForText(property.value, this.rules);
                for (let i = 0; i < rangesList.length; i++) {
                    for (const range of rangesList[i]) {
                        const startIndex = range.from;
                        const numOfCharacters = range.count;
                        style = applyStyle(style, this.styles[i], startIndex, numOfCharacters);
                    }
                }
                return style;
            }
        }
        function annotateByLine(text) {
            const ranges = [];
            let start = 0;
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === "\r" && text[i + 1] === "\n") {
                    const count = i - start + 2;
                    ranges.push({ from: start, count });
                    start = i + 2;
                    i++;
                    continue;
                }
                if (ch === "\r" || ch === "\n") {
                    const count = i - start + 1;
                    ranges.push({ from: start, count });
                    start = i + 1;
                }
            }
            if (start < text.length) {
                ranges.push({ from: start, count: text.length - start });
            }
            return ranges;
        }
        function deriveRangesFromRangeRule(ranges, rule) {
            let result = [];
            if (typeof rule === "number") {
                const r = ranges[rule];
                if (r)
                    result = [r];
            }
            else if (typeof rule === "function") {
                result = ranges.map((r, i) => ({ r, i })).filter(({ i }) => rule(i)).map(({ r }) => r);
            }
            else {
                const start = rule.from;
                const end = rule.count != null ? start + rule.count : ranges.length;
                for (let i = start; i < end && i < ranges.length; i++) {
                    result.push(ranges[i]);
                }
            }
            return mergeRanges(result);
        }
        class LineTextStyleBuilder extends TextStyleBuilder {
            rules = [];
            styles = [];
            get defaultRule() {
                return { from: 0 };
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = this.applyLayout(style);
                const lines = annotateByLine(property.value);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = deriveRangesFromRangeRule(lines, this.rules[i]);
                    for (const range of ranges) {
                        const startIndex = range.from;
                        const numOfCharacters = range.count;
                        style = applyStyle(style, this.styles[i], startIndex, numOfCharacters);
                    }
                }
                return style;
            }
        }
        function findNoneNested(text, open, close) {
            const matches = [];
            for (let i = 0; i < text.length;) {
                if (text.startsWith(open, i)) {
                    const start = i;
                    const end = text.indexOf(close, i + open.length);
                    if (end !== -1) {
                        matches.push({
                            open: start,
                            close: end,
                            depth: 0,
                        });
                        i = end + close.length;
                        continue;
                    }
                }
                i++;
            }
            return matches;
        }
        function findBalanced(text, open, close) {
            const stack = [];
            const matches = [];
            for (let i = 0; i < text.length;) {
                if (text.startsWith(open, i)) {
                    stack.push({ pos: i, depth: stack.length });
                    i += open.length;
                    continue;
                }
                if (text.startsWith(close, i) && stack.length > 0) {
                    const last = stack.pop();
                    matches.push({
                        open: last.pos,
                        close: i,
                        depth: last.depth,
                    });
                    i += close.length;
                    continue;
                }
                i++;
            }
            return matches;
        }
        function matchToRanges(m, target, openLen, closeLen) {
            switch (target) {
                case "all":
                    return [{
                            from: m.open,
                            count: m.close - m.open + closeLen,
                        }];
                case "content": {
                    const from = m.open + openLen;
                    const count = m.close - from;
                    return [{ from, count: Math.max(0, count) }];
                }
                case "delimiter":
                    return [
                        { from: m.open, count: openLen },
                        { from: m.close, count: closeLen },
                    ];
                case "open":
                    return [{ from: m.open, count: openLen }];
                case "close":
                    return [{ from: m.close, count: closeLen }];
            }
        }
        function annotateBySurrounding(text, open, close, options) {
            const { target, nesting, depth, } = options;
            const openLen = open.length;
            const closeLen = close.length;
            const matches = nesting === "none" ? findNoneNested(text, open, close) : findBalanced(text, open, close);
            const filtered = matches.filter(m => {
                if (depth == null)
                    return true;
                if (typeof depth === "number")
                    return m.depth === depth;
                return depth(m.depth);
            });
            const ranges = [];
            for (const m of filtered) {
                ranges.push(...matchToRanges(m, target, openLen, closeLen));
            }
            return mergeRanges(ranges);
        }
        class SurroundingTextStyleBuilder extends TextStyleBuilder {
            open;
            close;
            options;
            rules = [];
            styles = [];
            constructor(open, close, options) {
                super();
                this.open = open;
                this.close = close;
                this.options = { target: "content", nesting: "balanced", ...options };
            }
            get defaultRule() {
                return { from: 0 };
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = this.applyLayout(style);
                const surroudnings = annotateBySurrounding(property.value, this.open, this.close, this.options);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = deriveRangesFromRangeRule(surroudnings, this.rules[i]);
                    for (const range of ranges) {
                        const startIndex = range.from;
                        const numOfCharacters = range.count;
                        if (numOfCharacters <= 0)
                            continue;
                        style = applyStyle(style, this.styles[i], startIndex, numOfCharacters);
                    }
                }
                return style;
            }
        }
        function isLineBreakGrapheme(g) {
            return g === "\n" || g === "\r" || g === "\r\n";
        }
        function segmentText(text) {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
            const lineOf = [];
            const indexInLineOf = [];
            const lineLengthOf = [];
            let line = 0;
            let indexInLine = 0;
            let lineStart = 0;
            graphemes.forEach((seg, i) => {
                lineOf[i] = line;
                indexInLineOf[i] = indexInLine;
                indexInLine++;
                if (isLineBreakGrapheme(seg.segment)) {
                    const len = i - lineStart + 1;
                    for (let j = lineStart; j <= i; j++) {
                        lineLengthOf[j] = len;
                    }
                    line++;
                    indexInLine = 0;
                    lineStart = i + 1;
                }
            });
            const lastLen = graphemes.length - lineStart;
            for (let j = lineStart; j < graphemes.length; j++) {
                lineLengthOf[j] = lastLen;
            }
            return {
                graphemes,
                lineOf,
                indexInLineOf,
                lineLengthOf,
                totalLines: line,
            };
        }
        function processGrapheme(text, rules, iteration) {
            const { graphemes, lineOf, indexInLineOf, lineLengthOf, totalLines } = segmentText(text);
            const results = rules.map(() => []);
            const contexts = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                lineLength: 0,
                totalLines: 0,
                iteration: 0,
                state: rule.initState(),
            }));
            for (let iter = 0; iter < iteration; iter++) {
                graphemes.forEach((seg, globalIndex) => {
                    const g = seg.segment;
                    const from = seg.index;
                    const count = g.length;
                    rules.forEach((rule, i) => {
                        const ctx = contexts[i];
                        ctx.index = globalIndex;
                        ctx.line = lineOf[globalIndex];
                        ctx.indexInLine = indexInLineOf[globalIndex];
                        ctx.lineLength = lineLengthOf[globalIndex];
                        ctx.totalLines = totalLines;
                        ctx.iteration = iter;
                        if (iter === iteration - 1 && rule.match(g, ctx)) {
                            results[i].push({ from, count });
                        }
                    });
                });
            }
            return results.map(mergeRanges);
        }
        class GraphemeTextStyleBuilder extends TextStyleBuilder {
            rules = [];
            styles = [];
            iteration = 1;
            get defaultRule() {
                return () => true;
            }
            iterations(iter) {
                this.iteration = Math.max(1, iter);
                return this;
            }
            addRule(rule, style) {
                if (typeof rule === "function") {
                    this.rules.push({ match: rule, initState: () => ({}) });
                }
                else {
                    this.rules.push(rule);
                }
                this.styles.push(style);
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = this.applyLayout(style);
                const rangesList = processGrapheme(property.value, this.rules, this.iteration);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = rangesList[i];
                    for (const range of ranges) {
                        const startIndex = range.from;
                        const numOfCharacters = range.count;
                        style = applyStyle(style, this.styles[i], startIndex, numOfCharacters);
                    }
                }
                return style;
            }
        }
        class ForEachLine {
            fn;
            constructor(fn) {
                this.fn = fn;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                const text = property.value;
                const lines = annotateByLine(text);
                const fn = this.fn;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const result = fn(text.slice(line.from, line.from + line.count), i, lines.length);
                    if (result) {
                        style = applyStyle(style, result, line.from, line.count);
                    }
                }
                return style;
            }
        }
        class ForEachGrapheme {
            fn;
            options;
            constructor(fn, options) {
                this.fn = fn;
                this.options = { ...{ iterations: 1, initState: () => ({}) }, ...options };
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                const { graphemes, lineOf, indexInLineOf, lineLengthOf, totalLines } = segmentText(property.value);
                const ctx = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    lineLength: 0,
                    totalLines: 0,
                    iteration: 0,
                    state: this.options.initState(),
                };
                const fn = this.fn;
                const iteration = Math.max(1, this.options.iterations);
                for (let iter = 0; iter < iteration; iter++) {
                    graphemes.forEach((seg, globalIndex) => {
                        const g = seg.segment;
                        const from = seg.index;
                        const count = g.length;
                        ctx.index = globalIndex;
                        ctx.line = lineOf[globalIndex];
                        ctx.indexInLine = indexInLineOf[globalIndex];
                        ctx.lineLength = lineLengthOf[globalIndex];
                        ctx.totalLines = totalLines;
                        ctx.iteration = iter;
                        const result = fn(g, ctx);
                        if (iter === iteration - 1 && result) {
                            style = applyStyle(style, result, from, count);
                        }
                    });
                }
                return style;
            }
        }
        class TextStyleComposer {
            builders = [];
            layoutOptions = {};
            add(builder) {
                this.builders.push(builder);
                return this;
            }
            layout(layout) {
                this.layoutOptions = { ...this.layoutOptions, ...layout };
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = applyTextLayout(style, this.layoutOptions);
                for (const builder of this.builders) {
                    style = builder.apply(property, style);
                }
                return style;
            }
        }
        const lib = {
            CharClass,
            TextStyle: {
                // static
                byCharClass: () => new CharClassTextStyleBuilder(),
                byPosition: () => new PositionTextStyleBuilder(),
                byLine: () => new LineTextStyleBuilder(),
                bySurrounding: (open, close, options) => new SurroundingTextStyleBuilder(open, close, options),
                byGrapheme: () => new GraphemeTextStyleBuilder(),
                // dynamic
                forEachLine: (fn) => new ForEachLine(fn),
                forEachGrapheme: (fn, options) => new ForEachGrapheme(fn, options),
                // compose
                compose: () => new TextStyleComposer(),
            },
            __internal: {
                annotateByCharClass: annotateByCharClassExclusive
            },
        };
        LIB.text = lib;
        return lib;
    },
})
