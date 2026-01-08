declare namespace Atarabi {

    /**
     * Utility
     */
    type NonFunctionKeys<T> = {
        [K in keyof T]: T[K] extends Function ? never : K
    }[keyof T];

    type Fields<T> = Pick<T, NonFunctionKeys<T>>;

}
