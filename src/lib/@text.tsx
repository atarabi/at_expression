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
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setApplyFill(value as any, startIndex + n, 1);
                    }
                    return style;
                case "applyStroke":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setApplyStroke(value as any, startIndex + n, 1);
                    }
                    return style;
                case "baselineDirection":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setBaselineDirection(value as any, startIndex + n, 1);
                    }
                    return style;
                case "baselineOption":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setBaselineOption(value as any, startIndex + n, 1);
                    }
                    return style;
                case "baselineShift":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setBaselineShift(value as any, startIndex + n, 1);
                    }
                    return style;
                case "digitSet":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setDigitSet(value as any, startIndex + n, 1);
                    }
                    return style;
                case "fillColor":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFillColor(value as any, startIndex + n, 1);
                    }
                    return style;
                case "font":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFont(value as any, startIndex + n, 1);
                    }
                    return style;
                case "fontSize":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFontSize(value as any, startIndex + n, 1);
                    }
                    return style;
                case "horizontalScaling":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setHorizontalScaling(value as any, startIndex + n, 1);
                    }
                    return style;
                case "isAllCaps":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setAllCaps(value as any, startIndex + n, 1);
                    }
                    return style;
                case "isAutoLeading":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setAutoLeading(value as any, startIndex + n, 1);
                    }
                    return style;
                case "isFauxBold":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFauxBold(value as any, startIndex + n, 1);
                    }
                    return style;
                case "isFauxItalic":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setFauxItalic(value as any, startIndex + n, 1);
                    }
                    return style;
                case "isLigature":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setLigature(value as any, startIndex + n, 1);
                    }
                    return style;
                case "isSmallCaps":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setSmallCaps(value as any, startIndex + n, 1);
                    }
                    return style;
                case "kerning":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setKerning(value as any, startIndex + n);
                    }
                    return style;
                case "kerningType":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setKerningType(value as any, startIndex + n, 1);
                    }
                    return style;
                case "leading":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setLeading(value as any, startIndex + n, 1);
                    }
                    return style;
                case "lineJoin":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setLineJoin(value as any, startIndex + n, 1);
                    }
                    return style;
                case "strokeColor":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setStrokeColor(value as any, startIndex + n, 1);
                    }
                    return style;
                case "strokeWidth":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setStrokeWidth(value as any, startIndex + n, 1);
                    }
                    return style;
                case "tracking":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setTracking(value as any, startIndex + n, 1);
                    }
                    return style;
                case "tsume":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setTsume(value as any, startIndex + n, 1);
                    }
                    return style;
                case "verticalScaling":
                    for (let n = 0; n < numOfCharacters; n++) {
                        style = style.setVerticalScaling(value as any, startIndex + n, 1);
                    }
                    return style;
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
            abstract apply(property: TextProperty, style?: TextStyleProperty): TextStyleProperty;
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
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
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
                } else {
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

        type Range = Atarabi.text.Range;
        type PositionRule = Atarabi.text.PositionRule;

        function convertGraphemeRangesForText(text: string, rules: PositionRule[], line: number = 0): Range[][] {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];
            const utf16Offsets: number[] = [];
            let offset = 0;
            for (const grapheme of graphemes) {
                utf16Offsets.push(offset);
                offset += grapheme.segment.length;
            }
            utf16Offsets.push(offset);

            const result: Range[][] = [];

            for (const rule of rules) {
                let range: Range[] = [];

                if (typeof rule === "number") {
                    if (rule < graphemes.length) {
                        const fromUtf16 = utf16Offsets[rule];
                        const toUtf16 = utf16Offsets[rule + 1];
                        range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                    }
                } else if (typeof rule === "function") {
                    for (let i = 0; i < graphemes.length; i++) {
                        if (rule(i, line)) {
                            const fromUtf16 = utf16Offsets[i];
                            const toUtf16 = utf16Offsets[i + 1];
                            range.push({ from: fromUtf16, count: toUtf16 - fromUtf16 });
                        }
                    }
                    range = mergeRanges(range);
                } else {
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

        function convertGraphemeRangesByLine(text: string, rules: PositionRule[]): Range[][] {
            const lineRanges = annotateByLine(text);
            const result: Range[][] = rules.map(() => []);
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

        class PositionTextStyleBuilder extends TextStyleBuilder<PositionRule> implements Atarabi.text.PositionTextStyleBuilder {
            protected rules: PositionRule[] = [];
            protected styles: TextStyleOptions[] = [];
            protected doLine: boolean = false;
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
            protected addRule(rule: PositionRule, style: TextStyleOptions): this {
                this.rules.push(rule);
                this.styles.push(style);
                return this;
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
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
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
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
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                style = this.applyLayout(style);
                const surroudnings = annotateBySurrounding(property.value, this.open, this.close, this.options);
                for (let i = 0; i < this.rules.length; i++) {
                    const ranges = deriveRangesFromRangeRule(surroudnings, this.rules[i]);
                    for (const range of ranges) {
                        const startIndex = range.from;
                        const numOfCharacters = range.count;
                        if (numOfCharacters <= 0) continue;
                        style = applyStyle(style, this.styles[i], startIndex, numOfCharacters);
                    }
                }
                return style;
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

        function segmentText(text: string): { graphemes: Intl.SegmentData[]; lineOf: number[]; indexInLineOf: number[]; lineLengthOf: number[]; totalLines: number; } {
            const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
            const graphemes = [...segmenter.segment(text)];

            const lineOf: number[] = [];
            const indexInLineOf: number[] = [];
            const lineLengthOf: number[] = [];

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
                totalLines: line + 1,
            };
        }

        function processGrapheme(text: string, rules: GraphemeRuleItem[], iteration: number): Range[][] {
            const { graphemes, lineOf, indexInLineOf, lineLengthOf, totalLines } = segmentText(text);

            const results: Range[][] = rules.map(() => []);
            const contexts: Mutable<GraphemeContext>[] = rules.map(rule => ({
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
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
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

        type ForEachLineFunc = Atarabi.text.ForEachLineFunc;

        class ForEachLine implements Atarabi.text.TextStyleApplier {
            constructor(public fn: ForEachLineFunc) {
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
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

        type ForEachGraphemeFunc = Atarabi.text.ForEachGraphemeFunc;
        type ForEachGraphemeOptions = Atarabi.text.ForEachGraphemeOptions;

        class ForEachGrapheme implements Atarabi.text.TextStyleApplier {
            protected options: ForEachGraphemeOptions;
            constructor(public fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions) {
                this.options = { ...{ iterations: 1, initState: () => ({}) }, ...options };
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
                const { graphemes, lineOf, indexInLineOf, lineLengthOf, totalLines } = segmentText(property.value);
                const ctx: Mutable<GraphemeContext> = {
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

        type TextStyleApplier = Atarabi.text.TextStyleApplier;

        class TextStyleComposer implements Atarabi.text.TextStyleComposer {
            protected builders: TextStyleApplier[] = [];
            protected layoutOptions: TextLayoutOptions = {};
            add(builder: TextStyleApplier): this {
                this.builders.push(builder);
                return this;
            }
            layout(layout: TextLayoutOptions): this {
                this.layoutOptions = { ...this.layoutOptions, ...layout };
                return this;
            }
            apply(property: TextProperty = thisLayer.text.sourceText, style: TextStyleProperty = property.style): TextStyleProperty {
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