interface Global {
    footage(name: "@text.jsx"): Footage<{
        load(force?: boolean): Atarabi.text.Lib;
    }>;
}

interface Layer {
    footage(name: "@text.jsx"): Footage<{
        load(force?: boolean): Atarabi.text.Lib;
    }>;
}

declare namespace Atarabi {

    namespace text {

        interface Lib {
            CharClass: CharClassMap;
            createMatcher: typeof createMatcher;
            TextStyle: TextStyleRules;
        }

        type CharClassKey =
            // --- East Asia ---
            | "Hiragana"
            | "Katakana"
            | "Kanji" // =Han
            | "Japanese"
            | "Han"
            | "Hangul"
            // --- Latin / European ---
            | "Latin"
            | "Greek"
            | "Cyrillic"
            // --- Middle East / Caucasus ---
            | "Arabic"
            | "Hebrew"
            | "Armenian"
            | "Georgian"
            // --- South Asia ---
            | "Devanagari"
            | "Bengali"
            | "Gurmukhi"
            | "Gujarati"
            | "Oriya"
            | "Tamil"
            | "Telugu"
            | "Kannada"
            | "Malayalam"
            | "Sinhala"
            // --- Southeast Asia ---
            | "Thai"
            | "Lao"
            | "Khmer"
            | "Myanmar"
            // --- African ---
            | "Ethiopic"
            // --- Other ---
            | "LowercaseLetter"
            | "UppercaseLetter"
            | "ModifierLetter"
            | "Alphabetic"
            | "Letter"
            | "DecimalNumber"
            | "Number"
            | "Emoji"
            | "Symbol"
            | "Punctuation"
            | "Control"
            | "SpaceSeparator"
            | "Separator"
            // --- Utility ---
            | "Yakumono"
            | "Whitespace"
            | "InlineWhitespace"
            | "LineBreak"
            ;

        interface CharClass {
            name: string;
            test(g: string): boolean;
        }

        type CharClassMap = Record<CharClassKey, CharClass>;

        type CharMatcher = CharClassKey | CharClass | RegExp;

        type CharMatchers = CharMatcher | CharMatcher[];

        type CharPredicate = (g: string) => boolean;

        function createMatcher(matchers: CharMatchers): CharPredicate;

        type TextLayoutKeys = "direction" | "firstLineIndent" | "isEveryLineComposer" | "isHangingRoman" | "justification" | "leadingType" | "leftMargin" | "rightMargin" | "spaceAfter" | "spaceBefore";

        type TextLayout = Pick<Fields<TextStyleProperty>, TextLayoutKeys>;

        type TextLayoutOptions = Partial<TextLayout>;

        type TextStyle = Omit<
            Fields<TextStyleProperty>,
            keyof Fields<Property> | TextLayoutKeys
        >;

        type TextStyleOptions = Partial<TextStyle>;

        type Range = { from: number; count?: number };

        type RangeWithStyle = Range & { style: TextStyleOptions };

        interface TextStyleApplier {
            apply(property?: TextProperty, style?: TextStyleProperty): TextStyleProperty;
            resolve(text: string): RangeWithStyle[];
        }

        interface TextStyleBuilder<Rule> extends TextStyleApplier {
            rule(style: TextStyleOptions): this;
            rule(rule: Rule, style: TextStyleOptions): this;
            layout(layout?: TextLayoutOptions): this;
        }

        type CharClassRule = CharMatchers;

        interface CharClassTextStyleBuilder extends TextStyleBuilder<CharClassRule> {
            exclusive(): this;
            overlay(): this; // default
        }

        type SearchRule = string | string[];

        type SearchOptions = { caseSensitive?: boolean; };

        interface SearchTextStyleBuilder extends TextStyleBuilder<SearchRule> {
        }

        type RegExpRule = RegExp | RegExp[];

        interface RegExpTextStyleBuilder extends TextStyleBuilder<RegExpRule> {
        }

        type RangeRule = Range | number | ((index: number) => boolean);

        type PositionRuleItem = Range | number | ((index: number, line?: number) => boolean);

        type PositionRule = PositionRuleItem | PositionRuleItem[];

        type SkipWhen = CharMatchers;

        interface PositionTextStyleBuilder extends TextStyleBuilder<PositionRule> {
            line(): this;
            global(): this; // default
            skipWhen(when: SkipWhen): this;
        }

        type LineRule = RangeRule | RangeRule[];

        interface LineTextStyleBuilder extends TextStyleBuilder<LineRule> {
        }

        type SurroundingRule = RangeRule | RangeRule[];

        type SurroundingTarget = "all" | "content" | "delimiter" | "open" | "close"; // default: "content"

        type SurroundingNesting = "none" | "balanced"; // default: "balanced"

        type SurroundingDepth = number | ((depth: number) => boolean);

        type SurroundingOptions = { target?: SurroundingTarget; nesting?: SurroundingNesting; depth?: SurroundingDepth; };

        interface SurroundingTextStyleBuilder extends TextStyleBuilder<SurroundingRule> {
        }

