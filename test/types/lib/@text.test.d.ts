declare namespace Atarabi {

    namespace text {

        /** @internal */
        interface Lib {
            __internal: {
                annotateByCharClass: typeof annotateByCharClass;
            };
        }

        function annotateByCharClass(text: string, charClasses: (CharMatcher | CharMatcher[])[]): { from: number; count?: number; index: number; }[];
    }

}
