({
    load(force: boolean = false): Atarabi.text.Lib {

        const LIB = $.__lib = $.__lib || {};
        if (!force && LIB.text) {
            return LIB.text;
        }

        type CharClass = Atarabi.text.CharClass;

        const REGEX_BY_CLASS: Record<CharClass, RegExp | RegExp[]> = (() => {
            const Hiragana = /\p{Script=Hiragana}/u;
            const Katakana = /\p{Script=Katakana}/u;
            const Japanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー〆]/u;
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
                Japanese,
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
                Yakumono,
                Space,
                Separator,
            };
        })();

        const CharClass = {
            Hiragana: "Hiragana",
            Katakana: "Katakana",
            Kanji: "Kanji",
            Japanese: "Japanese",
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
            Yakumono: "Yakumono",
            Space: "Space",
            Separator: "Separator",
        } satisfies Atarabi.text.CharClassMap;

        type CharMatcher = Atarabi.text.CharMatcher;

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

        function toRegExp(m: CharMatcher): RegExp | RegExp[] {
            if (typeof m === "string") {
                const r = REGEX_BY_CLASS[m as CharClass];
                if (!r) throw new Error(`Unsupported CharClass: ${m}`);
                return r;
            } else {
                return m;
            }
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
                if (Array.isArray(cls)) return cls.flatMap(toRegExp);
                return [toRegExp(cls)].flat();
            });

            const ranges: RangeWithIndex[] = [];
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

        type TextLayout = Atarabi.text.TextLayout;
        type TextLayoutOptions = Atarabi.text.TextLayoutOptions;
        type TextStyle = Atarabi.text.TextStyle;
        type TextStyleOptions = Atarabi.text.TextStyleOptions;

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

        class AllTextStyleBuilder implements Atarabi.text.TextStyleApplier {
            constructor(public style: TextLayoutOptions | TextStyleOptions) { }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                for (const field in this.style) {
                    style = applyTextStyleAll(property, style, field as keyof TextLayout | keyof TextStyle, this.style[field]);
                }
                return style;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const style: TextStyleOptions = {};
                for (const field in this.style) {
                    switch(field) {
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

        function isStyleOnly<Rule>(a: Rule | TextStyleOptions, b?: TextStyleOptions): a is TextStyleOptions {
            return b === undefined;
        }

        type RangeWithStyle = Atarabi.text.RangeWithStyle;

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

            if (
                typeof a !== "object" ||
                typeof b !== "object" ||
                a === null ||
                b === null
            ) {
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
            protected abstract defaultRule: Rule;
            protected layoutOptions: TextLayoutOptions = {};
            rule(a: Rule | TextStyleOptions, b?: TextStyleOptions): this {
                if (isStyleOnly(a, b)) {
                    return this.addRule(this.defaultRule, a);
                } else {
                    return this.addRule(a, b);
                }
            }
            protected abstract addRule(rule: Rule, options: TextStyleOptions): this;
            layout(layout: TextLayoutOptions): this {
                this.layoutOptions = { ...this.layoutOptions, ...layout };
                return this;
            }
            protected applyLayout(style: TextStyleProperty): TextStyleProperty {
                return applyTextLayout(style, this.layoutOptions);
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                style = this.applyLayout(style);
                 for (const {from, count, style: st} of this.resolve(property.value)) {
                    style = applyStyle(style, st, from, count);
                }
                return style;
            }
            abstract resolve(text: string): RangeWithStyle[];
        }

        type CharClassRule = Atarabi.text.CharClassRule;

        class CharClassTextStyleBuilder extends TextStyleBuilder<CharClassRule> implements Atarabi.text.CharClassTextStyleBuilder {
            protected charClasses: CharClassRule[] = [];
            protected styles: TextStyleOptions[] = [];
            protected doExclusive: boolean = false;
            protected get defaultRule(): CharClassRule {
                return /[\s\S]+/;
            }
            exclusive(): this {
                this.doExclusive = true;
                return this;
            }
            overlay(): this {
                this.doExclusive = false;
                return this;
            }
            protected addRule(rule: CharClassRule, style: TextStyleOptions): this {
                this.charClasses.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                if (this.doExclusive) {
                    const ranges = annotateByCharClassExclusive(text, this.charClasses);
                    for (const {from, count, index} of ranges) {
                        if (index < 0) {
                            continue;
                        }
                        result.push({from, count, style: this.styles[index]});
                    }
                } else {
                    for (let i = 0; i < this.charClasses.length; i++) {
                        const ranges = annotateByCharClassOverlay(text, this.charClasses[i]);
                        for (const {from, count} of ranges) {
                            result.push({from, count, style: this.styles[i]});
                        }
                    }
                    result = normalizeRanges(result);
                }
                return result;
            }
        }

        type Range = Atarabi.text.Range;
        type PositionRuleItem = Atarabi.text.PositionRuleItem;
        type PositionRule = Atarabi.text.PositionRule;
        type CountWhen = Atarabi.text.CountWhen;
        type CountWhenPreset = Atarabi.text.CountWhenPreset;

        const COUNT_WHEN_PRESETS: Record<CountWhenPreset, (g: string) => boolean> = {
            all: () => true,
            nonWhitespace: g => !/^\s$/u.test(g),
            nonLineBreak: g => g !== "\n" && g !== "\r\n" && g !== "\r",
            nonWhitespaceOrLineBreak: g => !/^\s$/u.test(g) && g !== "\n" && g !== "\r\n" && g !== "\r",
        };

        function makeCountPredicate(countWhen?: CountWhen): (g: string) => boolean {
            if (!countWhen) {
                return COUNT_WHEN_PRESETS.all;
            }

            if (typeof countWhen === "string") {
                const preset = COUNT_WHEN_PRESETS[countWhen] ?? REGEX_BY_CLASS[countWhen];
                if (!preset) {
                    throw new Error(`Unknown countWhen preset: ${countWhen}`);
                }
                return preset;
            }

            if (countWhen instanceof RegExp) {
                return g => countWhen.test(g);
            }

            return countWhen;
        }

        function convertGraphemeRangesForText(text: string, rules: PositionRule[], countWhen: CountWhen, line: number = 0): Range[][] {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
            const countPredicate = makeCountPredicate(countWhen);
            const logicalToPhysical: number[] = [];
            const utf16Offsets: number[] = [];
            let offset = 0;
            graphemes.forEach((seg, physicalIndex) => {
                if (countPredicate(seg.segment)) {
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

        function convertGraphemeRangesByLine(text: string, rules: PositionRule[], countWhen: CountWhen): Range[][] {
            const lineRanges = annotateByLine(text);
            const result: Range[][] = rules.map(() => []);
            for (let i = 0; i < lineRanges.length; i++) {
                const line = lineRanges[i];
                const lineText = text.slice(line.from, line.from + line.count);
                const perLine = convertGraphemeRangesForText(lineText, rules, countWhen, i);
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
            protected doLine: boolean = false;
            protected when: CountWhen = "all";
            protected get defaultRule(): PositionRule {
                return { from: 0 };
            }
            line(): this {
                this.doLine = true;
                return this;
            }
            global(): this {
                this.doLine = false;
                return this;
            }
            countWhen(when: Atarabi.text.CountWhen): this {
                this.when = when;
                return this;
            }
            protected addRule(rule: PositionRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const rangesList = this.doLine ? convertGraphemeRangesByLine(text, this.rules, this.when) : convertGraphemeRangesForText(text, this.rules, this.when);
                for (let i = 0; i < rangesList.length; i++) {
                    for (const {from, count} of rangesList[i]) {
                        result.push({from, count, style: this.styles[i]});
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
            protected get defaultRule(): LineRule {
                return { from: 0 };
            }
            protected addRule(rule: LineRule, style: TextStyleOptions): this {
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

        interface SurroundingMatch {
            open: number;
            close: number;
            depth: number;
        }

        function findNoneNested(text: string, open: string, close: string): SurroundingMatch[] {
            const matches: SurroundingMatch[] = [];

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

        function findBalanced(text: string, open: string, close: string): SurroundingMatch[] {
            const stack: { pos: number; depth: number }[] = [];
            const matches: SurroundingMatch[] = [];

            for (let i = 0; i < text.length;) {
                if (text.startsWith(open, i)) {
                    stack.push({ pos: i, depth: stack.length });
                    i += open.length;
                    continue;
                }

                if (text.startsWith(close, i) && stack.length > 0) {
                    const last = stack.pop()!;
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

        function matchToRanges(m: SurroundingMatch, target: SurroundingTarget, openLen: number, closeLen: number): Range[] {
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

        function annotateBySurrounding(text: string, open: string, close: string, options: SurroundingOptions): Range[] {
            const { target, nesting, depth, } = options;
            const openLen = open.length;
            const closeLen = close.length;
            const matches = nesting === "none" ? findNoneNested(text, open, close) : findBalanced(text, open, close);
            const filtered = matches.filter(m => {
                if (depth == null) return true;
                if (typeof depth === "number") return m.depth === depth;
                return depth(m.depth);
            });

            const ranges: Range[] = [];
            for (const m of filtered) {
                ranges.push(...matchToRanges(m, target, openLen, closeLen));
            }

            return mergeRanges(ranges);
        }

        class SurroundingTextStyleBuilder extends TextStyleBuilder<SurroundingRule> implements Atarabi.text.SurroundingTextStyleBuilder {
            protected options: SurroundingOptions;
            protected rules: SurroundingRule[] = [];
            protected styles: TextStyleOptions[] = [];
            constructor(protected open: string, protected close: string, options?: SurroundingOptions) {
                super();
                this.options = { target: "content", nesting: "balanced", ...options };
            }
            protected get defaultRule(): LineRule {
                return { from: 0 };
            }
            protected addRule(rule: SurroundingRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const surroudnings = annotateBySurrounding(text, this.open, this.close, this.options);
                const interpretRule = (rule: RangeRule, style: TextStyleOptions) => {
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
                    } else {
                        interpretRule(rule, this.styles[i]);
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

        function isLineBreakGrapheme(g: string): boolean {
            return g === "\n" || g === "\r" || g === "\r\n";
        }

        interface LineInfo {
            index: number;
            from: number;
            count: number;
            includeLF: boolean;
        }

        function segmentText(text: string): { graphemes: Intl.SegmentData[]; lines: LineInfo[]; } {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];

            const lines: LineInfo[] = [];

            let lineStart = 0;
            let lineIndex = 0;

            graphemes.forEach((seg, i) => {
                if (isLineBreakGrapheme(seg.segment)) {
                    const count = i - lineStart + 1;
                    lines.push({
                        index: lineIndex,
                        from: lineStart,
                        count,
                        includeLF: true,
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
                    includeLF: false,
                });
            }

            return { graphemes, lines };
        }

        function processGrapheme(text: string, rules: GraphemeRuleItem[], iteration: number): Range[][] {
            const { graphemes, lines } = segmentText(text);

            const results: Range[][] = rules.map(() => []);
            const contexts: Mutable<GraphemeContext>[] = rules.map(rule => ({
                index: 0,
                line: 0,
                indexInLine: 0,
                lineLength: 0,
                includeLF: false,
                totalLines: 0,
                iteration: 0,
                state: rule.initState(),
            }));

            for (let iter = 0; iter < iteration; iter++) {
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

                    rules.forEach((rule, i) => {
                        const ctx = contexts[i];
                        ctx.index = globalIndex;
                        ctx.line = line;
                        ctx.indexInLine = globalIndex - lineInfo.from;
                        ctx.includeLF = lineInfo.includeLF;
                        ctx.lineLength = lineInfo.count;
                        ctx.totalLines = lines.length;
                        ctx.iteration = iter;

                        if (iter === iteration - 1 && rule.match(g, ctx)) {
                            results[i].push({ from, count });
                        }
                    });
                });
            }

            return results.map(mergeRanges);
        }

        class GraphemeTextStyleBuilder extends TextStyleBuilder<GraphemeRule> implements Atarabi.text.GraphemeTextStyleBuilder {
            protected rules: GraphemeRuleItem[] = [];
            protected styles: TextStyleOptions[] = [];
            protected iteration: number = 1;
            protected get defaultRule(): GraphemeRule {
                return () => true;
            }
            iterations(iter: number): this {
                this.iteration = Math.max(1, iter);
                return this;
            }
            protected addRule(rule: GraphemeRule, style: TextStyleOptions): this {
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
                const rangesList = processGrapheme(text, this.rules, this.iteration);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = rangesList[i];
                    for (const {from, count} of ranges) {
                        result.push({from, count, style: this.styles[i]});
                    }
                }
                result = normalizeRanges(result);
                return result;
            }
        }

        abstract class TextStyleApplier implements Atarabi.text.TextStyleApplier {
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                 for (const {from, count, style: st} of this.resolve(property.value)) {
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
                this.options = { ...{ iterations: 1, initState: () => ({}) }, ...options };
            }
            resolve(text: string): RangeWithStyle[] {
                let result: RangeWithStyle[] = [];
                const { graphemes, lines } = segmentText(text);
                const ctx: Mutable<GraphemeContext> = {
                    index: 0,
                    line: 0,
                    indexInLine: 0,
                    lineLength: 0,
                    includeLF: false,
                    totalLines: 0,
                    iteration: 0,
                    state: this.options.initState(),
                };
                const fn = this.fn;
                const iteration = Math.max(1, this.options.iterations);

                for (let iter = 0; iter < iteration; iter++) {
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

                        ctx.index = globalIndex;
                        ctx.line = line;
                        ctx.indexInLine = globalIndex - lineInfo.from;
                        ctx.includeLF = lineInfo.includeLF;
                        ctx.lineLength = lineInfo.count;
                        ctx.totalLines = lines.length;
                        ctx.iteration = iter;

                        const ret = fn(g, ctx);
                        if (iter === iteration - 1 && ret) {
                            result.push({from, count, style: ret});
                        }
                    });
                }
                return result;
            }
        }

        class TextStyleComposer implements Atarabi.text.TextStyleComposer {
            protected builders: Atarabi.text.TextStyleApplier[] = [];
            protected layoutOptions: TextLayoutOptions = {};
            add(builder: Atarabi.text.TextStyleApplier): this {
                this.builders.push(builder);
                return this;
            }
            layout(layout: TextLayoutOptions): this {
                this.layoutOptions = { ...this.layoutOptions, ...layout };
                return this;
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                style = applyTextLayout(style, this.layoutOptions);
                 for (const {from, count, style: st} of this.resolve(property.value)) {
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
            CharClass,
            TextStyle: {
                all: (style: TextLayoutOptions | TextStyleOptions) => new AllTextStyleBuilder(style),
                // static
                byCharClass: () => new CharClassTextStyleBuilder(),
                byPosition: () => new PositionTextStyleBuilder(),
                byLine: () => new LineTextStyleBuilder(),
                bySurrounding: (open: string, close: string, options?: SurroundingOptions) => new SurroundingTextStyleBuilder(open, close, options),
                byGrapheme: () => new GraphemeTextStyleBuilder(),
                // dynamic
                forEachLine: (fn: ForEachLineFunc) => new ForEachLine(fn),
                forEachGrapheme: (fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions) => new ForEachGrapheme(fn, options),
                // compose
                compose: () => new TextStyleComposer(),
            },
            __internal: {
                annotateByCharClass: annotateByCharClassExclusive
            },
        } satisfies Atarabi.text.Lib;

        LIB.text = lib;

        return lib;
    },
})