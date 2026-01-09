({
    load(force = false) {
        const LIB = $.__lib = $.__lib || {};
        if (!force && LIB.text) {
            return LIB.text;
        }
        const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;
        class CharClass {
            _name;
            _re;
            constructor(_name, re) {
                this._name = _name;
                this._re = Object.freeze(new RegExp(re.source, re.flags));
            }
            get name() { return this._name; }
            get re() { return this._re; }
            test(g) { return this._re.test(g); }
            static isCharClass(v) {
                return v instanceof CharClass;
            }
        }
        const CHAR_CLASS_DEFINITIONS = {
            Hiragana: /\p{Script=Hiragana}/u,
            Katakana: /\p{Script=Katakana}/u,
            Kanji: /\p{Script=Han}/u,
            Japanese: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー〆]/u,
            Han: /\p{Script=Han}/u,
            Hangul: /\p{Script=Hangul}/u,
            Latin: /\p{Script=Latin}/u,
            Greek: /\p{Script=Greek}/u,
            Cyrillic: /\p{Script=Cyrillic}/u,
            Arabic: /\p{Script=Arabic}/u,
            Hebrew: /\p{Script=Hebrew}/u,
            Armenian: /\p{Script=Armenian}/u,
            Georgian: /\p{Script=Georgian}/u,
            Devanagari: /\p{Script=Devanagari}/u,
            Bengali: /\p{Script=Bengali}/u,
            Gurmukhi: /\p{Script=Gurmukhi}/u,
            Gujarati: /\p{Script=Gujarati}/u,
            Oriya: /\p{Script=Oriya}/u,
            Tamil: /\p{Script=Tamil}/u,
            Telugu: /\p{Script=Telugu}/u,
            Kannada: /\p{Script=Kannada}/u,
            Malayalam: /\p{Script=Malayalam}/u,
            Sinhala: /\p{Script=Sinhala}/u,
            Thai: /\p{Script=Thai}/u,
            Lao: /\p{Script=Lao}/u,
            Khmer: /\p{Script=Khmer}/u,
            Myanmar: /\p{Script=Myanmar}/u,
            Ethiopic: /\p{Script=Ethiopic}/u,
            LowercaseLetter: /\p{Lowercase_Letter}/u,
            UppercaseLetter: /\p{Uppercase_Letter}/u,
            ModifierLetter: /\p{Modifier_Letter}/u,
            Alphabetic: /\p{Alphabetic}/u,
            Letter: /\p{Letter}/u,
            DecimalNumber: /\p{Decimal_Number}/u,
            Number: /\p{Number}/u,
            Emoji: /\p{Extended_Pictographic}/u,
            Symbol: /\p{Symbol}/u,
            Punctuation: /\p{Punctuation}/u,
            Control: /\p{Control}/u,
            SpaceSeparator: /\p{Space_Separator}/u,
            Separator: /\p{Separator}/u,
            Yakumono: /[、。，．・：；？！…―ー〜～「」『』（）［］｛｝〈〉《》【】]/,
            Whitespace: /\s/u,
            InlineWhitespace: /[\p{Zs}\t]/u,
            LineBreak: /(?:\r\n|[\n\r\u0085\u2028\u2029])/u,
        };
        const CHAR_CLASS_REGISTRY = (() => {
            const registry = {};
            for (const [key, re] of Object.entries(CHAR_CLASS_DEFINITIONS)) {
                registry[key] = Object.freeze(new CharClass(key, re));
            }
            return Object.freeze(registry);
        })();
        function createMatcher(matchers) {
            if (!matchers)
                return () => false;
            const items = Array.isArray(matchers) ? matchers : [matchers];
            const fns = items.map(m => {
                if (typeof m === "string") {
                    const cc = CHAR_CLASS_REGISTRY[m];
                    if (!cc)
                        throw new Error(`Unknown CharClass: ${m}`);
                    return (g) => g !== null && cc.test(g);
                }
                if (CharClass.isCharClass(m))
                    return (g) => g !== null && m.test(g);
                if (m instanceof RegExp)
                    return (g) => g !== null && m.test(g);
                return () => false;
            });
            return (g) => fns.some(p => p(g));
        }
        const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
        const wordSegmenterCache = new Map();
        function getWordSegmenter(locale) {
            if (!wordSegmenterCache.has(locale)) {
                wordSegmenterCache.set(locale, new Intl.Segmenter(locale, { granularity: "word" }));
            }
            return wordSegmenterCache.get(locale);
        }
        const sentenceSegmenterCache = new Map();
        function getSentenceSegmenter(locale) {
            if (!sentenceSegmenterCache.has(locale)) {
                sentenceSegmenterCache.set(locale, new Intl.Segmenter(locale, { granularity: "sentence" }));
            }
            return sentenceSegmenterCache.get(locale);
        }
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
        function replaceText(style, text) {
            return style.replaceText(text);
        }
        const TEXT_STYLE_METHOD_MAP = {
            // layout
            direction: "setDirection",
            firstLineIndent: "setFirstLineIndent",
            isEveryLineComposer: "setEveryLineComposer",
            isHangingRoman: "setHangingRoman",
            justification: "setJustification",
            leadingType: "setLeadingType",
            leftMargin: "setLeftMargin",
            rightMargin: "setRightMargin",
            spaceAfter: "setSpaceAfter",
            spaceBefore: "setSpaceBefore",
            // style
            applyFill: "setApplyFill",
            applyStroke: "setApplyStroke",
            baselineDirection: "setBaselineDirection",
            baselineOption: "setBaselineOption",
            baselineShift: "setBaselineShift",
            digitSet: "setDigitSet",
            fillColor: "setFillColor",
            font: "setFont",
            fontSize: "setFontSize",
            horizontalScaling: "setHorizontalScaling",
            isAllCaps: "setAllCaps",
            isAutoLeading: "setAutoLeading",
            isFauxBold: "setFauxBold",
            isFauxItalic: "setFauxItalic",
            isLigature: "setLigature",
            isSmallCaps: "setSmallCaps",
            kerning: "setKerning", // special
            kerningType: "setKerningType",
            leading: "setLeading",
            lineJoin: "setLineJoin",
            strokeColor: "setStrokeColor",
            strokeWidth: "setStrokeWidth",
            tracking: "setTracking",
            tsume: "setTsume",
            verticalScaling: "setVerticalScaling",
        };
        function applyTextStyleUniversal(style, field, value, startIndex, count) {
            const methodName = TEXT_STYLE_METHOD_MAP[field];
            if (!methodName)
                throw new Error(`Invalid field: ${field}`);
            // kerning
            if (field === "kerning") {
                const start = startIndex ?? 0;
                const len = count ?? 1;
                for (let i = 0; i < len; i++) {
                    style = style.setKerning(value, start + i);
                }
                return style;
            }
            // other
            const fn = style[methodName];
            if (typeof fn !== "function")
                throw new Error(`Invalid method: ${methodName}`);
            if (startIndex !== undefined && count !== undefined) {
                return fn.call(style, value, startIndex, count);
            }
            else {
                return fn.call(style, value);
            }
        }
        function applyTextStyleAll(text, style, field, value) {
            if (field === "kerning") {
                return applyTextStyleUniversal(style, field, value, 0, text.length);
            }
            else {
                return applyTextStyleUniversal(style, field, value);
            }
        }
        function applyStyle(style, options, startIndex, numOfCharacters) {
            for (const field in options) {
                if (Object.prototype.hasOwnProperty.call(options, field)) {
                    style = applyTextStyleUniversal(style, field, options[field], startIndex, numOfCharacters);
                }
            }
            return style;
        }
        function shallowEqual(a, b) {
            if (a === b)
                return true;
            if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
                return false;
            }
            const ka = Object.keys(a);
            const kb = Object.keys(b);
            if (ka.length !== kb.length)
                return false;
            for (const k of ka) {
                if (!(k in b))
                    return false;
                const va = a[k];
                const vb = b[k];
                if (Array.isArray(va) && Array.isArray(vb)) {
                    if (va.length !== vb.length)
                        return false;
                    for (let i = 0; i < va.length; i++) {
                        if (va[i] !== vb[i])
                            return false;
                    }
                    continue;
                }
                if (Array.isArray(va) || Array.isArray(vb)) {
                    return false;
                }
                if (va !== vb)
                    return false;
            }
            return true;
        }
        function normalizeRanges(input) {
            if (input.length === 0)
                return [];
            const ranges = input
                .filter(r => r.count > 0)
                .map((r, i) => ({
                from: r.from,
                to: r.from + r.count,
                style: r.style,
                priority: i,
            }));
            const events = [];
            for (const r of ranges) {
                events.push({ pos: r.from, type: "start", range: r });
                events.push({ pos: r.to, type: "end", range: r });
            }
            events.sort((a, b) => a.pos !== b.pos
                ? a.pos - b.pos
                : a.type === b.type
                    ? 0
                    : a.type === "end"
                        ? -1
                        : 1);
            const active = [];
            const result = [];
            let lastPos = null;
            for (const e of events) {
                if (lastPos !== null && lastPos < e.pos && active.length > 0) {
                    let style = {};
                    for (const r of active) {
                        style = { ...style, ...r.style };
                    }
                    const last = result[result.length - 1];
                    if (last && last.from + last.count === lastPos && shallowEqual(last.style, style)) {
                        last.count += e.pos - lastPos;
                    }
                    else {
                        result.push({
                            from: lastPos,
                            count: e.pos - lastPos,
                            style,
                        });
                    }
                }
                if (e.type === "start") {
                    let lo = 0, hi = active.length;
                    while (lo < hi) {
                        const mid = (lo + hi) >> 1;
                        if (active[mid].priority < e.range.priority)
                            lo = mid + 1;
                        else
                            hi = mid;
                    }
                    active.splice(lo, 0, e.range);
                }
                else {
                    const idx = active.indexOf(e.range);
                    if (idx >= 0)
                        active.splice(idx, 1);
                }
                lastPos = e.pos;
            }
            return result;
        }
        class TextStyleBuilder {
            items = [];
            rule(rule, style) {
                this.items.push({ rule, style });
                return this;
            }
        }
        function toRegExp(m) {
            if (typeof m === "string") {
                const r = CHAR_CLASS_REGISTRY[m];
                if (!r)
                    throw new Error(`Unsupported CharClass: ${m}`);
                return r.re;
            }
            else if (CharClass.isCharClass(m)) {
                return m.re;
            }
            else if (m instanceof RegExp) {
                return m;
            }
            throw new Error(`Unsupported CharClass: ${m}`);
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
                const res = Array.isArray(cls) ? cls.flatMap(toRegExp) : [toRegExp(cls)].flat();
                return res.map(re0 => {
                    const flags = re0.flags.includes("y") ? re0.flags : re0.flags + "y";
                    return new RegExp(re0.source, flags);
                });
            });
            const ranges = [];
            let i = 0;
            while (i < text.length) {
                let matchedIndex = -1;
                let matchLength = 1;
                for (let idx = 0; idx < rules.length; idx++) {
                    const res = rules[idx];
                    for (const re of res) {
                        re.lastIndex = i;
                        const m = re.exec(text);
                        if (m) {
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
        class CharClassTextStyleBuilder extends TextStyleBuilder {
            options;
            constructor(options) {
                super();
                this.options = { mode: "overlap", ...options };
            }
            resolve(text) {
                let result = [];
                if (this.options.mode === "exclusive") {
                    const ranges = annotateByCharClassExclusive(text, this.items.map(item => item.rule));
                    for (const { from, count, index } of ranges) {
                        if (index < 0) {
                            continue;
                        }
                        result.push({ from, count, style: this.items[index].style });
                    }
                }
                else {
                    for (const { rule, style } of this.items) {
                        const ranges = annotateByCharClassOverlay(text, rule);
                        for (const { from, count } of ranges) {
                            result.push({ from, count, style });
                        }
                    }
                }
                return result;
            }
        }
        function annotateByRegExp(text, res) {
            const regexList = Array.isArray(res) ? res : [res];
            const ranges = [];
            for (const re of regexList) {
                const regex = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
                let match;
                while ((match = regex.exec(text)) !== null) {
                    if (match[0].length === 0) {
                        regex.lastIndex++;
                        continue;
                    }
                    if (match.length > 1) {
                        for (let i = 1; i < match.length; i++) {
                            if (match[i] == null)
                                continue;
                            const start = match.index + match[0].indexOf(match[i]);
                            const length = match[i].length;
                            ranges.push({ from: start, count: length });
                        }
                    }
                    else {
                        ranges.push({ from: match.index, count: match[0].length });
                    }
                }
            }
            return mergeRanges(ranges);
        }
        class RegExpTextStyleBuilder extends TextStyleBuilder {
            resolve(text) {
                let result = [];
                for (const { rule, style } of this.items) {
                    const ranges = annotateByRegExp(text, rule);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style: style });
                    }
                }
                return result;
            }
        }
        function createSearchRegExp(source, options) {
            const { caseSensitive } = options;
            const escape = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = Array.isArray(source) ? source.map(escape).join('|') : escape(source);
            const flags = caseSensitive ? '' : 'i';
            return new RegExp(pattern, flags);
        }
        class SearchTextStyleBuilder extends TextStyleBuilder {
            options;
            constructor(options) {
                super();
                this.options = { caseSensitive: true, ...options };
            }
            resolve(text) {
                let result = [];
                for (const { rule, style } of this.items) {
                    const ranges = annotateByRegExp(text, createSearchRegExp(rule, this.options));
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                }
                return result;
            }
        }
        function convertGraphemeRangesForText(text, rules, skipWhen, line = 0) {
            const graphemes = [...graphemeSegmenter.segment(text)];
            const skip = createMatcher(skipWhen);
            const logicalToPhysical = [];
            const utf16Offsets = [];
            let offset = 0;
            graphemes.forEach((seg, physicalIndex) => {
                if (!skip(seg.segment)) {
                    logicalToPhysical.push(physicalIndex);
                }
                utf16Offsets.push(offset);
                offset += seg.segment.length;
            });
            utf16Offsets.push(offset);
            const result = [];
            for (const rule of rules) {
                let range = [];
                const interpretRule = (rule) => {
                    if (typeof rule === "number") {
                        if (rule < logicalToPhysical.length) {
                            const physical = logicalToPhysical[rule];
                            const fromUtf16 = utf16Offsets[physical];
                            const toUtf16 = utf16Offsets[physical + 1];
                            range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                        }
                    }
                    else if (typeof rule === "function") {
                        for (let logical = 0; logical < logicalToPhysical.length; logical++) {
                            if (rule(logical, line)) {
                                const physical = logicalToPhysical[logical];
                                const from = utf16Offsets[physical];
                                const to = utf16Offsets[physical + 1];
                                range.push({ from, count: to - from });
                            }
                        }
                        range = mergeRanges(range);
                    }
                    else {
                        const start = rule.from;
                        const end = rule.count != null ? Math.min(start + rule.count, logicalToPhysical.length) : logicalToPhysical.length;
                        for (let logical = start; logical < end; logical++) {
                            const physical = logicalToPhysical[logical];
                            const from = utf16Offsets[physical];
                            const to = utf16Offsets[physical + 1];
                            range.push({ from, count: to - from });
                        }
                    }
                };
                if (Array.isArray(rule)) {
                    rule.forEach(r => interpretRule(r));
                }
                else {
                    interpretRule(rule);
                }
                result.push(mergeRanges(range));
            }
            return result;
        }
        function convertGraphemeRangesByLine(text, rules, skipWhen) {
            const lineRanges = annotateByLine(text);
            const result = rules.map(() => []);
            for (let i = 0; i < lineRanges.length; i++) {
                const line = lineRanges[i];
                const lineText = text.slice(line.from, line.from + line.count);
                const perLine = convertGraphemeRangesForText(lineText, rules, skipWhen, i);
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
            options;
            constructor(options) {
                super();
                this.options = { mode: "absolute", skipWhen: null, ...options };
            }
            resolve(text) {
                let result = [];
                const rules = this.items.map(item => item.rule);
                const rangesList = this.options.mode === "line" ? convertGraphemeRangesByLine(text, rules, this.options.skipWhen) : convertGraphemeRangesForText(text, rules, this.options.skipWhen);
                for (let i = 0; i < this.items.length; i++) {
                    const style = this.items[i].style;
                    for (const { from, count } of rangesList[i]) {
                        result.push({ from, count, style });
                    }
                }
                return result;
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
            resolve(text) {
                let result = [];
                const lines = annotateByLine(text);
                const interpretRule = (rule, style) => {
                    const ranges = deriveRangesFromRangeRule(lines, rule);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                };
                for (const { rule, style } of this.items) {
                    if (Array.isArray(rule)) {
                        rule.forEach(r => interpretRule(r, style));
                    }
                    else {
                        interpretRule(rule, style);
                    }
                }
                return result;
            }
        }
        function annotateBySurrounding(text, open, close) {
            const entries = [];
            let blockCounter = 0;
            const stack = [];
            for (let i = 0; i < text.length; i++) {
                if (text.startsWith(open, i)) {
                    if (stack.length === 0)
                        blockCounter++;
                    const depth = stack.length + 1;
                    const blockId = blockCounter;
                    stack.push({ open: i, depth, blockId });
                    i += open.length - 1;
                }
                else if (text.startsWith(close, i)) {
                    const last = stack.pop();
                    if (last) {
                        entries.push({
                            open: last.open,
                            close: i,
                            depth: last.depth,
                            blockId: last.blockId,
                        });
                    }
                    i += close.length - 1;
                }
            }
            if (entries.length === 0)
                return [];
            const blocks = new Map();
            for (const e of entries) {
                const b = blocks.get(e.blockId);
                if (b)
                    b.push(e);
                else
                    blocks.set(e.blockId, [e]);
            }
            const result = [];
            for (const block of blocks.values()) {
                const minDepth = Math.min(...block.map(e => e.depth));
                const normalized = block.map(e => ({
                    ...e,
                    depth: e.depth - minDepth + 1,
                }));
                const maxDepth = Math.max(...normalized.map(e => e.depth));
                normalized
                    .sort((a, b) => a.depth - b.depth) // outer → inner
                    .forEach(e => {
                    result.push({
                        from: e.open,
                        count: e.close + close.length - e.open,
                        depth: e.depth,
                        maxDepth,
                    });
                });
            }
            return result;
        }
        function normalizeSurroundingRule(rule, defaultTarget) {
            if (typeof rule === "number") {
                return { depths: [rule], target: defaultTarget };
            }
            if (Array.isArray(rule)) {
                return { depths: rule, target: defaultTarget };
            }
            return {
                depths: Array.isArray(rule.depth) ? rule.depth : [rule.depth],
                target: rule.target ?? defaultTarget,
            };
        }
        function normalizeDepth(depth, maxDepth) {
            const d = depth < 0 ? maxDepth + depth + 1 : depth;
            if (d < 1 || d > maxDepth)
                return null;
            return d;
        }
        function expandTarget(range, target, openLen, closeLen) {
            const { from, count } = range;
            const end = from + count;
            const openStart = from;
            const openEnd = from + openLen;
            const closeStart = end - closeLen;
            const closeEnd = end;
            const contentStart = openEnd;
            const contentEnd = closeStart;
            switch (target) {
                case "all":
                    return [{ from, count }];
                case "content":
                    return [{ from: contentStart, count: contentEnd - contentStart }];
                case "delimiter":
                    return [{ from: openStart, count: openLen }, { from: closeStart, count: closeLen },];
                case "open":
                    return [{ from: openStart, count: openLen }];
                case "close":
                    return [{ from: closeStart, count: closeLen }];
            }
        }
        function compileSurroundingRule(rule, defaultTarget, openLen, closeLen) {
            const normalized = normalizeSurroundingRule(rule, defaultTarget);
            return (range) => {
                const hits = normalized.depths
                    .map(d => normalizeDepth(d, range.maxDepth))
                    .filter((d) => d !== null);
                if (!hits.includes(range.depth))
                    return [];
                return expandTarget(range, normalized.target, openLen, closeLen);
            };
        }
        class SurroundingTextStyleBuilder extends TextStyleBuilder {
            open;
            close;
            options;
            constructor(open, close, options) {
                super();
                this.open = open;
                this.close = close;
                this.options = { defaultTarget: "content", ...options };
            }
            resolve(text) {
                let result = [];
                const rules = this.items.map(item => item.rule).map(r => compileSurroundingRule(r, this.options.defaultTarget, this.open.length, this.close.length));
                const surroudnings = annotateBySurrounding(text, this.open, this.close);
                for (let i = 0; i < this.items.length; i++) {
                    const rule = rules[i];
                    const style = this.items[i].style;
                    for (const surrounding of surroudnings) {
                        rule(surrounding).forEach(({ from, count }) => {
                            result.push({ from, count, style });
                        });
                    }
                }
                return result;
            }
        }
        function isLineBreak(g) {
            return g === "\n" || g === "\r" || g === "\r\n";
        }
        function updateContext(ctx, data) {
            Object.assign(ctx, data);
        }
        function segmentTextByGrapheme(text) {
            const graphemes = [...graphemeSegmenter.segment(text)];
            const lines = [];
            let lineStart = 0;
            let lineIndex = 0;
            graphemes.forEach((seg, i) => {
                if (isLineBreak(seg.segment)) {
                    const count = i - lineStart + 1;
                    lines.push({
                        index: lineIndex,
                        from: lineStart,
                        count,
                        includeLB: true,
                    });
                    lineIndex++;
                    lineStart = i + 1;
                }
            });
            // last line
            if (lineStart < graphemes.length) {
                lines.push({
                    index: lineIndex,
                    from: lineStart,
                    count: graphemes.length - lineStart,
                    includeLB: false,
                });
            }
            return { graphemes, lines };
        }
        function processGrapheme(text, rules) {
            const { graphemes, lines } = segmentTextByGrapheme(text);
            const results = rules.map(() => []);
            const contexts = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                itemsInLine: 0,
                includeLB: false,
                total: 0,
                totalLines: 0,
                graphemeAt: (index) => {
                    if (index < 0 || index >= graphemes.length)
                        return null;
                    return graphemes[index].segment;
                },
                prev: () => null,
                prevInLine: () => null,
                next: () => null,
                nextInLine: () => null,
                peek: () => null,
                peekInLine: () => null,
                isFirst: () => false,
                isFirstOfLine: () => false,
                isLast: () => false,
                isLastOfLine: () => false,
                state: rule.initState(graphemes.length, lines.length),
            }));
            let line = 0;
            let lineInfo = lines[0];
            graphemes.forEach((seg, globalIndex) => {
                if (globalIndex >= lineInfo.from + lineInfo.count) {
                    line++;
                    lineInfo = lines[line];
                }
                const g = seg.segment;
                const from = seg.index;
                const count = g.length;
                const indexInLine = globalIndex - lineInfo.from;
                const prev = (skipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    for (let i = globalIndex - 1; i >= 0; i--) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const prevInLine = (skipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    for (let i = globalIndex - 1; i >= lineInfo.from; i--) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const next = (skipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    for (let i = globalIndex + 1; i < graphemes.length; i++) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const nextInLine = (skipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    const lineEnd = lineInfo.from + lineInfo.count;
                    for (let i = globalIndex + 1; i < lineEnd; i++) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const peek = (offset, skipWhen = null) => {
                    offset |= 0;
                    if (offset === 0)
                        return g;
                    const skip = createMatcher(skipWhen);
                    const step = offset < 0 ? -1 : 1;
                    let remain = Math.abs(offset);
                    for (let i = globalIndex + step; i >= 0 && i < graphemes.length; i += step) {
                        if (skip(graphemes[i].segment))
                            continue;
                        if (--remain === 0)
                            return graphemes[i].segment;
                    }
                    return null;
                };
                const peekInLine = (offset, skipWhen = null) => {
                    offset |= 0;
                    if (offset === 0)
                        return g;
                    const skip = createMatcher(skipWhen);
                    const step = offset < 0 ? -1 : 1;
                    const lineStart = lineInfo.from;
                    const lineEnd = lineInfo.from + lineInfo.count;
                    let remain = Math.abs(offset);
                    for (let i = globalIndex + step; i >= lineStart && i < lineEnd; i += step) {
                        if (skip(graphemes[i].segment))
                            continue;
                        if (--remain === 0)
                            return graphemes[i].segment;
                    }
                    return null;
                };
                const isFirst = (skipWhen = null) => {
                    if (globalIndex === 0)
                        return true;
                    return prev(skipWhen) === null;
                };
                const isLast = (skipWhen = null) => {
                    if (globalIndex === graphemes.length - 1)
                        return true;
                    return next(skipWhen) === null;
                };
                const isFirstOfLine = (skipWhen = null) => {
                    if (indexInLine === 0)
                        return true;
                    return prevInLine(skipWhen) === null;
                };
                const isLastOfLine = (skipWhen = null) => {
                    if (indexInLine === lineInfo.count - 1)
                        return true;
                    return nextInLine(skipWhen) === null;
                };
                rules.forEach((rule, i) => {
                    const ctx = contexts[i];
                    updateContext(ctx, {
                        index: globalIndex,
                        line,
                        indexInLine,
                        itemsInLine: lineInfo.count,
                        includeLB: lineInfo.includeLB,
                        total: graphemes.length,
                        totalLines: lines.length,
                        prev,
                        prevInLine,
                        next,
                        nextInLine,
                        peek,
                        peekInLine,
                        isFirst,
                        isFirstOfLine,
                        isLast,
                        isLastOfLine,
                    });
                    if (rule.match(g, ctx)) {
                        results[i].push({ from, count });
                    }
                });
            });
            return results.map(mergeRanges);
        }
        class GraphemeTextStyleBuilder extends TextStyleBuilder {
            resolve(text) {
                let result = [];
                const rules = this.items.map(item => item.rule).map(rule => typeof rule === "function" ? { match: rule, initState: () => ({}) } : rule);
                const rangesList = processGrapheme(text, rules);
                for (let i = 0; i < this.items.length; i++) {
                    const ranges = rangesList[i];
                    const style = this.items[i].style;
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                }
                return result;
            }
        }
        function segmentTextByWord(text, locale) {
            const segmenter = getWordSegmenter(locale);
            const words = [...segmenter.segment(text)];
            const lines = [];
            let lineStart = 0;
            let lineIndex = 0;
            words.forEach((seg, i) => {
                if (isLineBreak(seg.segment)) {
                    const count = i - lineStart + 1;
                    lines.push({
                        index: lineIndex,
                        from: lineStart,
                        count,
                        includeLB: true,
                    });
                    lineIndex++;
                    lineStart = i + 1;
                }
            });
            // last line
            if (lineStart < words.length) {
                lines.push({
                    index: lineIndex,
                    from: lineStart,
                    count: words.length - lineStart,
                    includeLB: false,
                });
            }
            return { words, lines };
        }
        function applyRange(output, range, globalFrom, localLength) {
            const apply = (r) => {
                const localFrom = Math.max(0, r.from | 0);
                if (localFrom >= localLength)
                    return;
                const localCount = typeof r.count === "number" ? Math.min(localLength - localFrom, r.count | 0) : localLength - localFrom;
                if (localCount > 0) {
                    output.push(Object.assign({}, r, { from: globalFrom + localFrom, count: localCount, }));
                }
            };
            Array.isArray(range) ? range.forEach(apply) : apply(range);
        }
        function processWord(locale, text, rules) {
            const { words, lines } = segmentTextByWord(text, locale);
            const results = rules.map(() => []);
            const contexts = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                itemsInLine: 0,
                includeLB: false,
                total: 0,
                totalLines: 0,
                graphemes: () => [],
                wordAt: (index) => {
                    if (index < 0 || index >= words.length)
                        return null;
                    return words[index].segment;
                },
            }));
            let line = 0;
            let lineInfo = lines[0];
            words.forEach((seg, globalIndex) => {
                if (globalIndex >= lineInfo.from + lineInfo.count) {
                    line++;
                    lineInfo = lines[line];
                }
                const w = seg.segment;
                const from = seg.index;
                const count = w.length;
                const indexInLine = globalIndex - lineInfo.from;
                const graphemes = () => {
                    return [...graphemeSegmenter.segment(w)].map(s => s.segment);
                };
                rules.forEach((rule, i) => {
                    const ctx = contexts[i];
                    updateContext(ctx, {
                        index: globalIndex,
                        line,
                        indexInLine,
                        itemsInLine: lineInfo.count,
                        includeLB: lineInfo.includeLB,
                        total: words.length,
                        totalLines: lines.length,
                        graphemes,
                    });
                    const r = rule(w, ctx);
                    if (r) {
                        applyRange(results[i], r, from, count);
                    }
                });
            });
            return results.map(mergeRanges);
        }
        class WordTextStyleBuilder extends TextStyleBuilder {
            locale;
            constructor(locale) {
                super();
                this.locale = locale;
            }
            resolve(text) {
                let result = [];
                const rangesList = processWord(this.locale, text, this.items.map(item => item.rule));
                for (let i = 0; i < this.items.length; i++) {
                    const ranges = rangesList[i];
                    const style = this.items[i].style;
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                }
                return result;
            }
        }
        function containsLineBreak(text) {
            return /\r\n|\r|\n/.test(text);
        }
        function segmentTextBySentence(text, locale) {
            const segmenter = getSentenceSegmenter(locale);
            const sentences = [...segmenter.segment(text)];
            const lines = [];
            let lineStart = 0;
            let lineIndex = 0;
            sentences.forEach((seg, i) => {
                if (containsLineBreak(seg.segment)) {
                    const count = i - lineStart + 1;
                    lines.push({
                        index: lineIndex,
                        from: lineStart,
                        count,
                        includeLB: true,
                    });
                    lineIndex++;
                    lineStart = i + 1;
                }
            });
            // last line
            if (lineStart < sentences.length) {
                lines.push({
                    index: lineIndex,
                    from: lineStart,
                    count: sentences.length - lineStart,
                    includeLB: false,
                });
            }
            return { sentences, lines };
        }
        function processSentence(locale, text, rules) {
            const { sentences, lines } = segmentTextBySentence(text, locale);
            const results = rules.map(() => []);
            const contexts = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                itemsInLine: 0,
                includeLB: false,
                total: 0,
                totalLines: 0,
                sentenceAt: (index) => {
                    if (index < 0 || index >= sentences.length)
                        return null;
                    return sentences[index].segment;
                },
            }));
            let line = 0;
            let lineInfo = lines[0];
            sentences.forEach((seg, globalIndex) => {
                if (globalIndex >= lineInfo.from + lineInfo.count) {
                    line++;
                    lineInfo = lines[line];
                }
                const s = seg.segment;
                const from = seg.index;
                const count = s.length;
                const indexInLine = globalIndex - lineInfo.from;
                rules.forEach((rule, i) => {
                    const ctx = contexts[i];
                    updateContext(ctx, {
                        index: globalIndex,
                        line,
                        indexInLine,
                        itemsInLine: lineInfo.count,
                        includeLB: lineInfo.includeLB,
                        total: sentences.length,
                        totalLines: lines.length,
                    });
                    const r = rule(s, ctx);
                    if (r) {
                        applyRange(results[i], r, from, count);
                    }
                });
            });
            return results.map(mergeRanges);
        }
        class SentenceTextStyleBuilder extends TextStyleBuilder {
            locale;
            constructor(locale) {
                super();
                this.locale = locale;
            }
            resolve(text) {
                let result = [];
                const rangesList = processSentence(this.locale, text, this.items.map(item => item.rule));
                for (let i = 0; i < this.items.length; i++) {
                    const ranges = rangesList[i];
                    const style = this.items[i].style;
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                }
                return result;
            }
        }
        class TextStyleResolver {
        }
        class ForEachLine extends TextStyleResolver {
            fn;
            constructor(fn) {
                super();
                this.fn = fn;
            }
            resolve(text) {
                let result = [];
                const lines = annotateByLine(text);
                const fn = this.fn;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const res = fn(text.slice(line.from, line.from + line.count), i, lines.length);
                    if (res) {
                        result.push({ from: line.from, count: line.count, style: res });
                    }
                }
                return result;
            }
        }
        class ForEachGrapheme extends TextStyleResolver {
            fn;
            options;
            constructor(fn, options) {
                super();
                this.fn = fn;
                this.options = { initState: () => ({}), ...options };
            }
            resolve(text) {
                let result = [];
                const { graphemes, lines } = segmentTextByGrapheme(text);
                const ctx = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    itemsInLine: 0,
                    includeLB: false,
                    total: 0,
                    totalLines: 0,
                    graphemeAt: (index) => {
                        if (index < 0 || index >= graphemes.length)
                            return null;
                        return graphemes[index].segment;
                    },
                    prev: () => null,
                    prevInLine: () => null,
                    next: () => null,
                    nextInLine: () => null,
                    peek: () => null,
                    peekInLine: () => null,
                    isFirst: () => false,
                    isFirstOfLine: () => false,
                    isLast: () => false,
                    isLastOfLine: () => false,
                    state: this.options.initState(graphemes.length, lines.length),
                };
                const fn = this.fn;
                let line = 0;
                let lineInfo = lines[0];
                graphemes.forEach((seg, globalIndex) => {
                    if (globalIndex >= lineInfo.from + lineInfo.count) {
                        line++;
                        lineInfo = lines[line];
                    }
                    const g = seg.segment;
                    const from = seg.index;
                    const count = g.length;
                    const indexInLine = globalIndex - lineInfo.from;
                    const prev = (skipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        for (let i = globalIndex - 1; i >= 0; i--) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const prevInLine = (skipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        for (let i = globalIndex - 1; i >= lineInfo.from; i--) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const next = (skipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        for (let i = globalIndex + 1; i < graphemes.length; i++) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const nextInLine = (skipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        const lineEnd = lineInfo.from + lineInfo.count;
                        for (let i = globalIndex + 1; i < lineEnd; i++) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const peek = (offset, skipWhen = null) => {
                        offset |= 0;
                        if (offset === 0)
                            return g;
                        const skip = createMatcher(skipWhen);
                        const step = offset < 0 ? -1 : 1;
                        let remain = Math.abs(offset);
                        for (let i = globalIndex + step; i >= 0 && i < graphemes.length; i += step) {
                            if (skip(graphemes[i].segment))
                                continue;
                            if (--remain === 0)
                                return graphemes[i].segment;
                        }
                        return null;
                    };
                    const peekInLine = (offset, skipWhen = null) => {
                        offset |= 0;
                        if (offset === 0)
                            return g;
                        const skip = createMatcher(skipWhen);
                        const step = offset < 0 ? -1 : 1;
                        const lineStart = lineInfo.from;
                        const lineEnd = lineInfo.from + lineInfo.count;
                        let remain = Math.abs(offset);
                        for (let i = globalIndex + step; i >= lineStart && i < lineEnd; i += step) {
                            if (skip(graphemes[i].segment))
                                continue;
                            if (--remain === 0)
                                return graphemes[i].segment;
                        }
                        return null;
                    };
                    const isFirst = (skipWhen = null) => {
                        if (globalIndex === 0)
                            return true;
                        return prev(skipWhen) === null;
                    };
                    const isLast = (skipWhen = null) => {
                        if (globalIndex === graphemes.length - 1)
                            return true;
                        return next(skipWhen) === null;
                    };
                    const isFirstOfLine = (skipWhen = null) => {
                        if (indexInLine === 0)
                            return true;
                        return prevInLine(skipWhen) === null;
                    };
                    const isLastOfLine = (skipWhen = null) => {
                        if (indexInLine === lineInfo.count - 1)
                            return true;
                        return nextInLine(skipWhen) === null;
                    };
                    updateContext(ctx, {
                        index: globalIndex,
                        line,
                        indexInLine,
                        itemsInLine: lineInfo.count,
                        includeLB: lineInfo.includeLB,
                        total: graphemes.length,
                        totalLines: lines.length,
                        prev,
                        prevInLine,
                        next,
                        nextInLine,
                        peek,
                        peekInLine,
                        isFirst,
                        isFirstOfLine,
                        isLast,
                        isLastOfLine,
                    });
                    const ret = fn(g, ctx);
                    if (ret) {
                        result.push({ from, count, style: ret });
                    }
                });
                return result;
            }
        }
        class ForEachWord extends TextStyleResolver {
            fn;
            options;
            constructor(fn, options) {
                super();
                this.fn = fn;
                this.options = { locale: DEFAULT_LOCALE, ...options };
            }
            resolve(text) {
                let result = [];
                const { words, lines } = segmentTextByWord(text, this.options.locale);
                const ctx = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    itemsInLine: 0,
                    includeLB: false,
                    total: 0,
                    totalLines: 0,
                    graphemes: () => [],
                    wordAt: (index) => {
                        if (index < 0 || index >= words.length)
                            return null;
                        return words[index].segment;
                    },
                };
                const fn = this.fn;
                let line = 0;
                let lineInfo = lines[0];
                words.forEach((seg, globalIndex) => {
                    if (globalIndex >= lineInfo.from + lineInfo.count) {
                        line++;
                        lineInfo = lines[line];
                    }
                    const w = seg.segment;
                    const from = seg.index;
                    const count = w.length;
                    const indexInLine = globalIndex - lineInfo.from;
                    const graphemes = () => {
                        return [...graphemeSegmenter.segment(w)].map(s => s.segment);
                    };
                    updateContext(ctx, {
                        index: globalIndex,
                        line,
                        indexInLine,
                        itemsInLine: lineInfo.count,
                        includeLB: lineInfo.includeLB,
                        total: words.length,
                        totalLines: lines.length,
                        graphemes,
                    });
                    const r = fn(w, ctx);
                    if (r) {
                        applyRange(result, r, from, count);
                    }
                });
                return result;
            }
        }
        class ForEachSentence extends TextStyleResolver {
            fn;
            options;
            constructor(fn, options) {
                super();
                this.fn = fn;
                this.options = { locale: DEFAULT_LOCALE, ...options };
            }
            resolve(text) {
                let result = [];
                const { sentences, lines } = segmentTextBySentence(text, this.options.locale);
                const ctx = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    itemsInLine: 0,
                    includeLB: false,
                    total: 0,
                    totalLines: 0,
                    sentenceAt: (index) => {
                        if (index < 0 || index >= sentences.length)
                            return null;
                        return sentences[index].segment;
                    },
                };
                const fn = this.fn;
                let line = 0;
                let lineInfo = lines[0];
                sentences.forEach((seg, globalIndex) => {
                    if (globalIndex >= lineInfo.from + lineInfo.count) {
                        line++;
                        lineInfo = lines[line];
                    }
                    const w = seg.segment;
                    const from = seg.index;
                    const count = w.length;
                    const indexInLine = globalIndex - lineInfo.from;
                    updateContext(ctx, {
                        index: globalIndex,
                        line,
                        indexInLine,
                        itemsInLine: lineInfo.count,
                        includeLB: lineInfo.includeLB,
                        total: sentences.length,
                        totalLines: lines.length,
                    });
                    const r = fn(w, ctx);
                    if (r) {
                        applyRange(result, r, from, count);
                    }
                });
                return result;
            }
        }
        class ForEachRegExp extends TextStyleResolver {
            re;
            fn;
            constructor(re, fn) {
                super();
                this.re = re;
                this.fn = fn;
            }
            resolve(text) {
                let result = [];
                const patterns = Array.isArray(this.re) ? this.re : [this.re];
                const regexes = patterns.map((r, i) => ({
                    id: i,
                    re: new RegExp(r.source, r.flags.includes("g") ? r.flags : r.flags + "g"),
                    match: null,
                }));
                const fn = this.fn;
                let cursor = 0;
                let index = 0;
                const refreshMatches = () => {
                    for (let i = regexes.length - 1; i >= 0; i--) {
                        const rx = regexes[i];
                        rx.re.lastIndex = cursor;
                        rx.match = rx.re.exec(text);
                        if (!rx.match)
                            regexes.splice(i, 1);
                    }
                };
                refreshMatches();
                while (regexes.length > 0) {
                    let bestIndex = -1;
                    let bestPos = Infinity;
                    let bestId = Infinity;
                    for (let i = 0; i < regexes.length; i++) {
                        const m = regexes[i].match;
                        const pos = m.index;
                        if (pos < bestPos || (pos === bestPos && regexes[i].id < bestId)) {
                            bestPos = pos;
                            bestId = regexes[i].id;
                            bestIndex = i;
                        }
                    }
                    if (bestIndex === -1)
                        break;
                    const chosen = regexes[bestIndex];
                    const match = chosen.match;
                    const from = match.index;
                    const count = match[0].length;
                    const r = fn(match, { index, patternIndex: chosen.id });
                    ++index;
                    if (r) {
                        applyRange(result, r, from, count);
                    }
                    const advance = match[0].length > 0 ? match[0].length : 1;
                    cursor = match.index + advance;
                    refreshMatches();
                }
                return result;
            }
        }
        class ForEachSurrounding extends TextStyleResolver {
            open;
            close;
            fn;
            constructor(open, close, fn) {
                super();
                this.open = open;
                this.close = close;
                this.fn = fn;
            }
            resolve(text) {
                let result = [];
                const surroudnings = annotateBySurrounding(text, this.open, this.close);
                const fn = this.fn;
                surroudnings.forEach(({ from, count, depth, maxDepth }, globalIndex) => {
                    const r = fn(text.substring(from, from + count), { depth, maxDepth });
                    if (r) {
                        applyRange(result, r, from, count);
                    }
                });
                return result;
            }
        }
        class TextStyleContext {
            globalStyle;
            builders = [];
            constructor(globalStyle = {}) {
                this.globalStyle = globalStyle;
            }
            transforms = [];
            transform(fn) {
                this.transforms.push(fn);
                return this;
            }
            rule(rule, style) {
                const builder = this.builders[this.builders.length - 1];
                if (builder instanceof TextStyleBuilder) {
                    builder.rule(rule, style);
                }
                return this;
            }
            byCharClass(options) {
                this.builders.push(new CharClassTextStyleBuilder(options));
                return this;
            }
            byRegExp() {
                this.builders.push(new RegExpTextStyleBuilder());
                return this;
            }
            bySearch(options) {
                this.builders.push(new SearchTextStyleBuilder(options));
                return this;
            }
            byPosition(options) {
                this.builders.push(new PositionTextStyleBuilder(options));
                return this;
            }
            byLine() {
                this.builders.push(new LineTextStyleBuilder());
                return this;
            }
            bySurrounding(open, close, options) {
                this.builders.push(new SurroundingTextStyleBuilder(open, close, options));
                return this;
            }
            byGrapheme() {
                this.builders.push(new GraphemeTextStyleBuilder());
                return this;
            }
            byWord(locale) {
                this.builders.push(new WordTextStyleBuilder(locale));
                return this;
            }
            bySentence(locale) {
                this.builders.push(new SentenceTextStyleBuilder(locale));
                return this;
            }
            forEachLine(fn) {
                this.builders.push(new ForEachLine(fn));
                return this;
            }
            forEachGrapheme(fn, options) {
                this.builders.push(new ForEachGrapheme(fn, options));
                return this;
            }
            forEachWord(fn, options) {
                this.builders.push(new ForEachWord(fn, options));
                return this;
            }
            forEachSentence(fn, options) {
                this.builders.push(new ForEachSentence(fn, options));
                return this;
            }
            forEachRegExp(re, fn) {
                this.builders.push(new ForEachRegExp(re, fn));
                return this;
            }
            forEachSurrounding(open, close, fn) {
                this.builders.push(new ForEachSurrounding(open, close, fn));
                return this;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                // transform
                const original = property.value;
                const text = this.transforms.reduce((acc, fn) => fn(acc, { original }), original);
                if (this.transforms.length && text !== original) {
                    style = replaceText(style, text);
                }
                // global
                for (const field in this.globalStyle) {
                    style = applyTextStyleAll(text, style, field, this.globalStyle[field]);
                }
                // local
                for (const { from, count, style: st } of normalizeRanges(this.resolve(text))) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
            resolve(text) {
                let result = [];
                this.builders.forEach(builder => result.push(...builder.resolve(text)));
                return result;
            }
        }
        const lib = {
            CharClass: CHAR_CLASS_REGISTRY,
            createMatcher,
            TextStyle: (globalStyle) => new TextStyleContext(globalStyle),
            __internal: {
                annotateByCharClass: annotateByCharClassExclusive
            },
        };
        LIB.text = lib;
        return lib;
    },
})
