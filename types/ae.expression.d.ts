// for convenience
type _Color = [red: number, green: number, blue: number];
type _ColorA = [red: number, green: number, blue: number, alpha: number];
type _Boolean = number;
type _Vector2 = [x: number, y: number];
type _Vector3 = [x: number, y: number, z: number];
type _Vector = _Vector2 | _Vector3;
type _Layer = Layer | Light | Camera;
type _PropertyValue = number | number[] | string | _PathObject;
type _NumericND = number | number[];

// Helper
interface _HelperObject {
    [key: string]: any;
    global: Global;
    build: string;
    engineName: string;
    log(...texts: any[]): void;
    evalFile(path: string): any;
}

// General
/*
 * Global: https://ae-expressions.docsforadobe.dev/general/global/
 */
interface Global {
    $: _HelperObject;
    colorDepth: 8 | 16 | 32;
    thisComp: Comp;
    thisLayer: _Layer;
    thisProject: Project;
    thisProperty: Property;
    time: number;
    value: _PropertyValue;
    comp(name: string): Comp;
    footage(name: string): Footage;
    posterizeTime(updatesPerSecond: number): number;
}

declare const $: Global["$"];
declare const colorDepth: Global["colorDepth"];
declare const thisComp: Global["thisComp"];
declare const thisLayer: Global["thisLayer"];
declare const thisProject: Global["thisProject"];
declare const thisProperty: Global["thisProperty"];
declare const time: Global["time"];
declare const value: Global["value"];
declare const comp: Global["comp"];
declare const footage: Global["footage"];
declare const posterizeTime: Global["posterizeTime"];

interface Layer {
    colorDepth: 8 | 16 | 32;
    thisComp: Comp;
    thisProject: Project;
    time: number;
    comp(name: string): Comp;
    footage(name: string): Footage;
    posterizeTime(updatesPerSecond: number): number;
}

/*
 * Time Conversion: https://ae-expressions.docsforadobe.dev/general/time-conversion/
 */
declare function framesToTime(frames: number, fps?: number): number;

declare function timeToCurrentFormat(t?: number, fps?: number, isDuration?: boolean, ntscDropFrame?: boolean): string;

declare function timeToFeetAndFrames(t?: number, framesPerFoot?: number, isDuration?: boolean): string;

declare function timeToFrames(t?: number, fps?: number, isDuration?: boolean): number;

declare function timeToNTSCTimecode(t?: number, ntscDropFrame?: boolean, isDuration?: boolean): string;

declare function timeToTimecode(t?: number, timecodeBase?: number, isDuration?: boolean): string;

interface Layer {
    framesToTime: typeof framesToTime;
    timeToCurrentFormat: typeof timeToCurrentFormat;
    timeToFeetAndFrames: typeof timeToFeetAndFrames;
    timeToFrames: typeof timeToFrames;
    timeToNTSCTimecode: typeof timeToNTSCTimecode;
    timeToTimecode: typeof timeToTimecode;
}

/*
 * Vector Math: https://ae-expressions.docsforadobe.dev/general/vector-math/
 */
declare function add(vec1: number[], vec2: number[]): number[];

declare function clamp(value: number | number[], limit1: number | number[], limit2: number | number[]): number | number[];

declare function cross(vec1: number[], vec2: number[]): number[];

declare function div(vec: number[], amount: number): number[];

declare function dot(vec1: number[], vec2: number[]): number;

declare function length(vec1: number[], point2?: number[]): number;

declare function lookAt(fromPoint: number[], atPoint: number[]): number[];

declare function mul(vec: number[], amount: number): number[];

declare function normalize(vec: number[]): number[];

declare function sub(vec1: number[], vec2: number[]): number[];

interface Layer {
    add: typeof add;
    clamp: typeof clamp;
    cross: typeof cross;
    div: typeof div;
    dot: typeof dot;
    length: typeof length;
    lookAt: typeof lookAt;
    mul: typeof mul;
    normalize: typeof normalize;
    sub: typeof sub;
}

