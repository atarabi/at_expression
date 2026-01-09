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
            TextStyle(globalStyle?: TextLayoutOptions | TextStyleOptions): TextStyleContext<TextStyleApplier> & TextTransformer;
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

        interface TextLayout {
            direction: "left-to-right" | "right-to-left";
            firstLineIndent: number;
            isEveryLineComposer: boolean;
            isHangingRoman: boolean;
            justification: "alignCenter" | "alignLeft" | "alignRight" | "justifyFull" | "justifyLastCenter" | "justifyLastLeft" | "justifyLastRight";
            leadingType: "bottom-to-bottom" | "top-to-top";
            leftMargin: number;
            rightMargin: number;
            spaceAfter: number;
            spaceBefore: number;
        }

        type TextLayoutOptions = Partial<TextLayout>;

        interface TextStyle {
            applyFill: boolean;
            applyStroke: boolean;
            baselineDirection: "default" | "rotated" | "tate-chuu-yoko";
            baselineOption: "default" | "subscript" | "superscript";
            baselineShift: number;
            digitSet: "default" | "hindidigits";
            fillColor: [red: number, green: number, blue: number];
            font: string;
            fontSize: number;
            horizontalScaling: number;
            isAllCaps: boolean;
            isAutoLeading: boolean;
            isFauxBold: boolean;
            isFauxItalic: boolean;
            isLigature: boolean;
            isSmallCaps: boolean;
            kerning: number;
            kerningType: "manual" | "metrics" | "optical";
            leading: number;
            lineJoin: "bevel" | "miter" | "round";
            strokeColor: [red: number, green: number, blue: number];
            strokeWidth: number;
            tracking: number;
            tsume: number;
            verticalScaling: number;
        }

        type TextStyleOptions = Partial<TextStyle>;

        type Range = { from: number; count?: number };

        type RangeWithStyle = Range & { style: TextStyleOptions };

        interface TextStyleApplier {
            apply(property?: TextProperty, style?: TextStyleProperty): TextStyleProperty;
            resolve(text: string): RangeWithStyle[];
        }

        interface TextStyleBuilder<Rule> extends TextStyleApplier {
            rule(rule: Rule, style: TextStyleOptions): this;
        }

        type CharClassRule = CharMatchers;

        type CharClassMode = "exclusive" | "overlap"; // default: "overlap"

        type CharClassOptions = { mode?: CharClassMode; };

        interface CharClassTextStyleBuilder extends TextStyleBuilder<CharClassRule> {
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

        type PositionMode = "absolute" | "line"; // default: "absolute"

        type SkipWhen = CharMatchers;

        type PositionOptions = { mode?: PositionMode; skipWhen?: SkipWhen };

        interface PositionTextStyleBuilder extends TextStyleBuilder<PositionRule> {
        }

        type LineRule = RangeRule | RangeRule[];

        interface LineTextStyleBuilder extends TextStyleBuilder<LineRule> {
        }

        type SurroundingRule = number | number[] | { depth: number | number[]; target: SurroundingTarget; };

        type SurroundingTarget = "all" | "content" | "delimiter" | "open" | "close"; // default: "content"

        type SurroundingOptions = { defaultTarget?: SurroundingTarget; };

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

        interface ForEachSurroundingContext {
            readonly depth: number;
            readonly maxDepth: number;
        }

        type ForEachSurroundingFunc = (text: string, ctx: ForEachSurroundingContext) => RangeWithStyle | RangeWithStyle[] | void;

        interface TextTransformContext {
            readonly original: string;
        }

        interface TextTransformer {
            transform(fn: (text: string, ctx: TextTransformContext) => string): this;
        }

        type TextStyleFacade = {
            // static
            byCharClass(options?: CharClassOptions): TextStyleContext<CharClassTextStyleBuilder>;
            byRegExp(): TextStyleContext<RegExpTextStyleBuilder>;
            bySearch(options?: SearchOptions): TextStyleContext<SearchTextStyleBuilder>;
            byPosition(options?: PositionOptions): TextStyleContext<PositionTextStyleBuilder>;
            byLine(): TextStyleContext<LineTextStyleBuilder>;
            bySurrounding(open: string, close: string, options?: SurroundingOptions): TextStyleContext<SurroundingTextStyleBuilder>;
            bySurrounding(open: string, close: string, options?: SurroundingOptions): TextStyleContext<SurroundingTextStyleBuilder>;
            byGrapheme(): TextStyleContext<GraphemeTextStyleBuilder>;
            byWord(locale?: string): TextStyleContext<WordTextStyleBuilder>;
            bySentence(locale?: string): TextStyleContext<SentenceTextStyleBuilder>;
            // dynamic
            forEachLine(fn: ForEachLineFunc): TextStyleContext<TextStyleApplier>;
            forEachGrapheme(fn: ForEachGraphemeFunc, options?: ForEachGraphemeOptions): TextStyleContext<TextStyleApplier>;
            forEachWord(fn: ForEachWordFunc, options?: ForEachWordOptions): TextStyleContext<TextStyleApplier>;
            forEachSentence(fn: ForEachSentenceFunc, options?: ForEachSentenceOptions): TextStyleContext<TextStyleApplier>;
            forEachRegExp(re: RegExp | RegExp[], fn: ForEachRegExpFunc): TextStyleContext<TextStyleApplier>;
            forEachSurrounding(open: string, close: string, fn: ForEachSurroundingFunc): TextStyleContext<TextStyleApplier>;
        };

        type TextStyleContext<Builder> = Builder & TextStyleFacade;
    }

}
