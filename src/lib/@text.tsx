({
    load(force: boolean = false): Atarabi.text.Lib {

        const LIB = $.__lib = $.__lib || {};
        if (!force && LIB.text) {
            return LIB.text;
        }

        const DEFAULT_LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;

        type CharClassKey = Atarabi.text.CharClassKey;

        class CharClass implements Atarabi.text.CharClass {
            private _re: RegExp;
            constructor(private _name: string, re: RegExp) {
                this._re = Object.freeze(new RegExp(re.source, re.flags));
            }
            get name() { return this._name; }
            get re() { return this._re; }
            test(g: string) { return this._re.test(g); }
            static isCharClass(v: any): v is Atarabi.text.CharClass {
                return v instanceof CharClass;
            }
        }

        const CHAR_CLASS_DEFINITIONS: Record<CharClassKey, RegExp> = {
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

        const CHAR_CLASS_REGISTRY: Record<CharClassKey, CharClass> = (() => {
            const registry: any = {};
            for (const [key, re] of Object.entries(CHAR_CLASS_DEFINITIONS)) {
                registry[key] = Object.freeze(new CharClass(key, re));
            }
            return Object.freeze(registry) as Record<CharClassKey, CharClass>;
        })();

        type CharMatcher = Atarabi.text.CharMatcher;
        type CharMatchers = Atarabi.text.CharMatchers;

        function createMatcher(matchers?: CharMatchers): (g: string) => boolean {
            if (!matchers) return () => false;

            const items = Array.isArray(matchers) ? matchers : [matchers];
            const fns = items.map(m => {
                if (typeof m === "string") {
                    const cc = CHAR_CLASS_REGISTRY[m];
                    if (!cc) throw new Error(`Unknown CharClass: ${m}`);
                    return (g: string) => g !== null && cc.test(g);
                }
                if (CharClass.isCharClass(m)) return (g: string) => g !== null && m.test(g);
                if (m instanceof RegExp) return (g: string) => g !== null && m.test(g);
                return () => false;
            });

            return (g: string) => fns.some(p => p(g));
        }

        const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
        const wordSegmenterCache = new Map<string, Intl.Segmenter>();
        function getWordSegmenter(locale: string): Intl.Segmenter {
            if (!wordSegmenterCache.has(locale)) {
                wordSegmenterCache.set(locale, new Intl.Segmenter(locale, { granularity: "word" }));
            }
            return wordSegmenterCache.get(locale)!;
        }
        const sentenceSegmenterCache = new Map<string, Intl.Segmenter>();
        function getSentenceSegmenter(locale: string): Intl.Segmenter {
            if (!sentenceSegmenterCache.has(locale)) {
                sentenceSegmenterCache.set(locale, new Intl.Segmenter(locale, { granularity: "sentence" }));
            }
            return sentenceSegmenterCache.get(locale)!;
        }

        type Range = Atarabi.text.Range;
        type RangeWithStyle = Atarabi.text.RangeWithStyle;
        type RangeWithIndex = Range & { index: number; };

        function mergeRanges(ranges: Range[]): Range[] {
            if (ranges.length === 0) return [];

            const sorted = [...ranges].sort((a, b) => a.from - b.from);
            const result: Range[] = [sorted[0]];

            for (let i = 1; i < sorted.length; i++) {
                const prev = result[result.length - 1];
                const curr = sorted[i];

                const prevEnd = prev.from + prev.count;
                const currEnd = curr.from + curr.count;

                if (curr.from <= prevEnd) {
                    prev.count = Math.max(prevEnd, currEnd) - prev.from;
                } else {
                    result.push(curr);
                }
            }

            return result;
        }

        type TextLayout = Atarabi.text.TextLayout;
        type TextLayoutOptions = Atarabi.text.TextLayoutOptions;
        type TextStyle = Atarabi.text.TextStyle;
        type TextStyleOptions = Atarabi.text.TextStyleOptions;

        function replaceText(style: TextStyleProperty, text: string) {
            return style.replaceText(text);
        }

        type Methods<T> = {
            [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K]
        };

        const TEXT_STYLE_METHOD_MAP: Record<keyof TextLayout | keyof TextStyle, keyof Methods<TextStyleProperty>> = {
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

        function applyTextStyleUniversal(style: TextStyleProperty, field: string, value: any, startIndex?: number, count?: number): TextStyleProperty {
            const methodName = TEXT_STYLE_METHOD_MAP[field];
            if (!methodName) throw new Error(`Invalid field: ${field}`);

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
            const fn = (style as any)[methodName];
            if (typeof fn !== "function") throw new Error(`Invalid method: ${methodName}`);

            if (startIndex !== undefined && count !== undefined) {
                return fn.call(style, value, startIndex, count);
            } else {
                return fn.call(style, value);
            }
        }

        function applyTextStyleAll<FieldL extends keyof TextLayout, FieldS extends keyof TextStyle>(text: string, style: TextStyleProperty, field: FieldL | FieldS, value: TextLayout[FieldL] | TextStyle[FieldS]): TextStyleProperty {
            if (field === "kerning") {
                return applyTextStyleUniversal(style, field, value, 0, text.length);
            } else {
                return applyTextStyleUniversal(style, field, value);
            }
        }

        function applyStyle(style: TextStyleProperty, options: TextStyleOptions, startIndex: number, numOfCharacters: number): TextStyleProperty {
            for (const field in options) {
                if (Object.prototype.hasOwnProperty.call(options, field)) {
                    style = applyTextStyleUniversal(style, field, options[field], startIndex, numOfCharacters);
                }
            }
            return style;
        }

        function shallowEqual(a: any, b: any): boolean {
            if (a === b) return true;

            if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
                return false;
            }

            const ka = Object.keys(a);
            const kb = Object.keys(b);

            if (ka.length !== kb.length) return false;

            for (const k of ka) {
                if (!(k in b)) return false;

                const va = a[k];
                const vb = b[k];

                if (Array.isArray(va) && Array.isArray(vb)) {
                    if (va.length !== vb.length) return false;
                    for (let i = 0; i < va.length; i++) {
                        if (va[i] !== vb[i]) return false;
                    }
                    continue;
                }

                if (Array.isArray(va) || Array.isArray(vb)) {
                    return false;
                }

                if (va !== vb) return false;
            }

            return true;
        }

        function normalizeRanges(input: RangeWithStyle[]): RangeWithStyle[] {

            type Event = { pos: number; type: "start"; range: RangeWithPriority } | { pos: number; type: "end"; range: RangeWithPriority };

            interface RangeWithPriority {
                from: number;
                to: number;
                style: TextStyleOptions;
                priority: number;
            }

            if (input.length === 0) return [];

            const ranges: RangeWithPriority[] = input
                .filter(r => r.count > 0)
                .map((r, i) => ({
                    from: r.from,
                    to: r.from + r.count,
                    style: r.style,
                    priority: i,
                }));

            const events: Event[] = [];
            for (const r of ranges) {
                events.push({ pos: r.from, type: "start", range: r });
                events.push({ pos: r.to, type: "end", range: r });
            }

            events.sort((a, b) =>
                a.pos !== b.pos
                    ? a.pos - b.pos
                    : a.type === b.type
                        ? 0
                        : a.type === "end"
                            ? -1
                            : 1
            );

            const active: RangeWithPriority[] = [];
            const result: RangeWithStyle[] = [];

            let lastPos: number | null = null;

            for (const e of events) {
                if (lastPos !== null && lastPos < e.pos && active.length > 0) {
                    let style: TextStyleOptions = {};
                    for (const r of active) {
                        style = { ...style, ...r.style };
                    }

                    const last = result[result.length - 1];
                    if (last && last.from + last.count === lastPos && shallowEqual(last.style, style)) {
                        last.count += e.pos - lastPos;
                    } else {
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
                        if (active[mid].priority < e.range.priority) lo = mid + 1;
                        else hi = mid;
                    }
                    active.splice(lo, 0, e.range);
                } else {
                    const idx = active.indexOf(e.range);
                    if (idx >= 0) active.splice(idx, 1);
                }

                lastPos = e.pos;
            }

            return result;
        }

        abstract class TextStyleBuilder<Rule> implements Atarabi.text.TextStyleBuilder<Rule> {
            protected items: { rule: Rule; style: TextStyleOptions }[] = [];
            rule(rule: Rule, style: TextStyleOptions): this {
                this.items.push({ rule, style });
                return this;
            }
            abstract resolve(text: string): RangeWithStyle[];
        }

        type CharClassRule = Atarabi.text.CharClassRule;
        type CharClassOptions = Atarabi.text.CharClassOptions;

        function toRegExp(m: CharMatcher): RegExp | RegExp[] {
            if (typeof m === "string") {
                const r = CHAR_CLASS_REGISTRY[m as CharClassKey];
                if (!r) throw new Error(`Unsupported CharClass: ${m}`);
                return r.re;
            } else if (CharClass.isCharClass(m)) {
                return (m as CharClass).re;
            } else if (m instanceof RegExp) {
                return m;
            }
            throw new Error(`Unsupported CharClass: ${m}`);
        }

        function annotateByCharClassOverlay(text: string, charClass: CharMatcher | CharMatcher[]): Range[] {
            const res: RegExp[] = (() => {
                if (Array.isArray(charClass)) return charClass.flatMap(toRegExp);
                return [toRegExp(charClass)].flat();
            })();

            const ranges: Range[] = [];

            for (const re0 of res) {
                const flags = re0.flags.includes("g") ? re0.flags : re0.flags + "g";
                const re = new RegExp(re0.source, flags);

                let m: RegExpExecArray | null;
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

        function annotateByCharClassExclusive(text: string, charClasses: (CharMatcher | CharMatcher[])[]): RangeWithIndex[] {
            const rules: RegExp[][] = charClasses.map(cls => {
                const res = Array.isArray(cls) ? cls.flatMap(toRegExp) : [toRegExp(cls)].flat();
                return res.map(re0 => {
                    const flags = re0.flags.includes("y") ? re0.flags : re0.flags + "y";
                    return new RegExp(re0.source, flags);
                });
            });

            const ranges: RangeWithIndex[] = [];
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
                    if (matchedIndex !== -1) break;
                }

                if (matchedIndex === -1) {
                    let end = i + 1;
                    while (end < text.length) {
                        const anyMatch = rules.some(regexList =>
                            regexList.some(r => r.exec(text.slice(end))?.index === 0)
                        );
                        if (anyMatch) break;
                        end++;
                    }
                    matchLength = end - i;
                }

                const last = ranges[ranges.length - 1];
                if (last && last.index === matchedIndex) {
                    last.count += matchLength;
                } else {
                    ranges.push({ from: i, count: matchLength, index: matchedIndex });
                }

                i += matchLength;
            }

            return ranges;
        }

        class CharClassTextStyleBuilder extends TextStyleBuilder<CharClassRule> implements Atarabi.text.CharClassTextStyleBuilder {
            protected options: CharClassOptions;
            constructor(options?: CharClassOptions) {
                super();
                this.options = { mode: "overlap", ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                if (this.options.mode === "exclusive") {
                    const ranges = annotateByCharClassExclusive(text, this.items.map(item => item.rule));
                    for (const { from, count, index } of ranges) {
                        if (index < 0) {
                            continue;
                        }
                        result.push({ from, count, style: this.items[index].style });
                    }
                } else {
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

        function annotateByRegExp(text: string, res: RegExp | RegExp[]): Range[] {
            const regexList = Array.isArray(res) ? res : [res];
            const ranges: Range[] = [];

            for (const re of regexList) {
                const regex = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");

                let match: RegExpExecArray | null;
                while ((match = regex.exec(text)) !== null) {
                    if (match[0].length === 0) {
                        regex.lastIndex++;
                        continue;
                    }

                    if (match.length > 1) {
                        for (let i = 1; i < match.length; i++) {
                            if (match[i] == null) continue;
                            const start = match.index + match[0].indexOf(match[i]);
                            const length = match[i].length;
                            ranges.push({ from: start, count: length });
                        }
                    } else {
                        ranges.push({ from: match.index, count: match[0].length });
                    }
                }
            }

            return mergeRanges(ranges);
        }

        type RegExpRule = Atarabi.text.RegExpRule;

        class RegExpTextStyleBuilder extends TextStyleBuilder<RegExpRule> implements Atarabi.text.RegExpTextStyleBuilder {
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                for (const { rule, style } of this.items) {
                    const ranges = annotateByRegExp(text, rule);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style: style });
                    }
                }
                return result;
            }
        }

        type SearchRule = Atarabi.text.SearchRule;
        type SearchOptions = Atarabi.text.SearchOptions;

        function createSearchRegExp(source: string | string[], options: SearchOptions): RegExp {
            const { caseSensitive } = options;
            const escape = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = Array.isArray(source) ? source.map(escape).join('|') : escape(source);
            const flags = caseSensitive ? '' : 'i';
            return new RegExp(pattern, flags);
        }

        class SearchTextStyleBuilder extends TextStyleBuilder<SearchRule> implements Atarabi.text.SearchTextStyleBuilder {
            protected options: SearchOptions;
            constructor(options?: SearchOptions) {
                super();
                this.options = { caseSensitive: true, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                for (const { rule, style } of this.items) {
                    const ranges = annotateByRegExp(text, createSearchRegExp(rule, this.options));
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                }
                return result;
            }
        }

        type PositionRuleItem = Atarabi.text.PositionRuleItem;
        type PositionRule = Atarabi.text.PositionRule;
        type PositionOptions = Atarabi.text.PositionOptions;
        type SkipWhen = Atarabi.text.SkipWhen;

        function convertGraphemeRangesForText(text: string, rules: PositionRule[], skipWhen: SkipWhen, line: number = 0): Range[][] {
            const graphemes = [...graphemeSegmenter.segment(text)];
            const skip = createMatcher(skipWhen);
            const logicalToPhysical: number[] = [];
            const utf16Offsets: number[] = [];
            let offset = 0;
            graphemes.forEach((seg, physicalIndex) => {
                if (!skip(seg.segment)) {
                    logicalToPhysical.push(physicalIndex);
                }
                utf16Offsets.push(offset);
                offset += seg.segment.length;
            });
            utf16Offsets.push(offset);

            const result: Range[][] = [];

            for (const rule of rules) {
                let range: Range[] = [];

                const interpretRule = (rule: PositionRuleItem) => {
                    if (typeof rule === "number") {
                        if (rule < logicalToPhysical.length) {
                            const physical = logicalToPhysical[rule];
                            const fromUtf16 = utf16Offsets[physical];
                            const toUtf16 = utf16Offsets[physical + 1];
                            range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                        }
                    } else if (typeof rule === "function") {
                        for (let logical = 0; logical < logicalToPhysical.length; logical++) {
                            if (rule(logical, line)) {
                                const physical = logicalToPhysical[logical];
                                const from = utf16Offsets[physical];
                                const to = utf16Offsets[physical + 1];
                                range.push({ from, count: to - from });
                            }
                        }
                        range = mergeRanges(range);
                    } else {
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
                } else {
                    interpretRule(rule);
                }

                result.push(mergeRanges(range));
            }

            return result;
        }

        function convertGraphemeRangesByLine(text: string, rules: PositionRule[], skipWhen: SkipWhen): Range[][] {
            const lineRanges = annotateByLine(text);
            const result: Range[][] = rules.map(() => []);
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

        class PositionTextStyleBuilder extends TextStyleBuilder<PositionRule> implements Atarabi.text.PositionTextStyleBuilder {
            protected options: PositionOptions;
            constructor(options?: PositionOptions) {
                super();
                this.options = { mode: "absolute", skipWhen: null, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        type RangeRule = Atarabi.text.RangeRule;
        type LineRule = Atarabi.text.LineRule;

        function annotateByLine(text: string): Range[] {
            const ranges: Range[] = [];
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

        function deriveRangesFromRangeRule(ranges: Range[], rule: RangeRule): Range[] {
            let result: Range[] = [];
            if (typeof rule === "number") {
                const r = ranges[rule];
                if (r) result = [r];
            } else if (typeof rule === "function") {
                result = ranges.map((r, i) => ({ r, i })).filter(({ i }) => rule(i)).map(({ r }) => r);
            } else {
                const start = rule.from;
                const end = rule.count != null ? start + rule.count : ranges.length;
                for (let i = start; i < end && i < ranges.length; i++) {
                    result.push(ranges[i]);
                }
            }
            return mergeRanges(result);
        }

        class LineTextStyleBuilder extends TextStyleBuilder<LineRule> implements Atarabi.text.LineTextStyleBuilder {
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const lines = annotateByLine(text);
                const interpretRule = (rule: RangeRule, style: TextStyleOptions) => {
                    const ranges = deriveRangesFromRangeRule(lines, rule);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                };
                for (const { rule, style } of this.items) {
                    if (Array.isArray(rule)) {
                        rule.forEach(r => interpretRule(r, style));
                    } else {
                        interpretRule(rule, style);
                    }
                }
                return result;
            }
        }

        type SurroundingTarget = Atarabi.text.SurroundingTarget;
        type SurroundingOptions = Atarabi.text.SurroundingOptions;
        type SurroundingRule = Atarabi.text.SurroundingRule;

        type RangeWithDepth = { from: number; count: number; depth: number; maxDepth: number };

        function annotateBySurrounding(text: string, open: string, close: string): RangeWithDepth[] {
            type Entry = {
                open: number;
                close: number;
                depth: number;
                blockId: number;
            };

            type StackEntry = {
                open: number;
                depth: number;
                blockId: number;
            };

            const entries: Entry[] = [];

            let blockCounter = 0;
            const stack: StackEntry[] = [];

            for (let i = 0; i < text.length; i++) {
                if (text.startsWith(open, i)) {
                    if (stack.length === 0) blockCounter++;

                    const depth = stack.length + 1;
                    const blockId = blockCounter;

                    stack.push({ open: i, depth, blockId });
                    i += open.length - 1;
                } else if (text.startsWith(close, i)) {
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
            if (entries.length === 0) return [];

            const blocks = new Map<number, Entry[]>();
            for (const e of entries) {
                const b = blocks.get(e.blockId);
                if (b) b.push(e);
                else blocks.set(e.blockId, [e]);
            }

            const result: RangeWithDepth[] = [];

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

        function normalizeSurroundingRule(rule: SurroundingRule, defaultTarget: SurroundingTarget): { depths: number[]; target: SurroundingTarget } {
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

        function normalizeDepth(depth: number, maxDepth: number): number | null {
            const d = depth < 0 ? maxDepth + depth + 1 : depth;
            if (d < 1 || d > maxDepth) return null;
            return d;
        }

        function expandTarget(range: RangeWithDepth, target: SurroundingTarget, openLen: number, closeLen: number): Range[] {
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

        function compileSurroundingRule(rule: SurroundingRule, defaultTarget: SurroundingTarget, openLen: number, closeLen: number): (range: RangeWithDepth) => Range[] {
            const normalized = normalizeSurroundingRule(rule, defaultTarget);

            return (range: RangeWithDepth): Range[] => {
                const hits = normalized.depths
                    .map(d => normalizeDepth(d, range.maxDepth))
                    .filter((d): d is number => d !== null);

                if (!hits.includes(range.depth)) return [];

                return expandTarget(range, normalized.target, openLen, closeLen);
            };
        }

        class SurroundingTextStyleBuilder extends TextStyleBuilder<SurroundingRule> implements Atarabi.text.SurroundingTextStyleBuilder {
            protected options: SurroundingOptions;
            constructor(protected open: string, protected close: string, options?: SurroundingOptions) {
                super();
                this.options = { defaultTarget: "content", ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const rules = this.items.map(item => item.rule).map(r => compileSurroundingRule(r, this.options.defaultTarget, this.open.length, this.close.length));
                const surroudnings = annotateBySurrounding(text, this.open, this.close);
                for (let i = 0; i < this.items.length; i++) {
                    const rule = rules[i];
                    const style = this.items[i].style;
                    for (const surrounding of surroudnings) {
                        rule(surrounding).forEach(({ from, count }) => {
                            result.push({ from, count, style })
                        });
                    }
                }
                return result;
            }
        }

        type Mutable<T> = { -readonly [K in keyof T]: T[K]; };

        type GraphemeRule = Atarabi.text.GraphemeRule;
        type GraphemeMatcher = Atarabi.text.GraphemeMatcher;
        type GraphemeStateFn = Atarabi.text.GraphemeStateFn;
        type GraphemeRuleItem = { match: GraphemeMatcher; initState: GraphemeStateFn; };
        type GraphemeContext = Atarabi.text.GraphemeContext;

        function isLineBreak(g: string): boolean {
            return g === "\n" || g === "\r" || g === "\r\n";
        }

        function updateContext<Context>(ctx: Mutable<Context>, data: Partial<Context>) {
            Object.assign(ctx, data);
        }

        interface LineInfo {
            index: number;
            from: number;
            count: number;
            includeLB: boolean;
        }

        function segmentTextByGrapheme(text: string): { graphemes: Intl.SegmentData[]; lines: LineInfo[]; } {
            const graphemes = [...graphemeSegmenter.segment(text)];

            const lines: LineInfo[] = [];

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

        function processGrapheme(text: string, rules: GraphemeRuleItem[]): Range[][] {
            const { graphemes, lines } = segmentTextByGrapheme(text);

            const results: Range[][] = rules.map(() => []);
            const contexts: Mutable<GraphemeContext>[] = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                itemsInLine: 0,
                includeLB: false,
                total: 0,
                totalLines: 0,
                graphemeAt: (index: number) => {
                    if (index < 0 || index >= graphemes.length) return null;
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
                const prev = (skipWhen: SkipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    for (let i = globalIndex - 1; i >= 0; i--) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const prevInLine = (skipWhen: SkipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    for (let i = globalIndex - 1; i >= lineInfo.from; i--) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const next = (skipWhen: SkipWhen = null) => {
                    const skip = createMatcher(skipWhen);
                    for (let i = globalIndex + 1; i < graphemes.length; i++) {
                        if (skip(graphemes[i].segment)) {
                            continue;
                        }
                        return graphemes[i].segment;
                    }
                    return null;
                };
                const nextInLine = (skipWhen: SkipWhen = null) => {
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
                const peek = (offset: number, skipWhen: SkipWhen = null) => {
                    offset |= 0;
                    if (offset === 0) return g;
                    const skip = createMatcher(skipWhen);
                    const step = offset < 0 ? -1 : 1;
                    let remain = Math.abs(offset);
                    for (let i = globalIndex + step; i >= 0 && i < graphemes.length; i += step) {
                        if (skip(graphemes[i].segment)) continue;
                        if (--remain === 0) return graphemes[i].segment;
                    }
                    return null;
                };
                const peekInLine = (offset: number, skipWhen: SkipWhen = null) => {
                    offset |= 0;
                    if (offset === 0) return g;
                    const skip = createMatcher(skipWhen);
                    const step = offset < 0 ? -1 : 1;
                    const lineStart = lineInfo.from;
                    const lineEnd = lineInfo.from + lineInfo.count;
                    let remain = Math.abs(offset);
                    for (let i = globalIndex + step; i >= lineStart && i < lineEnd; i += step) {
                        if (skip(graphemes[i].segment)) continue;
                        if (--remain === 0) return graphemes[i].segment;
                    }
                    return null;
                };
                const isFirst = (skipWhen: SkipWhen = null) => {
                    if (globalIndex === 0) return true;
                    return prev(skipWhen) === null;
                };
                const isLast = (skipWhen: SkipWhen = null) => {
                    if (globalIndex === graphemes.length - 1) return true;
                    return next(skipWhen) === null;
                };
                const isFirstOfLine = (skipWhen: SkipWhen = null) => {
                    if (indexInLine === 0) return true;
                    return prevInLine(skipWhen) === null;
                };
                const isLastOfLine = (skipWhen: SkipWhen = null) => {
                    if (indexInLine === lineInfo.count - 1) return true;
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

        class GraphemeTextStyleBuilder extends TextStyleBuilder<GraphemeRule> implements Atarabi.text.GraphemeTextStyleBuilder {
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const rules: GraphemeRuleItem[] = this.items.map(item => item.rule).map(rule => typeof rule === "function" ? { match: rule, initState: () => ({}) } : rule);
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

        type WordRule = Atarabi.text.WordRule;
        type WordContext = Atarabi.text.WordContext;

        function segmentTextByWord(text: string, locale: string): { words: Intl.SegmentData[]; lines: LineInfo[]; } {
            const segmenter = getWordSegmenter(locale);
            const words = [...segmenter.segment(text)];

            const lines: LineInfo[] = [];

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

        function applyRange<R extends Range>(output: R[], range: R | R[], globalFrom: number, localLength: number) {
            const apply = (r: R) => {
                const localFrom = Math.max(0, r.from | 0);
                if (localFrom >= localLength) return;

                const localCount = typeof r.count === "number" ? Math.min(localLength - localFrom, r.count | 0) : localLength - localFrom;
                if (localCount > 0) {
                    output.push(Object.assign({}, r, { from: globalFrom + localFrom, count: localCount, }));
                }
            };

            Array.isArray(range) ? range.forEach(apply) : apply(range);
        }

        function processWord(locale: string, text: string, rules: WordRule[]): Range[][] {
            const { words, lines } = segmentTextByWord(text, locale);

            const results: Range[][] = rules.map(() => []);

            const contexts: Mutable<WordContext>[] = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                itemsInLine: 0,
                includeLB: false,
                total: 0,
                totalLines: 0,
                graphemes: () => [],
                wordAt: (index: number) => {
                    if (index < 0 || index >= words.length) return null;
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

        class WordTextStyleBuilder extends TextStyleBuilder<WordRule> implements Atarabi.text.WordTextStyleBuilder {
            constructor(private locale: string) {
                super();
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        type SentenceRule = Atarabi.text.SentenceRule;
        type SentenceContext = Atarabi.text.SentenceContext;

        function containsLineBreak(text: string): boolean {
            return /\r\n|\r|\n/.test(text);
        }

        function segmentTextBySentence(text: string, locale: string): { sentences: Intl.SegmentData[]; lines: LineInfo[] } {
            const segmenter = getSentenceSegmenter(locale);
            const sentences = [...segmenter.segment(text)];

            const lines: LineInfo[] = [];

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

        function processSentence(locale: string, text: string, rules: SentenceRule[]): Range[][] {
            const { sentences, lines } = segmentTextBySentence(text, locale);

            const results: Range[][] = rules.map(() => []);
            const contexts: Mutable<SentenceContext>[] = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                itemsInLine: 0,
                includeLB: false,
                total: 0,
                totalLines: 0,
                sentenceAt: (index: number) => {
                    if (index < 0 || index >= sentences.length) return null;
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

        class SentenceTextStyleBuilder extends TextStyleBuilder<SentenceRule> implements Atarabi.text.SentenceTextStyleBuilder {
            constructor(private locale: string) {
                super();
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        abstract class TextStyleResolver implements Atarabi.text.TextStyleResolver {
            abstract resolve(text: string): RangeWithStyle[];
        }

        type ForEachLineFunc = Atarabi.text.ForEachLineFunc;

        class ForEachLine extends TextStyleResolver {
            constructor(public fn: ForEachLineFunc) {
                super();
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        type ForEachGraphemeFunc = Atarabi.text.ForEachGraphemeFunc;
        type ForEachGraphemeOptions = Atarabi.text.ForEachGraphemeOptions;

        class ForEachGrapheme extends TextStyleResolver {
            protected options: ForEachGraphemeOptions;
            constructor(public fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions) {
                super();
                this.options = { initState: () => ({}), ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const { graphemes, lines } = segmentTextByGrapheme(text);
                const ctx: Mutable<GraphemeContext> = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    itemsInLine: 0,
                    includeLB: false,
                    total: 0,
                    totalLines: 0,
                    graphemeAt: (index: number) => {
                        if (index < 0 || index >= graphemes.length) return null;
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
                    const prev = (skipWhen: SkipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        for (let i = globalIndex - 1; i >= 0; i--) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const prevInLine = (skipWhen: SkipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        for (let i = globalIndex - 1; i >= lineInfo.from; i--) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const next = (skipWhen: SkipWhen = null) => {
                        const skip = createMatcher(skipWhen);
                        for (let i = globalIndex + 1; i < graphemes.length; i++) {
                            if (skip(graphemes[i].segment)) {
                                continue;
                            }
                            return graphemes[i].segment;
                        }
                        return null;
                    };
                    const nextInLine = (skipWhen: SkipWhen = null) => {
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
                    const peek = (offset: number, skipWhen: SkipWhen = null) => {
                        offset |= 0;
                        if (offset === 0) return g;
                        const skip = createMatcher(skipWhen);
                        const step = offset < 0 ? -1 : 1;
                        let remain = Math.abs(offset);
                        for (let i = globalIndex + step; i >= 0 && i < graphemes.length; i += step) {
                            if (skip(graphemes[i].segment)) continue;
                            if (--remain === 0) return graphemes[i].segment;
                        }
                        return null;
                    };
                    const peekInLine = (offset: number, skipWhen: SkipWhen = null) => {
                        offset |= 0;
                        if (offset === 0) return g;
                        const skip = createMatcher(skipWhen);
                        const step = offset < 0 ? -1 : 1;
                        const lineStart = lineInfo.from;
                        const lineEnd = lineInfo.from + lineInfo.count;
                        let remain = Math.abs(offset);
                        for (let i = globalIndex + step; i >= lineStart && i < lineEnd; i += step) {
                            if (skip(graphemes[i].segment)) continue;
                            if (--remain === 0) return graphemes[i].segment;
                        }
                        return null;
                    };
                    const isFirst = (skipWhen: SkipWhen = null) => {
                        if (globalIndex === 0) return true;
                        return prev(skipWhen) === null;
                    };
                    const isLast = (skipWhen: SkipWhen = null) => {
                        if (globalIndex === graphemes.length - 1) return true;
                        return next(skipWhen) === null;
                    };
                    const isFirstOfLine = (skipWhen: SkipWhen = null) => {
                        if (indexInLine === 0) return true;
                        return prevInLine(skipWhen) === null;
                    };
                    const isLastOfLine = (skipWhen: SkipWhen = null) => {
                        if (indexInLine === lineInfo.count - 1) return true;
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

        type ForEachWordFunc = Atarabi.text.ForEachWordFunc;
        type ForEachWordOptions = Atarabi.text.ForEachWordOptions;

        class ForEachWord extends TextStyleResolver {
            protected options: ForEachWordOptions;
            constructor(public fn: ForEachWordFunc, options?: ForEachWordOptions) {
                super();
                this.options = { locale: DEFAULT_LOCALE, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const { words, lines } = segmentTextByWord(text, this.options.locale);
                const ctx: Mutable<WordContext> = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    itemsInLine: 0,
                    includeLB: false,
                    total: 0,
                    totalLines: 0,
                    graphemes: () => [],
                    wordAt: (index: number) => {
                        if (index < 0 || index >= words.length) return null;
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

        type ForEachSentenceFunc = Atarabi.text.ForEachSentenceFunc;
        type ForEachSentenceOptions = Atarabi.text.ForEachSentenceOptions;

        class ForEachSentence extends TextStyleResolver {
            protected options: ForEachSentenceOptions;
            constructor(public fn: ForEachSentenceFunc, options?: ForEachSentenceOptions) {
                super();
                this.options = { locale: DEFAULT_LOCALE, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const { sentences, lines } = segmentTextBySentence(text, this.options.locale);
                const ctx: Mutable<SentenceContext> = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    itemsInLine: 0,
                    includeLB: false,
                    total: 0,
                    totalLines: 0,
                    sentenceAt: (index: number) => {
                        if (index < 0 || index >= sentences.length) return null;
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

        type ForEachRegExpFunc = Atarabi.text.ForEachRegExpFunc;

        class ForEachRegExp extends TextStyleResolver {
            constructor(public re: RegExp | RegExp[], public fn: ForEachRegExpFunc) {
                super();
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];

                const patterns = Array.isArray(this.re) ? this.re : [this.re];
                const regexes = patterns.map((r, i) => ({
                    id: i,
                    re: new RegExp(r.source, r.flags.includes("g") ? r.flags : r.flags + "g"),
                    match: null as RegExpExecArray | null,
                }));

                const fn = this.fn;

                let cursor = 0;
                let index = 0;

                const refreshMatches = () => {
                    for (let i = regexes.length - 1; i >= 0; i--) {
                        const rx = regexes[i];
                        rx.re.lastIndex = cursor;
                        rx.match = rx.re.exec(text);
                        if (!rx.match) regexes.splice(i, 1);
                    }
                };

                refreshMatches();

                while (regexes.length > 0) {
                    let bestIndex = -1;
                    let bestPos = Infinity;
                    let bestId = Infinity;

                    for (let i = 0; i < regexes.length; i++) {
                        const m = regexes[i].match!;
                        const pos = m.index;

                        if (pos < bestPos || (pos === bestPos && regexes[i].id < bestId)) {
                            bestPos = pos;
                            bestId = regexes[i].id;
                            bestIndex = i;
                        }
                    }

                    if (bestIndex === -1) break;

                    const chosen = regexes[bestIndex];
                    const match = chosen.match!;
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

        type ForEachSurroundingFunc = Atarabi.text.ForEachSurroundingFunc;

        class ForEachSurrounding extends TextStyleResolver {
            constructor(public open: string, public close: string, public fn: ForEachSurroundingFunc) {
                super();
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];

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

        type TextTransformContext = Atarabi.text.TextTransformContext;

        class TextStyleContext implements TextStyleResolver, Atarabi.text.TextStyleFacade, Atarabi.text.TextTransformer {
            protected builders: (TextStyleBuilder<any> | TextStyleResolver)[] = [];
            constructor(public globalStyle: TextLayoutOptions | TextStyleOptions = {}) {
            }
            protected transforms: ((text: string, ctx: TextTransformContext) => string)[] = [];
            transform(fn: (text: string, ctx: TextTransformContext) => string): this {
                this.transforms.push(fn);
                return this;
            }
            rule<Rule>(rule: Rule, style: TextStyleOptions): this {
                const builder = this.builders[this.builders.length - 1];
                if (builder instanceof TextStyleBuilder) {
                    builder.rule(rule, style);
                }
                return this;
            }
            byCharClass(options?: CharClassOptions): this {
                this.builders.push(new CharClassTextStyleBuilder(options));
                return this;
            }
            byRegExp(): this {
                this.builders.push(new RegExpTextStyleBuilder());
                return this;
            }
            bySearch(options?: SearchOptions): this {
                this.builders.push(new SearchTextStyleBuilder(options));
                return this;
            }
            byPosition(options?: PositionOptions): this {
                this.builders.push(new PositionTextStyleBuilder(options));
                return this;
            }
            byLine(): this {
                this.builders.push(new LineTextStyleBuilder());
                return this;
            }
            bySurrounding(open: string, close: string, options?: SurroundingOptions): this {
                this.builders.push(new SurroundingTextStyleBuilder(open, close, options));
                return this;
            }
            byGrapheme(): this {
                this.builders.push(new GraphemeTextStyleBuilder());
                return this;
            }
            byWord(locale: string): this {
                this.builders.push(new WordTextStyleBuilder(locale));
                return this;
            }
            bySentence(locale: string): this {
                this.builders.push(new SentenceTextStyleBuilder(locale));
                return this;
            }
            forEachLine(fn: ForEachLineFunc): this {
                this.builders.push(new ForEachLine(fn));
                return this;
            }
            forEachGrapheme(fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions): this {
                this.builders.push(new ForEachGrapheme(fn, options));
                return this;
            }
            forEachWord(fn: ForEachWordFunc, options?: ForEachWordOptions): this {
                this.builders.push(new ForEachWord(fn, options));
                return this;
            }
            forEachSentence(fn: ForEachSentenceFunc, options?: ForEachSentenceOptions): this {
                this.builders.push(new ForEachSentence(fn, options));
                return this;
            }
            forEachRegExp(re: RegExp | RegExp[], fn: ForEachRegExpFunc): this {
                this.builders.push(new ForEachRegExp(re, fn));
                return this;
            }
            forEachSurrounding(open: string, close: string, fn: ForEachSurroundingFunc): this {
                this.builders.push(new ForEachSurrounding(open, close, fn));
                return this;
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                // transform
                const original = property.value;
                const text = this.transforms.reduce((acc, fn) => fn(acc, { original }), original);
                if (this.transforms.length && text !== original) {
                    style = replaceText(style, text);
                }
                // global
                for (const field in this.globalStyle) {
                    style = applyTextStyleAll(text, style, field as keyof TextLayout | keyof TextStyle, this.globalStyle[field]);
                }
                // local
                for (const { from, count, style: st } of normalizeRanges(this.resolve(text))) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                this.builders.forEach(builder => result.push(...builder.resolve(text)))
                return result;
            }
        }

        const lib = {
            CharClass: CHAR_CLASS_REGISTRY,
            createMatcher,
            TextStyle: (globalStyle?: TextLayoutOptions | TextStyleOptions) => new TextStyleContext(globalStyle),
            __internal: {
                annotateByCharClass: annotateByCharClassExclusive
            },
        } satisfies Atarabi.text.Lib & {
            __internal: {
                annotateByCharClass: typeof annotateByCharClassExclusive,
            }
        };

        LIB.text = lib;

        return lib;
    },
})