/*
 * Random Numbers: https://ae-expressions.docsforadobe.dev/general/random-numbers/
 */
declare function gaussRandom(): number;
declare function gaussRandom<T extends number | number[]>(maxValOrArray?: T): T;
declare function gaussRandom<T extends number | number[]>(minValOrArray: T, maxValOrArray: T): T;

declare function noise(valOrArray: number | number[]): number;

declare function random(): number;
declare function random<T extends number | number[]>(maxValOrArray?: T): T;
declare function random<T extends number | number[]>(minValOrArray: T, maxValOrArray: T): T;

declare function seedRandom(offset: number, timeless?: boolean): void;

interface Layer {
    gaussRandom: typeof gaussRandom;
    noise: typeof noise;
    random: typeof random;
    seedRandom: typeof seedRandom;
}

/*
 * Interpolation: https://ae-expressions.docsforadobe.dev/general/interpolation/
 */
declare function linear<T extends number | number[]>(t: number, tMin: number, tMax: number, value1: T, value2: T): T;
declare function linear<T extends number | number[]>(t: number, value1: T, value2: T): T;

declare function ease<T extends number | number[]>(t: number, tMin: number, tMax: number, value1: T, value2: T): T;
declare function ease<T extends number | number[]>(t: number, value1: T, value2: T): T;

declare function easeIn<T extends number | number[]>(t: number, tMin: number, tMax: number, value1: T, value2: T): T;
declare function easeIn<T extends number | number[]>(t: number, value1: T, value2: T): T;

declare function easeOut<T extends number | number[]>(t: number, tMin: number, tMax: number, value1: T, value2: T): T;
declare function easeOut<T extends number | number[]>(t: number, value1: T, value2: T): T;

interface Layer {
    linear: typeof linear;
    ease: typeof ease;
    easeIn: typeof easeIn;
    easeOut: typeof easeOut;
}

/*
 * Color Conversion: https://ae-expressions.docsforadobe.dev/general/color-conversion/
 */
declare function rgbToHsl(rgbaArray: _ColorA): _ColorA;

declare function hslToRgb(hslaArray: _ColorA): _ColorA;

declare function hexToRgb(hexString: string): _ColorA;

interface Layer {
    rgbToHsl: typeof rgbToHsl;
    hslToRgb: typeof hslToRgb;
    hexToRgb: typeof hexToRgb;
}

/*
 * Other Math: https://ae-expressions.docsforadobe.dev/general/other-math/
 */
declare function degreesToRadians(degrees: number): number;

declare function radiansToDegrees(radians: number): number;

interface Layer {
    degreesToRadians: typeof degreesToRadians;
    radiansToDegrees: typeof radiansToDegrees;
}

// Objects
/*
 * Project: https://ae-expressions.docsforadobe.dev/objects/project/
 */
declare class Project {
    bitsPerChannel: 8 | 16 | 32;
    fullPath: string;
    linearBlending: boolean;
}

/*
 * Comp: https://ae-expressions.docsforadobe.dev/objects/comp/
 */
declare class Comp {
    activeCamera: Camera;
    bgColor: _ColorA;
    displayStartTime: number;
    duration: number;
    frameDuration: number;
    height: number;
    marker: MarkerProperty;
    name: string;
    ntscDropFrame: boolean;
    numLayers: number;
    pixelAspect: number;
    shutterAngle: number;
    shutterPhase: number;
    width: number;
    layer(index: number): _Layer;
    layer(name: string): _Layer;
    layer(otherLayer: _Layer, relIndex: number): _Layer;
    layerByComment(comment: string): _Layer;
}

/*
 * Footage: https://ae-expressions.docsforadobe.dev/objects/footage/
 */
declare class Footage<Data = any> {
    duration: number;
    frameDuration: number;
    height: number;
    name: string;
    ntscDropFrame: boolean;
    pixelAspect: number;
    sourceData: Data;
    sourceText: string;
    width: number;
    dataKeyCount(dataPath: number[]): number;
    dataKeyTimes(dataPath: number[], t0?: number, t1?: number): number[];
    dataKeyValues(dataPath: number[], t0?: number, t1?: number): any[];
    dataValue(dataPath: number[]): any;
}

