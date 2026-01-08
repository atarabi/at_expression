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
        const CHAR_CLASS_REGISTRY = {
            Hiragana: new CharClass("Hiragana", /\p{Script=Hiragana}/u),
            Katakana: new CharClass("Hiragana", /\p{Script=Katakana}/u),
            Kanji: new CharClass("Kanji", /\p{Script=Han}/u),
            Japanese: new CharClass("Hiragana", /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー〆]/u),
            Han: new CharClass("Han", /\p{Script=Han}/u),
            Hangul: new CharClass("Hangul", /\p{Script=Hangul}/u),
            Latin: new CharClass("Latin", /\p{Script=Latin}/u),
            Greek: new CharClass("Greek", /\p{Script=Greek}/u),
            Cyrillic: new CharClass("Cyrillic", /\p{Script=Cyrillic}/u),
            Arabic: new CharClass("Arabic", /\p{Script=Arabic}/u),
            Hebrew: new CharClass("Hebrew", /\p{Script=Hebrew}/u),
            Armenian: new CharClass("Armenian", /\p{Script=Armenian}/u),
            Georgian: new CharClass("Georgian", /\p{Script=Georgian}/u),
            Devanagari: new CharClass("Devanagari", /\p{Script=Devanagari}/u),
            Bengali: new CharClass("Bengali", /\p{Script=Bengali}/u),
            Gurmukhi: new CharClass("Gurmukhi", /\p{Script=Gurmukhi}/u),
            Gujarati: new CharClass("Gujarati", /\p{Script=Gujarati}/u),
            Oriya: new CharClass("Oriya", /\p{Script=Oriya}/u),
            Tamil: new CharClass("Tamil", /\p{Script=Tamil}/u),
            Telugu: new CharClass("Telugu", /\p{Script=Telugu}/u),
            Kannada: new CharClass("Kannada", /\p{Script=Kannada}/u),
            Malayalam: new CharClass("Malayalam", /\p{Script=Malayalam}/u),
            Sinhala: new CharClass("Sinhala", /\p{Script=Sinhala}/u),
            Thai: new CharClass("Thai", /\p{Script=Thai}/u),
            Lao: new CharClass("Lao", /\p{Script=Lao}/u),
            Khmer: new CharClass("Khmer", /\p{Script=Khmer}/u),
            Myanmar: new CharClass("Myanmar", /\p{Script=Myanmar}/u),
            Ethiopic: new CharClass("Ethiopic", /\p{Script=Ethiopic}/u),
            LowercaseLetter: new CharClass("LowercaseLetter", /\p{Lowercase_Letter}/u),
            UppercaseLetter: new CharClass("UppercaseLetter", /\p{Uppercase_Letter}/u),
            ModifierLetter: new CharClass("ModifierLetter", /\p{Modifier_Letter}/u),
            Alphabetic: new CharClass("Alphabetic", /\p{Alphabetic}/u),
            Letter: new CharClass("Letter", /\p{Letter}/u),
            DecimalNumber: new CharClass("DecimalNumber", /\p{Decimal_Number}/u),
            Number: new CharClass("Number", /\p{Number}/u),
            Emoji: new CharClass("Emoji", /\p{Extended_Pictographic}/u),
            Symbol: new CharClass("Symbol", /\p{Symbol}/u),
            Punctuation: new CharClass("Punctuation", /\p{Punctuation}/u),
            Control: new CharClass("Control", /\p{Control}/u),
            SpaceSeparator: new CharClass("SpaceSeparator", /\p{Space_Separator}/u),
            Separator: new CharClass("Separator", /\p{Separator}/u),
            Yakumono: new CharClass("Yakumono", /[、。，．・：；？！…―ー〜～「」『』（）［］｛｝〈〉《》【】]/),
            Whitespace: new CharClass("Whitespace", /\s/u),
            InlineWhitespace: new CharClass("InlineWhitespace", /[\p{Zs}\t]/u),
            LineBreak: new CharClass("LineBreak", /(?:\r\n|[\n\r\u0085\u2028\u2029])/u),
        };
        for (const cls of Object.values(CHAR_CLASS_REGISTRY)) {
            Object.freeze(cls);
        }
        Object.freeze(CHAR_CLASS_REGISTRY);
        function createMatcher(matchers) {
            if (!matchers) {
                return () => false;
            }
            let fns = [];
            const push_fn = (matcher) => {
                if (typeof matcher === "string") {
                    const charClass = CHAR_CLASS_REGISTRY[matcher];
                    if (charClass) {
                        fns.push(g => g !== null && charClass.test(g));
                    }
                    throw new Error(`Unknown CharClass Key: ${matcher}`);
                }
                else if (CharClass.isCharClass(matcher)) {
                    fns.push(g => g !== null && matcher.test(g));
                }
                else if (matcher instanceof RegExp) {
                    fns.push(g => g !== null && matcher.test(g));
                }
            };
            if (Array.isArray(matchers)) {
                matchers.forEach(when => push_fn(when));
            }
            else {
                push_fn(matchers);
            }
            if (fns.length === 0) {
                return () => false;
            }
            else if (fns.length === 1) {
                return fns[0];
            }
            else {
                return g => fns.some(f => f(g));
            }
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
        function applyTextStyleAll(property, style, field, value) {
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
                case "applyFill":
                    return style.setApplyFill(value);
                case "applyStroke":
                    return style.setApplyStroke(value);
                case "baselineDirection":
                    return style.setBaselineDirection(value);
                case "baselineOption":
                    return style.setBaselineOption(value);
                case "baselineShift":
                    return style.setBaselineShift(value);
                case "digitSet":
                    return style.setDigitSet(value);
                case "fillColor":
                    return style.setFillColor(value);
                case "font":
                    return style.setFont(value);
                case "fontSize":
                    return style.setFontSize(value);
                case "horizontalScaling":
                    return style.setHorizontalScaling(value);
                case "isAllCaps":
                    return style.setAllCaps(value);
                case "isAutoLeading":
                    return style.setAutoLeading(value);
                case "isFauxBold":
                    return style.setFauxBold(value);
                case "isFauxItalic":
                    return style.setFauxItalic(value);
                case "isLigature":
                    return style.setLigature(value);
                case "isSmallCaps":
                    return style.setSmallCaps(value);
                case "kerning":
                    for (let n = 0, numOfCharacters = property.value.length; n < numOfCharacters; n++) {
                        style = style.setKerning(value, n);
                    }
                    return style;
                case "kerningType":
                    return style.setKerningType(value);
                case "leading":
                    return style.setLeading(value);
                case "lineJoin":
                    return style.setLineJoin(value);
                case "strokeColor":
                    return style.setStrokeColor(value);
                case "strokeWidth":
                    return style.setStrokeWidth(value);
                case "tracking":
                    return style.setTracking(value);
                case "tsume":
                    return style.setTsume(value);
                case "verticalScaling":
                    return style.setVerticalScaling(value);
            }
            throw new Error(`Invalid field: ${field}`);
        }
        class AllTextStyleBuilder {
            style;
            constructor(style) {
                this.style = style;
            }
            apply(property = thisLayer.text.sourceText, style = property.style) {
                for (const field in this.style) {
                    style = applyTextStyleAll(property, style, field, this.style[field]);
                }
                return style;
            }
            resolve(text) {
                let result = [];
                const style = {};
                for (const field in this.style) {
                    switch (field) {
                        case "direction":
                        case "firstLineIndent":
                        case "isEveryLineComposer":
                        case "isHangingRoman":
                        case "justification":
                        case "leadingType":
                        case "leftMargin":
                        case "rightMargin":
                        case "spaceAfter":
                        case "spaceBefore":
                            break;
                        default:
                            style[field] = this.style[field];
                    }
                }
                result.push({ from: 0, count: text.length, style });
                return result;
            }
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
                    return style.setApplyFill(value, startIndex, numOfCharacters);
                case "applyStroke":
                    return style.setApplyStroke(value, startIndex, numOfCharacters);
                case "baselineDirection":
                    return style.setBaselineDirection(value, startIndex, numOfCharacters);
                case "baselineOption":
                    return style.setBaselineOption(value, startIndex, numOfCharacters);
                case "baselineShift":
                    return style.setBaselineShift(value, startIndex, numOfCharacters);
                case "digitSet":
                    return style.setDigitSet(value, startIndex, numOfCharacters);
                case "fillColor":
                    return style.setFillColor(value, startIndex, numOfCharacters);
                case "font":
                    return style.setFont(value, startIndex, numOfCharacters);
                case "fontSize":
                    return style.setFontSize(value, startIndex, numOfCharacters);
                case "horizontalScaling":
                    return style.setHorizontalScaling(value, startIndex, numOfCharacters);
                case "isAllCaps":
                    return style.setAllCaps(value, startIndex, numOfCharacters);
                case "isAutoLeading":
                    return style.setAutoLeading(value, startIndex, numOfCharacters);
                case "isFauxBold":
                    return style.setFauxBold(value, startIndex, numOfCharacters);
                case "isFauxItalic":
                    return style.setFauxItalic(value, startIndex, numOfCharacters);
                case "isLigature":
                    return style.setLigature(value, startIndex, numOfCharacters);
                case "isSmallCaps":
                    return style.setSmallCaps(value, startIndex, numOfCharacters);
                case "kerning":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setKerning(value, startIndex + n);
                    }
                    return style;
                case "kerningType":
                    return style.setKerningType(value, startIndex, numOfCharacters);
                case "leading":
                    return style.setLeading(value, startIndex, numOfCharacters);
                case "lineJoin":
                    return style.setLineJoin(value, startIndex, numOfCharacters);
                case "strokeColor":
                    return style.setStrokeColor(value, startIndex, numOfCharacters);
                case "strokeWidth":
                    return style.setStrokeWidth(value, startIndex, numOfCharacters);
                case "tracking":
                    return style.setTracking(value, startIndex, numOfCharacters);
                case "tsume":
                    return style.setTsume(value, startIndex, numOfCharacters);
                case "verticalScaling":
                    return style.setVerticalScaling(value, startIndex, numOfCharacters);
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
        function lowerBound(ranges, from) {
            let lo = 0;
            let hi = ranges.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                const r = ranges[mid];
                if (r.from + r.count <= from) {
                    lo = mid + 1;
                }
                else {
                    hi = mid;
                }
            }
            return lo;
        }
        function addNormalizedRange(ranges, incoming) {
            if (incoming.count <= 0)
                return;
            const inStart = incoming.from;
            const inEnd = incoming.from + incoming.count;
            let i = lowerBound(ranges, inStart);
            while (i < ranges.length) {
                const cur = ranges[i];
                const curStart = cur.from;
                const curEnd = cur.from + cur.count;
                if (curStart >= inEnd)
                    break;
                const overlapStart = Math.max(curStart, inStart);
                const overlapEnd = Math.min(curEnd, inEnd);
                const replaced = [];
                if (curStart < overlapStart) {
                    replaced.push({
                        from: curStart,
                        count: overlapStart - curStart,
                        style: cur.style,
                    });
                }
                replaced.push({
                    from: overlapStart,
                    count: overlapEnd - overlapStart,
                    style: { ...cur.style, ...incoming.style },
                });
                if (overlapEnd < curEnd) {
                    replaced.push({
                        from: overlapEnd,
                        count: curEnd - overlapEnd,
                        style: cur.style,
                    });
                }
                ranges.splice(i, 1, ...replaced);
                i += replaced.length;
            }
            if (i === lowerBound(ranges, inStart)) {
                ranges.splice(i, 0, incoming);
            }
        }
        function addNormalizedRanges(ranges, incoming) {
            for (const r of incoming) {
                addNormalizedRange(ranges, r);
            }
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
            apply(property = thisLayer.text.sourceText, style = property.style) {
                style = this.applyLayout(style);
                for (const { from, count, style: st } of this.resolve(property.value)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
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
            rules = [];
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
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text) {
                let result = [];
                if (this.doExclusive) {
                    const ranges = annotateByCharClassExclusive(text, this.rules);
                    for (const { from, count, index } of ranges) {
                        if (index < 0) {
                            continue;
                        }
                        result.push({ from, count, style: this.styles[index] });
                    }
                }
                else {
                    for (let i = 0; i < this.rules.length; i++) {
                        const ranges = annotateByCharClassOverlay(text, this.rules[i]);
                        for (const { from, count } of ranges) {
                            result.push({ from, count, style: this.styles[i] });
                        }
                    }
                    result = normalizeRanges(result);
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
            rules = [];
            styles = [];
            get defaultRule() {
                return /[\s\S]+/g;
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text) {
                let result = [];
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = annotateByRegExp(text, this.rules[i]);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style: this.styles[i] });
                    }
                }
                result = normalizeRanges(result);
                return result;
            }
        }
        function convertGraphemeRangesForText(text, rules, skipWhen, line = 0) {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
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
            rules = [];
            styles = [];
            doLine = false;
            when = null;
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
            skipWhen(when) {
                this.when = when;
                return this;
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text) {
                let result = [];
                const rangesList = this.doLine ? convertGraphemeRangesByLine(text, this.rules, this.when) : convertGraphemeRangesForText(text, this.rules, this.when);
                for (let i = 0; i < rangesList.length; i++) {
                    for (const { from, count } of rangesList[i]) {
                        result.push({ from, count, style: this.styles[i] });
                    }
                }
                result = normalizeRanges(result);
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
            resolve(text) {
                let result = [];
                const lines = annotateByLine(text);
                const interpretRule = (rule, style) => {
                    const ranges = deriveRangesFromRangeRule(lines, rule);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                };
                for (let i = 0; i < this.rules.length; i++) {
                    const rule = this.rules[i];
                    if (Array.isArray(rule)) {
                        rule.forEach(r => interpretRule(r, this.styles[i]));
                    }
                    else {
                        interpretRule(rule, this.styles[i]);
                    }
                }
                result = normalizeRanges(result);
                return result;
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
            resolve(text) {
                let result = [];
                const surroudnings = annotateBySurrounding(text, this.open, this.close, this.options);
                const interpretRule = (rule, style) => {
                    const ranges = deriveRangesFromRangeRule(surroudnings, rule);
                    for (const { from, count } of ranges) {
                        if (count <= 0) {
                            continue;
                        }
                        result.push({ from, count, style });
                    }
                };
                for (let i = 0; i < this.rules.length; i++) {
                    const rule = this.rules[i];
                    if (Array.isArray(rule)) {
                        rule.forEach(r => interpretRule(r, this.styles[i]));
                    }
                    else {
                        interpretRule(rule, this.styles[i]);
                    }
                }
                result = normalizeRanges(result);
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
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
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
            rules = [];
            styles = [];
            get defaultRule() {
                return () => true;
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
            resolve(text) {
                let result = [];
                const rangesList = processGrapheme(text, this.rules);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = rangesList[i];
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style: this.styles[i] });
                    }
                }
                result = normalizeRanges(result);
                return result;
            }
        }
        function segmentTextByWord(text, locale) {
            const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
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
            const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
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
            rules = [];
            styles = [];
            get defaultRule() {
                return () => ({ from: 0 });
            }
            constructor(locale) {
                super();
                this.locale = locale;
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text) {
                let result = [];
                const rangesList = processWord(this.locale, text, this.rules);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = rangesList[i];
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style: this.styles[i] });
                    }
                }
                result = normalizeRanges(result);
                return result;
            }
        }
        function containsLineBreak(text) {
            return /\r\n|\r|\n/.test(text);
        }
        function segmentTextBySentence(text, locale) {
            const segmenter = new Intl.Segmenter(locale, { granularity: "sentence" });
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
            rules = [];
            styles = [];
            get defaultRule() {
                return () => ({ from: 0 });
            }
            constructor(locale) {
                super();
                this.locale = locale;
            }
            addRule(rule, style) {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text) {
                let result = [];
                const rangesList = processSentence(this.locale, text, this.rules);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = rangesList[i];
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style: this.styles[i] });
                    }
                }
                result = normalizeRanges(result);
                return result;
            }
        }
        class TextStyleApplier {
            apply(property = thisLayer.text.sourceText, style = property.style) {
                for (const { from, count, style: st } of this.resolve(property.value)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
        }
        class ForEachLine extends TextStyleApplier {
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
        class ForEachGrapheme extends TextStyleApplier {
            fn;
            options;
            constructor(fn, options) {
                super();
                this.fn = fn;
                this.options = { ...{ iterations: 1, initState: () => ({}) }, ...options };
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
        class ForEachWord extends TextStyleApplier {
            fn;
            options;
            constructor(fn, options) {
                super();
                this.fn = fn;
                this.options = { ...{ locale: DEFAULT_LOCALE }, ...options };
            }
            resolve(text) {
                let result = [];
                const { words, lines } = segmentTextByWord(text);
                const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
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
                result = normalizeRanges(result);
                return result;
            }
        }
        class ForEachSentence extends TextStyleApplier {
            fn;
            options;
            constructor(fn, options) {
                super();
                this.fn = fn;
                this.options = { ...{ locale: DEFAULT_LOCALE }, ...options };
            }
            resolve(text) {
                let result = [];
                const { sentences, lines } = segmentTextBySentence(text);
                const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
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
                result = normalizeRanges(result);
                return result;
            }
        }
        class ForEachRegExp extends TextStyleApplier {
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
                result = normalizeRanges(result);
                return result;
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
                for (const { from, count, style: st } of this.resolve(property.value)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
            resolve(text) {
                let result = [];
                for (const builder of this.builders) {
                    if (result.length) {
                        addNormalizedRanges(result, builder.resolve(text));
                    }
                    else {
                        result = builder.resolve(text);
                    }
                }
                return result;
            }
        }
        const lib = {
            CharClass: CHAR_CLASS_REGISTRY,
            createMatcher,
            TextStyle: {
                all: (style) => new AllTextStyleBuilder(style),
                // static
                byCharClass: () => new CharClassTextStyleBuilder(),
                byRegExp: () => new RegExpTextStyleBuilder(),
                byPosition: () => new PositionTextStyleBuilder(),
                byLine: () => new LineTextStyleBuilder(),
                bySurrounding: (open, close, options) => new SurroundingTextStyleBuilder(open, close, options),
                byGrapheme: () => new GraphemeTextStyleBuilder(),
                byWord: (locale = DEFAULT_LOCALE) => new WordTextStyleBuilder(locale),
                bySentence: (locale = DEFAULT_LOCALE) => new SentenceTextStyleBuilder(locale),
                // dynamic
                forEachLine: (fn) => new ForEachLine(fn),
                forEachGrapheme: (fn, options) => new ForEachGrapheme(fn, options),
                forEachWord: (fn, options) => new ForEachWord(fn, options),
                forEachSentence: (fn, options) => new ForEachSentence(fn, options),
                forEachRegExp: (re, fn) => new ForEachRegExp(re, fn),
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
