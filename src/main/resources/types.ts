type LibMap = import("enonic-types/libs").EnonicLibraryMap;

declare const __non_webpack_require__: <K extends keyof LibMap | string = string>(path: K) => K extends keyof LibMap
  ? LibMap[K]
  : any;

declare const resolve: (path: string) => any;


declare const app: {
  name: string,
  version: string
  config: { [key: string]: string }
}

declare const log: {
  info: (...args: any[]) => void,
  warning: (...args: any[]) => void,
  error: (...args: any[]) => void
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare const __: {
  newBean: (bean: string) => any,
  toNativeObject: <A = any>(beanResult: A) => A
}