/*
 * Camera: https://ae-expressions.docsforadobe.dev/objects/camera/
 */
declare class Camera extends Layer {
    active: boolean;
    aperture: Property<number>;
    blurLevel: Property<number>;
    depthOfField: Property<_Boolean>;
    focusDistance: Property<number>;
    highlightGain: Property<number>;
    highlightSaturation: Property<number>;
    highlightThreshold: Property<number>;
    irisAspectRatio: Property<number>;
    irisDiffractionFringe: Property<number>;
    irisRotation: Property<number>;
    irisRoundness: Property<number>;
    irisShape: Property<number>;
    pointOfInterest: Property<_Vector3>;
    zoom: Property<number>;
    // unavailable
    override source: undefined;
    override effect: undefined;
    override mask: undefined;
    override width: undefined;
    override height: undefined;
    override anchorPoint: undefined;
    override scale: undefined;
    override opacity: undefined;
    override audioLevels: undefined;
    override timeRemap: undefined;
}

/*
 * Light: https://ae-expressions.docsforadobe.dev/objects/light/
 */
declare class Light extends Layer {
    castsShadows: Property<_Boolean>;
    color: Property<_ColorA>;
    coneAngle: Property<number>;
    coneFeather: Property<number>;
    falloff: Property<number>;
    falloffDistance: Property<number>;
    intensity: Property<number>;
    pointOfInterest: Property<_Vector3>;
    radius: Property<number>;
    shadowDarkness: Property<number>;
    shadowDiffusion: Property<number>;
    // unavailable
    override source: undefined;
    override effect: undefined;
    override mask: undefined;
    override width: undefined;
    override height: undefined;
    override anchorPoint: undefined;
    override scale: undefined;
    override opacity: undefined;
    override audioLevels: undefined;
    override timeRemap: undefined;
}

/*
 * Property Group: https://ae-expressions.docsforadobe.dev/objects/propertygroup/
 */
declare class Group {
    name: string;
    numProperties: number;
    propertyIndex: number;
    propertyGroup(countUp?: number): Group;
}

interface Group {
    (name: string): Group | Property;
    (index: number): Group | Property;
}

/*
 * Effect: https://ae-expressions.docsforadobe.dev/objects/effect/
 */
declare class Effect {
    active: boolean;
    param(name: string): Property;
    param(index: number): Property;
}

interface Effect {
    (name: string): Property;
    (index: number): Property;
}

/*
 * Mask: https://ae-expressions.docsforadobe.dev/objects/mask/
 */
declare class Mask {
    invert: boolean;
    maskExpansion: Property<number>;
    maskFeather: Property<number>;
    maskOpacity: Property<number>;
    maskPath: PathProperty;
}

/*
 * Property: https://ae-expressions.docsforadobe.dev/objects/property/
 */
declare class Property<Value extends _PropertyValue = _PropertyValue> {
    name: string;
    numKeys: number;
    propertyIndex: string;
    speed: string;
    value: Value;
    velocity: _NumericND;
    key(index: number): Key | MarkerKey;
    key(markerName: string): MarkerKey;
    loopIn(type?: _LoopType, numKeyframes?: number): Value;
    loopInDuration(type?: _LoopType, duration?: number): Value;
    loopOut(type?: _LoopType, numKeyframes?: number): Value;
    loopOutDuration(type?: _LoopType, duration?: number): Value;
    nearestKey(t: number): Key | MarkerKey;
    nextKey(time: number): Key | MarkerKey;
    previousKey(time: number): Key | MarkerKey;
    propertyGroup(countUp?: number): Group;
    smooth(width?: number, samples?: number, t?: number): Value;
    speedAtTime(t: number): number;
    temporalWiggle(freq: number, amp: number, octaves?: number, amp_mult?: number, t?: number): Value;
    valueAtTime(t: number): Value;
    velocityAtTime(t: number): Value extends _NumericND ? Value: _NumericND;
    wiggle(freq: number, amp: number, octaves?: number, amp_mult?: number, t?: number): Value;
}

