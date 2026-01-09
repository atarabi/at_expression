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

        const CHAR_CLASS_REGISTRY: Record<CharClassKey, CharClass> = Object.keys(CHAR_CLASS_DEFINITIONS).reduce((acc, key) => {
            acc[key] = new CharClass(key, CHAR_CLASS_DEFINITIONS[key]);
            return acc;
        }, {} as any);

        for (const cls of Object.values(CHAR_CLASS_REGISTRY)) {
            Object.freeze(cls);
        }
        Object.freeze(CHAR_CLASS_REGISTRY);

        type CharMatcher = Atarabi.text.CharMatcher;
        type CharMatchers = Atarabi.text.CharMatchers;

        function createMatcher(matchers?: CharMatchers): (g: string) => boolean {
            if (!matchers) {
                return () => false;
            }

            let fns: ((g: string) => boolean)[] = [];

            const push_fn = (matcher: CharMatcher) => {
                if (typeof matcher === "string") {
                    const charClass = CHAR_CLASS_REGISTRY[matcher];
                    if (charClass) {
                        fns.push(g => g !== null && charClass.test(g));
                    }
                    throw new Error(`Unknown CharClass Key: ${matcher}`);
                } else if (CharClass.isCharClass(matcher)) {
                    fns.push(g => g !== null && matcher.test(g));
                } else if (matcher instanceof RegExp) {
                    fns.push(g => g !== null && matcher.test(g));
                }
            };

            if (Array.isArray(matchers)) {
                matchers.forEach(when => push_fn(when));
            } else {
                push_fn(matchers);
            }

            if (fns.length === 0) {
                return () => false;
            } else if (fns.length === 1) {
                return fns[0];
            } else {
                return g => fns.some(f => f(g));
            }
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

        function applyTextStyleAll<FieldL extends keyof TextLayout, FieldS extends keyof TextStyle>(property: TextProperty, style: TextStyleProperty, field: FieldL | FieldS, value: TextLayout[FieldL] | TextStyle[FieldS]): TextStyleProperty {
            switch (field) {
                case "direction":
                    return style.setDirection(value as any);
                case "firstLineIndent":
                    return style.setFirstLineIndent(value as any);
                case "isEveryLineComposer":
                    return style.setEveryLineComposer(value as any);
                case "isHangingRoman":
                    return style.setHangingRoman(value as any);
                case "justification":
                    return style.setJustification(value as any);
                case "leadingType":
                    return style.setLeadingType(value as any);
                case "leftMargin":
                    return style.setLeftMargin(value as any);
                case "rightMargin":
                    return style.setRightMargin(value as any);
                case "spaceAfter":
                    return style.setSpaceAfter(value as any);
                case "spaceBefore":
                    return style.setSpaceBefore(value as any);
                case "applyFill":
                    return style.setApplyFill(value as any);
                case "applyStroke":
                    return style.setApplyStroke(value as any);
                case "baselineDirection":
                    return style.setBaselineDirection(value as any);
                case "baselineOption":
                    return style.setBaselineOption(value as any);
                case "baselineShift":
                    return style.setBaselineShift(value as any);
                case "digitSet":
                    return style.setDigitSet(value as any);
                case "fillColor":
                    return style.setFillColor(value as any);
                case "font":
                    return style.setFont(value as any);
                case "fontSize":
                    return style.setFontSize(value as any);
                case "horizontalScaling":
                    return style.setHorizontalScaling(value as any);
                case "isAllCaps":
                    return style.setAllCaps(value as any);
                case "isAutoLeading":
                    return style.setAutoLeading(value as any);
                case "isFauxBold":
                    return style.setFauxBold(value as any);
                case "isFauxItalic":
                    return style.setFauxItalic(value as any);
                case "isLigature":
                    return style.setLigature(value as any);
                case "isSmallCaps":
                    return style.setSmallCaps(value as any);
                case "kerning":
                    for (let n = 0, numOfCharacters = property.value.length; n < numOfCharacters; n++) {
                        style = style.setKerning(value as any, n);
                    }
                    return style;
                case "kerningType":
                    return style.setKerningType(value as any);
                case "leading":
                    return style.setLeading(value as any);
                case "lineJoin":
                    return style.setLineJoin(value as any);
                case "strokeColor":
                    return style.setStrokeColor(value as any);
                case "strokeWidth":
                    return style.setStrokeWidth(value as any);
                case "tracking":
                    return style.setTracking(value as any);
                case "tsume":
                    return style.setTsume(value as any);
                case "verticalScaling":
                    return style.setVerticalScaling(value as any);
            }
            throw new Error(`Invalid field: ${field}`);
        }

        function applyTextLayoutField<Field extends keyof TextLayout>(style: TextStyleProperty, field: Field, value: TextLayout[Field]): TextStyleProperty {
            switch (field) {
                case "direction":
                    return style.setDirection(value as any);
                case "firstLineIndent":
                    return style.setFirstLineIndent(value as any);
                case "isEveryLineComposer":
                    return style.setEveryLineComposer(value as any);
                case "isHangingRoman":
                    return style.setHangingRoman(value as any);
                case "justification":
                    return style.setJustification(value as any);
                case "leadingType":
                    return style.setLeadingType(value as any);
                case "leftMargin":
                    return style.setLeftMargin(value as any);
                case "rightMargin":
                    return style.setRightMargin(value as any);
                case "spaceAfter":
                    return style.setSpaceAfter(value as any);
                case "spaceBefore":
                    return style.setSpaceBefore(value as any);
            }
            throw new Error(`Invalid field: ${field}`);
        }

        function applyTextLayout(style: TextStyleProperty, layout: TextLayoutOptions): TextStyleProperty {
            for (const field in layout) {
                style = applyTextLayoutField(style, field as keyof TextLayout, layout[field]);
            }
            return style;
        }

        function applyStyleField<Field extends keyof TextStyle>(style: TextStyleProperty, field: Field, value: TextStyle[Field], startIndex: number, numOfCharacters: number): TextStyleProperty {
            switch (field) {
                case "applyFill":
                    return style.setApplyFill(value as any, startIndex, numOfCharacters);
                case "applyStroke":
                    return style.setApplyStroke(value as any, startIndex, numOfCharacters);
                case "baselineDirection":
                    return style.setBaselineDirection(value as any, startIndex, numOfCharacters);
                case "baselineOption":
                    return style.setBaselineOption(value as any, startIndex, numOfCharacters);
                case "baselineShift":
                    return style.setBaselineShift(value as any, startIndex, numOfCharacters);
                case "digitSet":
                    return style.setDigitSet(value as any, startIndex, numOfCharacters);
                case "fillColor":
                    return style.setFillColor(value as any, startIndex, numOfCharacters);
                case "font":
                    return style.setFont(value as any, startIndex, numOfCharacters);
                case "fontSize":
                    return style.setFontSize(value as any, startIndex, numOfCharacters);
                case "horizontalScaling":
                    return style.setHorizontalScaling(value as any, startIndex, numOfCharacters);
                case "isAllCaps":
                    return style.setAllCaps(value as any, startIndex, numOfCharacters);
                case "isAutoLeading":
                    return style.setAutoLeading(value as any, startIndex, numOfCharacters);
                case "isFauxBold":
                    return style.setFauxBold(value as any, startIndex, numOfCharacters);
                case "isFauxItalic":
                    return style.setFauxItalic(value as any, startIndex, numOfCharacters);
                case "isLigature":
                    return style.setLigature(value as any, startIndex, numOfCharacters);
                case "isSmallCaps":
                    return style.setSmallCaps(value as any, startIndex, numOfCharacters);
                case "kerning":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setKerning(value as any, startIndex + n);
                    }
                    return style;
                case "kerningType":
                    return style.setKerningType(value as any, startIndex, numOfCharacters);
                case "leading":
                    return style.setLeading(value as any, startIndex, numOfCharacters);
                case "lineJoin":
                    return style.setLineJoin(value as any, startIndex, numOfCharacters);
                case "strokeColor":
                    return style.setStrokeColor(value as any, startIndex, numOfCharacters);
                case "strokeWidth":
                    return style.setStrokeWidth(value as any, startIndex, numOfCharacters);
                case "tracking":
                    return style.setTracking(value as any, startIndex, numOfCharacters);
                case "tsume":
                    return style.setTsume(value as any, startIndex, numOfCharacters);
                case "verticalScaling":
                    return style.setVerticalScaling(value as any, startIndex, numOfCharacters);
            }
            throw new Error(`Invalid field: ${field}`);
        }

        function applyStyle(style: TextStyleProperty, options: TextStyleOptions, startIndex: number, numOfCharacters: number): TextStyleProperty {
            for (const field in options) {
                style = applyStyleField(style, field as keyof TextStyle, options[field], startIndex, numOfCharacters);
            }
            return style;
        }

        function lowerBound(ranges: RangeWithStyle[], from: number): number {
            let lo = 0;
            let hi = ranges.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                const r = ranges[mid];
                if (r.from + r.count <= from) {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
            return lo;
        }

        function addNormalizedRange(ranges: RangeWithStyle[], incoming: RangeWithStyle): void {
            if (incoming.count <= 0) return;

            const inStart = incoming.from;
            const inEnd = incoming.from + incoming.count;

            let i = lowerBound(ranges, inStart);

            while (i < ranges.length) {
                const cur = ranges[i];
                const curStart = cur.from;
                const curEnd = cur.from + cur.count;

                if (curStart >= inEnd) break;

                const overlapStart = Math.max(curStart, inStart);
                const overlapEnd = Math.min(curEnd, inEnd);

                const replaced: RangeWithStyle[] = [];

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

        function addNormalizedRanges(ranges: RangeWithStyle[], incoming: RangeWithStyle[]): void {
            for (const r of incoming) {
                addNormalizedRange(ranges, r);
            }
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
            abstract rule(a: Rule | TextStyleOptions, b?: TextStyleOptions): this
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                for (const { from, count, style: st } of this.resolve(property.value)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
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
            protected rules: CharClassRule[] = [];
            protected styles: TextStyleOptions[] = [];
            protected options: CharClassOptions;
            constructor(options?: CharClassOptions) {
                super();
                this.options = { mode: "overlap", ...options };
            }
            rule(rule: CharClassRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                if (this.options.mode === "exclusive") {
                    const ranges = annotateByCharClassExclusive(text, this.rules);
                    for (const { from, count, index } of ranges) {
                        if (index < 0) {
                            continue;
                        }
                        result.push({ from, count, style: this.styles[index] });
                    }
                } else {
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
            protected rules: RegExpRule[] = [];
            protected styles: TextStyleOptions[] = [];
            rule(rule: RegExpRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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
            protected rules: RegExpRule[] = [];
            protected styles: TextStyleOptions[] = [];
            protected options: SearchOptions;
            constructor(options?: SearchOptions) {
                super();
                this.options = { caseSensitive: true, ...options };
            }
            rule(rule: SearchRule, style: TextStyleOptions): this {
                this.rules.push(rule instanceof RegExp ? rule : createSearchRegExp(rule, this.options));
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        type PositionRuleItem = Atarabi.text.PositionRuleItem;
        type PositionRule = Atarabi.text.PositionRule;
        type PositionMode = Atarabi.text.PositionMode;
        type PositionOptions = Atarabi.text.PositionOptions;
        type SkipWhen = Atarabi.text.SkipWhen;

        function convertGraphemeRangesForText(text: string, rules: PositionRule[], skipWhen: SkipWhen, line: number = 0): Range[][] {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
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
            protected rules: PositionRule[] = [];
            protected styles: TextStyleOptions[] = [];
            protected options: PositionOptions;
            constructor(options?: PositionOptions) {
                super();
                this.options = { mode: "absolute", skipWhen: null, ...options };
            }
            rule(rule: PositionRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const rangesList = this.options.mode === "line" ? convertGraphemeRangesByLine(text, this.rules, this.options.skipWhen) : convertGraphemeRangesForText(text, this.rules, this.options.skipWhen);
                for (let i = 0; i < rangesList.length; i++) {
                    for (const { from, count } of rangesList[i]) {
                        result.push({ from, count, style: this.styles[i] });
                    }
                }
                result = normalizeRanges(result);
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
            protected rules: LineRule[] = [];
            protected styles: TextStyleOptions[] = [];
            rule(rule: LineRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const lines = annotateByLine(text);
                const interpretRule = (rule: RangeRule, style: TextStyleOptions) => {
                    const ranges = deriveRangesFromRangeRule(lines, rule);
                    for (const { from, count } of ranges) {
                        result.push({ from, count, style });
                    }
                };
                for (let i = 0; i < this.rules.length; i++) {
                    const rule = this.rules[i];
                    if (Array.isArray(rule)) {
                        rule.forEach(r => interpretRule(r, this.styles[i]));
                    } else {
                        interpretRule(rule, this.styles[i]);
                    }
                }
                result = normalizeRanges(result);
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
            protected rules: SurroundingRule[] = [];
            protected styles: TextStyleOptions[] = [];
            constructor(protected open: string, protected close: string, options?: SurroundingOptions) {
                super();
                this.options = { defaultTarget: "content", ...options };
            }
            rule(rule: SurroundingRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const rules = this.rules.map(r => compileSurroundingRule(r, this.options.defaultTarget, this.open.length, this.close.length));
                const surroudnings = annotateBySurrounding(text, this.open, this.close);
                for (let i = 0; i < rules.length; i++) {
                    const rule = rules[i];
                    const style = this.styles[i];
                    for (const surrounding of surroudnings) {
                        rule(surrounding).forEach(({ from, count }) => {
                            result.push({ from, count, style })
                        });
                    }
                }
                result = normalizeRanges(result);
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
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];

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
            protected rules: GraphemeRuleItem[] = [];
            protected styles: TextStyleOptions[] = [];
            rule(rule: GraphemeRule, style: TextStyleOptions): this {
                if (typeof rule === "function") {
                    this.rules.push({ match: rule, initState: () => ({}) });
                } else {
                    this.rules.push(rule);
                }
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        type WordRule = Atarabi.text.WordRule;
        type WordContext = Atarabi.text.WordContext;

        function segmentTextByWord(text: string, locale?: string | string[]): { words: Intl.SegmentData[]; lines: LineInfo[]; } {
            const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
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
            const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

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
            protected rules: WordRule[] = [];
            protected styles: TextStyleOptions[] = [];
            constructor(private locale: string) {
                super();
            }
            rule(rule: WordRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        type SentenceRule = Atarabi.text.SentenceRule;
        type SentenceContext = Atarabi.text.SentenceContext;

        function containsLineBreak(text: string): boolean {
            return /\r\n|\r|\n/.test(text);
        }

        function segmentTextBySentence(text: string, locale?: string | string[]): { sentences: Intl.SegmentData[]; lines: LineInfo[] } {
            const segmenter = new Intl.Segmenter(locale, { granularity: "sentence" });
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
            protected rules: SentenceRule[] = [];
            protected styles: TextStyleOptions[] = [];
            constructor(private locale: string) {
                super();
            }
            rule(rule: SentenceRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
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

        abstract class TextStyleApplier implements Atarabi.text.TextStyleApplier {
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                for (const { from, count, style: st } of this.resolve(property.value)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
            abstract resolve(text: string): RangeWithStyle[];
        }

        type ForEachLineFunc = Atarabi.text.ForEachLineFunc;

        class ForEachLine extends TextStyleApplier implements Atarabi.text.TextStyleApplier {
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

        class ForEachGrapheme extends TextStyleApplier implements Atarabi.text.TextStyleApplier {
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

        class ForEachWord extends TextStyleApplier implements Atarabi.text.TextStyleApplier {
            protected options: ForEachWordOptions;
            constructor(public fn: ForEachWordFunc, options?: ForEachWordOptions) {
                super();
                this.options = { locale: DEFAULT_LOCALE, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const { words, lines } = segmentTextByWord(text);
                const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
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

                result = normalizeRanges(result);

                return result;
            }
        }

        type ForEachSentenceFunc = Atarabi.text.ForEachSentenceFunc;
        type ForEachSentenceOptions = Atarabi.text.ForEachSentenceOptions;

        class ForEachSentence extends TextStyleApplier implements Atarabi.text.TextStyleApplier {
            protected options: ForEachSentenceOptions;
            constructor(public fn: ForEachSentenceFunc, options?: ForEachSentenceOptions) {
                super();
                this.options = { locale: DEFAULT_LOCALE, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const { sentences, lines } = segmentTextBySentence(text);
                const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
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

                result = normalizeRanges(result);

                return result;
            }
        }

        type ForEachRegExpFunc = Atarabi.text.ForEachRegExpFunc;

        class ForEachRegExp extends TextStyleApplier implements Atarabi.text.TextStyleApplier {
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

                result = normalizeRanges(result);

                return result;
            }
        }

        type ForEachSurroundingFunc = Atarabi.text.ForEachSurroundingFunc;

        class ForEachSurrounding extends TextStyleApplier implements Atarabi.text.TextStyleApplier {
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

                result = normalizeRanges(result);

                return result;
            }
        }

        type TextTransformContext = Atarabi.text.TextTransformContext;

        class TextStyleContext implements TextStyleApplier, Atarabi.text.TextStyleFacade, Atarabi.text.TextTransformer {
            protected builders: (TextStyleBuilder<any> | TextStyleApplier)[] = [];
            constructor(public globalStyle: TextLayoutOptions | TextStyleOptions = {}) {
            }
            protected transformers: ((text: string, ctx: TextTransformContext) => string)[] = [];
            transform(fn: (text: string, ctx: TextTransformContext) => string): this {
                this.transformers.push(fn);
                return this;
            }
            rule<Rule>(r: Rule, style: TextStyleOptions): this {
                const builder = this.builders[this.builders.length - 1];
                if (builder instanceof TextStyleBuilder) {
                    builder.rule(r, style);
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
                const text = this.transformers.reduce((acc, fn) => fn(acc, {original}), original);
                if (this.transformers.length && text !== original) {
                    style = replaceText(style, text);
                }
                // global
                for (const field in this.globalStyle) {
                    style = applyTextStyleAll(property, style, field as keyof TextLayout | keyof TextStyle, this.globalStyle[field]);
                }
                // local
                for (const { from, count, style: st } of this.resolve(text)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                for (const builder of this.builders) {
                    if (result.length) {
                        addNormalizedRanges(result, builder.resolve(text));
                    } else {
                        result = builder.resolve(text);
                    }
                }
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