        interface GraphemeContext {
            readonly index: number;
            readonly line: number;
            readonly indexInLine: number;
            readonly itemsInLine: number;
            readonly includeLB: boolean; // whether the line this item belongs to has a line break
            readonly total: number;
            readonly totalLines: number;
            graphemeAt(index: number): string | null;
            prev(skipWhen?: SkipWhen): string | null;
            prevInLine(skipWhen?: SkipWhen): string | null;
            next(skipWhen?: SkipWhen): string | null;
            nextInLine(skipWhen?: SkipWhen): string | null;
            peek(offset: number, skipWhen?: SkipWhen): string | null;
            peekInLine(offset: number, skipWhen?: SkipWhen): string | null;
            isFirst(skipWhen?: SkipWhen): boolean;
            isFirstOfLine(skipWhen?: SkipWhen): boolean;
            isLast(skipWhen?: SkipWhen): boolean;
            isLastOfLine(skipWhen?: SkipWhen): boolean;
            state: Record<string, any>;
        }

        type GraphemeMatcher = (grapheme: string, ctx: GraphemeContext) => boolean | void;

        type GraphemeStateFn = (total: number, totalLines: number) => Record<string, any>;

        type GraphemeRule = GraphemeMatcher | { match: GraphemeMatcher; initState: GraphemeStateFn; };

        interface GraphemeTextStyleBuilder extends TextStyleBuilder<GraphemeRule> {
        }

        interface WordContext {
            readonly index: number; // word index
            readonly line: number;
            readonly indexInLine: number; // word index in line
            readonly itemsInLine: number; // word count in line
            readonly includeLB: boolean; // whether the line this item belongs to has a line break
            readonly total: number;
            readonly totalLines: number;
            graphemes(): string[];
            wordAt(index: number): string | null;
        }

        type UTF16Range = Range;

        type WordRangeFn = (word: string, ctx: WordContext) => UTF16Range | UTF16Range[] | void;

        type WordRule = WordRangeFn;

        interface WordTextStyleBuilder extends TextStyleBuilder<WordRule> {
        }

        interface SentenceContext {
            readonly index: number; // sentence index
            readonly line: number;
            readonly indexInLine: number; // sentence index in line
            readonly itemsInLine: number; // sentence count in line
            readonly includeLB: boolean; // whether the line this item belongs to has a line break
            readonly total: number;
            readonly totalLines: number;
            sentenceAt(index: number): string | null;
        }

        type SentenceRangeFn = (sentence: string, ctx: SentenceContext) => UTF16Range | UTF16Range[] | void;

        type SentenceRule = SentenceRangeFn;

        interface SentenceTextStyleBuilder extends TextStyleBuilder<SentenceRule> {
        }

        interface TextStyleComposer extends TextStyleApplier {
            add(builder: TextStyleApplier): this;
            layout(layout: TextLayoutOptions): this;
        }

        type ForEachLineFunc = (line: string, index: number, total: number) => TextStyleOptions | void;

        type ForEachGraphemeContext = GraphemeContext;

        type ForEachGraphemeFunc = (g: string, ctx: ForEachGraphemeContext) => TextStyleOptions | void;

        type ForEachGraphemeOptions = { initState?: GraphemeStateFn; };

        type ForEachWordContext = WordContext;

        type ForEachWordFunc = (w: string, ctx: ForEachWordContext) => RangeWithStyle | RangeWithStyle[] | void;

        type ForEachWordOptions = { locale?: string; };

        type ForEachSentenceContext = SentenceContext;

        type ForEachSentenceFunc = (w: string, ctx: ForEachSentenceContext) => RangeWithStyle | RangeWithStyle[] | void;

        type ForEachSentenceOptions = { locale?: string; };

        interface ForEachRegExpContext {
            readonly index: number;
            readonly patternIndex: number;
        }

        type ForEachRegExpFunc = (match: RegExpExecArray, ctx: ForEachRegExpContext) => RangeWithStyle | RangeWithStyle[] | void;

        interface TextStyleRules {
            all(style: TextLayoutOptions | TextStyleOptions): TextStyleApplier;
            // static
            byCharClass(): CharClassTextStyleBuilder;
            byRegExp(): RegExpTextStyleBuilder;
            bySearch(options?: SearchOptions): SearchTextStyleBuilder;
            byPosition(): PositionTextStyleBuilder;
            byLine(): LineTextStyleBuilder;
            bySurrounding(open: string, close: string, options?: SurroundingOptions): SurroundingTextStyleBuilder;
            byGrapheme(): GraphemeTextStyleBuilder;
            byWord(locale?: string): WordTextStyleBuilder;
            bySentence(locale?: string): SentenceTextStyleBuilder;
            // dynamic
            forEachLine(fn: ForEachLineFunc): TextStyleApplier;
            forEachGrapheme(fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions): TextStyleApplier;
            forEachWord(fn: ForEachWordFunc, options?: ForEachWordOptions): TextStyleApplier;
            forEachSentence(fn: ForEachSentenceFunc, options?: ForEachSentenceOptions): TextStyleApplier;
            forEachRegExp(re: RegExp | RegExp[], fn: ForEachRegExpFunc): TextStyleApplier;
            // compose
            compose(): TextStyleComposer;
        }

        /** @internal */
        interface Lib {
            __internal: {
                annotateByCharClass: typeof annotateByCharClass;
            };
        }

        function annotateByCharClass(text: string, charClasses: (CharMatcher | CharMatcher[])[]): { from: number; count?: number; index: number; }[];
    }

}