type _LoopType = "cycle" | "pingpong" | "offset" | "continue";

// with
declare const name: Property["name"] ;
declare const numKeys: Property["numKeys"];
declare const propertyIndex: Property["propertyIndex"];
declare const speed: Property["speed"];
declare const velocity: Property["velocity"];
declare const key: Property["key"];
declare const loopIn: Property["loopIn"];
declare const loopInDuration: Property["loopInDuration"];
declare const loopOut: Property["loopOut"];
declare const loopOutDuration: Property["loopOutDuration"];
declare const nearestKey: Property["nearestKey"];
declare const nextKey: Property["nextKey"];
declare const previousKey: Property["previousKey"];
declare const propertyGroup: Property["propertyGroup"];
declare const smooth: Property["smooth"];
declare const speedAtTime: Property["speedAtTime"];
declare const temporalWiggle: Property["temporalWiggle"];
declare const valueAtTime: Property["valueAtTime"];
declare const velocityAtTime: Property["velocityAtTime"];
declare const wiggle: Property["wiggle"];

/*
 * Dropdown Menus: https://ae-expressions.docsforadobe.dev/objects/dropdown/
 */
interface Property {
    items?: string[];
    text?: string;
    textAtTime?(time: number): string;
}

/*
 * Marker Property: https://ae-expressions.docsforadobe.dev/objects/marker-property/
 */
declare class MarkerProperty extends Property {
    numKeys: number;
    key(index: number): MarkerKey;
    key(name: string): MarkerKey;
    nearestKey(t: number): MarkerKey;
}

/*
 * Path Property: https://ae-expressions.docsforadobe.dev/objects/path-property/
 */
declare class PathProperty extends Property {
    name: string;
    createPath(points: _Vector2[], inTangents?: _Vector2[], outTangents?: _Vector2[], is_closed?: boolean): _PathObject;
    inTangents(t?: number): _Vector2[];
    isClosed(): boolean;
    normalOnPath(percentage?: number, t?: number): _Vector2;
    outTangents(t?: number): _Vector2[];
    pointOnPath(percentage?: number, t?: number): _Vector2;
    points(t?: number): _Vector2[];
    tangentOnPath(percentage?: number, t?: number): _Vector2;
}

type _PathObject = { className: "Path Object"; };

/*
 * Key: https://ae-expressions.docsforadobe.dev/objects/key/
 */
declare class Key {
    index: number;
    time: number;
}

/*
 * MarkerKey: https://ae-expressions.docsforadobe.dev/objects/markerkey/
 */
declare class MarkerKey extends Key {
    chapter: string;
    comment: string;
    cuePointName: string;
    duration: number;
    eventCuePoint: boolean;
    frameTarget: string;
    parameters: any;
    protectedRegion: boolean;
    url: string;
}

// Layer
declare class Layer {
    /*
     * Layer Sub-objects: https://ae-expressions.docsforadobe.dev/layer/sub-objects/
     */
    source: Comp | Footage;
    effect(name: string): Effect;
    effect(index: number): Effect;
    mask(name: string): Mask;
    mask(index: number): Mask;
    sourceRectAtTime(t?: number, includeExtents?: boolean): { top: number; left: number; width: number; height: number; };
    sourceTime(t?: number): number;

    /*
     * Layer General: https://ae-expressions.docsforadobe.dev/layer/general/
     */
    active: boolean;
    audioActive: boolean;
    enabled: boolean;
    hasAudio: boolean;
    hasParent: boolean;
    hasVideo: boolean;
    height: boolean;
    index: number;
    inPoint: number;
    outPoint: number;
    parent: _Layer;
    startTime: number;
    width: number;
    sampleImage(point: _Vector2, radius?: _Vector2, postEffect?: boolean, t?: number): _ColorA;

