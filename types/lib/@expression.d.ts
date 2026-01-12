interface _HelperObject {
    __Atarabi: Atarabi.Expression.Cache;
}

declare namespace Atarabi {

    namespace Expression {

        interface Cache { }

        interface Action {
            namespace: "@expression";
            scope: string;
            action: string;
        }

    }

}