    /*
     * Layer Properties: https://ae-expressions.docsforadobe.dev/layer/properties/
     */
    anchorPoint: Property<_Vector>;
    audioLevels: Property<_Vector2>;
    marker: MarkerProperty;
    name: string;
    opacity: Property<number>;
    position: Property<_Vector>;
    rotation: Property<number>;
    scale: Property<_Vector>;
    timeRemap: Property<number>;

    /*
     * Layer Space Transforms: https://ae-expressions.docsforadobe.dev/layer/layer-space-transforms/
     */
    toComp(point: _Vector, t?: number): _Vector;
    fromComp(point: _Vector, t?: number): _Vector;
    toWorld(point: _Vector, t?: number): _Vector;
    fromWorld(point: _Vector, t?: number): _Vector;
    toCompVec(vec: _Vector, t?: number): _Vector;
    fromCompVec(vec: _Vector, t?: number): _Vector;
    toWorldVec(vec: _Vector, t?: number): _Vector;
    fromWorldVec(vec: _Vector, t?: number): _Vector;
    fromCompToSurface(point: _Vector, t?: number): _Vector;

    /*
     * Layer 3D: https://ae-expressions.docsforadobe.dev/layer/threed/
     */
    acceptsLights: Property<_Boolean>;
    acceptsShadows: Property<_Boolean>;
    ambient: Property<number>;
    castsShadows: Property<_Boolean>;
    diffuse: Property<number>;
    lightTransmission: Property<number>;
    metal: Property<number>;
    orientation: Property<_Vector3>;
    rotationX: Property<number>;
    rotationY: Property<number>;
    rotationZ: Property<number>;
    shininess: Property<number>;
    specular: Property<number>;
}

//with
declare const source: Layer["source"];
declare const sourceRectAtTime: Layer["sourceRectAtTime"];
declare const sourceTime: Layer["sourceTime"];
declare const active: Layer["active"];
declare const audioActive: Layer["audioActive"];
declare const enabled: Layer["enabled"];
declare const hasAudio: Layer["hasAudio"];
declare const hasParent: Layer["hasParent"];
declare const hasVideo: Layer["hasVideo"];
declare const height: Layer["height"];
declare const index: Layer["index"];
declare const inPoint: Layer["inPoint"];
declare const outPoint: Layer["outPoint"];
declare const parent: Layer["parent"];
declare const startTime: Layer["startTime"];
declare const width: Layer["width"];
declare const sampleImage: Layer["sampleImage"];
declare const anchorPoint: Layer["anchorPoint"];
declare const audioLevels: Layer["audioLevels"];
declare const marker: Layer["marker"];
declare const opacity: Layer["opacity"];
declare const position: Layer["position"];
declare const rotation: Layer["rotation"];
declare const scale: Layer["scale"];
declare const timeRemap: Layer["timeRemap"];
declare const toComp: Layer["toComp"];
declare const fromComp: Layer["fromComp"];
declare const toWorld: Layer["toWorld"];
declare const fromWorld: Layer["fromWorld"];
declare const toCompVec: Layer["toCompVec"];
declare const fromCompVec: Layer["fromCompVec"];
declare const toWorldVec: Layer["toWorldVec"];
declare const fromWorldVec: Layer["fromWorldVec"];
declare const fromCompToSurface: Layer["fromCompToSurface"];
declare const acceptsLights: Layer["acceptsLights"];
declare const acceptsShadows: Layer["acceptsShadows"];
declare const ambient: Layer["ambient"];
declare const castsShadows: Layer["castsShadows"];
declare const diffuse: Layer["diffuse"];
declare const lightTransmission: Layer["lightTransmission"];
declare const metal: Layer["metal"];
declare const orientation: Layer["orientation"];
declare const rotationX: Layer["rotationX"];
declare const rotationY: Layer["rotationY"];
declare const rotationZ: Layer["rotationZ"];
declare const shininess: Layer["shininess"];
declare const specular: Layer["specular"];


interface Layer {
    transform: _TransformGroup;
    geometryOption: _GeometryOptionGroup;
    materialOption: _MaterialOptionGroup;
    compositingOption: _CompositingOptionGroup;
    materialAssignment: Group;
    motionTracker: Group;
}

declare class _TransformGroup extends Group {
}

interface _TransformGroup {
    anchorPoint: Property<_Vector>;
    position: Property<_Vector>;
    scale: Property<_Vector>;
    zRotation: Property<number>;
    rotation: Property<number>;
    opacity: Property<number>;
    orientation: Property<_Vector3>;
    xRotation: Property<number>;
    yRotation: Property<number>;
}

declare class _GeometryOptionGroup extends Group {
}

interface _GeometryOptionGroup {
    bevelStyle: Property<number>; // text, shape
    bevelDepth: Property<number>; // text, shape
    holeBevelDepth: Property<number>; // text, shape
    extrusionDepth: Property<number>; // text, shape
    curvature: Property<number>; // solid, av
    segments: Property<number>; // solid, av
}

declare class _MaterialOptionGroup extends Group {
}

interface _MaterialOptionGroup {
    castsShadows: Property<_Boolean>;
    acceptsShadows:Property<_Boolean>;
    acceptsLights: Property<_Boolean>;
    appearsInReflections: Property<_Boolean>;
    shadowColor: Property<_ColorA>;
    ambient: Property<number>;
    diffuse: Property<number>;
    specularIntensity: Property<number>;
    specularShininess: Property<number>;
    metal: Property<number>;
    reflectionIntensity: Property<number>;
    reflectionSharpness: Property<number>;
    reflectionRolloff: Property<number>;
}

declare class _CompositingOptionGroup extends Group {
}

interface _CompositingOptionGroup {
    castsShadows: Property<_Boolean>;
    acceptsShadows: Property<_Boolean>;
    acceptsLight: Property<_Boolean>;
    shadowColor: Property<_ColorA>;
}

// Text
/*
 * Text: https://ae-expressions.docsforadobe.dev/text/text/
 */
interface Layer {
    text?: _TextGroup;
}

// with
declare const text: Layer["text"];


declare class _TextGroup extends Group {
}

interface _TextGroup {
    sourceText: TextProperty;
    animator: _AnimatorsGroup;
    selector: _SelectorsGroup;
}

declare class _AnimatorsGroup extends Group {
}

interface _AnimatorsGroup {
    (name: string): _AnimatorGroup;
    (index: number): _AnimatorGroup;
}

declare class _AnimatorGroup extends Group {
}

interface _AnimatorGroup {
    property: _AnimatorPropertiesGroup;
}

declare class _AnimatorPropertiesGroup extends Group {
}

interface _AnimatorPropertiesGroup {
    anchorPoint?: Property<_Vector2>;
    position?: Property<_Vector2>;
    scale?: Property<_Vector2>;
    skew?: Property<number>;
    skewAxis?: Property<number>;
    zRotation?: Property<number>;
    rotation?: Property<number>;
    opacity?: Property<number>;
    fillOpacity?: Property<number>;
    strokeOpacity?: Property<number>;
    fillColor?: Property<_ColorA>;
    strokeColor?: Property<_ColorA>;
    fillHue?: Property<number>;
    strokeHue?: Property<number>;
    fillSaturation?: Property<number>;
    strokeSaturation?: Property<number>;
    fillBrightness?: Property<number>;
    strokeBrightness?: Property<number>;
    strokeWidth?: Property<number>;
    lineAnchor?: Property<number>;
    trackingType?: Property<number>;
    trackingAmount?: Property<number>;
    characterAlignment?: Property<number>;
    characterRange?: Property<number>;
    characterValue?: Property<number>;
    characterOffset?: Property<number>;
    lineSpacing?: Property<number>;
    blur?: Property<number>;
}

declare class _SelectorsGroup extends Group {
}

/*
 * Source Text: https://ae-expressions.docsforadobe.dev/text/sourcetext/
 */
declare class TextProperty extends Property {
    value: string;
    isHorizontalText: boolean;
    isParagraphText: boolean;
    isPointText: boolean;
    isVerticalText: boolean;
    style: TextStyleProperty;
    createStyle(): TextStyleProperty;
    getStyleAt(charIndex: number, time?: number): TextStyleProperty;
}

/*
 * Text Style: 
 */
declare class TextStyleProperty extends Property {
    applyFill: boolean;
    applyStroke: boolean;
    baselineDirection: _BaseLineDirection;
    baselineOption: _BaselineOption;
    baselineShift: number;
    digitSet: _DigitSet;
    direction: _TextDirection;
    fillColor: _Color;
    firstLineIndent: number;
    font: string;
    fontSize: number;
    horizontalScaling: number;
    isAllCaps: boolean;
    isAutoLeading: boolean;
    isEveryLineComposer: boolean;
    isFauxBold: boolean;
    isFauxItalic: boolean;
    isHangingRoman: boolean;
    isLigature: boolean;
    isSmallCaps: boolean;
    justification: _Justification;
    kerning: number;
    kerningType: _KerningType;
    leading: number;
    leadingType: _LeadingType;
    leftMargin: number;
    lineJoin: _LineJoin;
    rightMargin: number;
    spaceAfter: number;
    spaceBefore: number;
    strokeColor: _Color;
    strokeWidth: number;
    tracking: number;
    tsume: number;
    verticalScaling: number;
    replaceText(value: string, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setAllCaps(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setApplyFill(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setApplyStroke(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setAutoLeading(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setBaselineDirection(value: _BaseLineDirection, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setBaselineShift(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setBaselineOption(value: _BaselineOption, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setDigitSet(value: _DigitSet, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setDirection(value: _TextDirection): TextStyleProperty;
    setEveryLineComposer(value: boolean): TextStyleProperty;
    setFauxBold(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setFauxItalic(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setFillColor(value: _Color, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setFirstLineIndent(value: number): TextStyleProperty;
    setFont(value: string, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setFontSize(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setHangingRoman(value: boolean): TextStyleProperty;
    setHorizontalScaling(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setJustification(value: _Justification): TextStyleProperty;
    setKerning(value: number, characterIndex: number): TextStyleProperty;
    setKerningType(value: _KerningType, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setLeading(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setLeadingType(value: _LeadingType): TextStyleProperty;
    setLeftMargin(value: number): TextStyleProperty;
    setLigature(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setLineJoin(value: _LineJoin, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setRightMargin(value: number): TextStyleProperty;
    setSmallCaps(value: boolean, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setSpaceAfter(value: number): TextStyleProperty;
    setSpaceBefore(value: number): TextStyleProperty;
    setStrokeColor(value: _Color, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setStrokeWidth(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setText(value: string): TextStyleProperty;
    setTracking(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setTsume(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
    setVerticalScaling(value: number, startIndex?: number, numOfCharacters?: number): TextStyleProperty;
}

type _BaseLineDirection = "default" | "rotated" | "tate-chuu-yoko";
type _BaselineOption = "default" | "subscript" | "superscript";
type _DigitSet = "default" | "hindidigits";
type _TextDirection = "left-to-right" | "right-to-left";
type _Justification = "alignCenter" | "alignLeft" | "alignRight" | "justifyFull" | "justifyLastCenter" | "justifyLastLeft" | "justifyLastRight";
type _KerningType = "manual" | "metrics" | "optical";
type _LeadingType = "bottom-to-bottom" | "top-to-top";
type _LineJoin = "bevel" | "miter" | "round";

/*
 * Variable Fonts: https://ae-expressions.docsforadobe.dev/text/variable-fonts/
 */
interface _AnimatorPropertiesGroup {
    fontAxisWght?: Property<number>;
    fontAxisWdth?: Property<number>;
    fontAxisSlnt?: Property<number>;
    fontAxisItal?: Property<number>;
    fontAxisOpsz?: Property<number>;
}

/*
 * Misc
 */
declare class Custom {
}
