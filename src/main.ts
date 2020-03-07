import ResizePlugin from "./ResizePlugin";
import IframeOnClick from "./IframeClick";
import { Locale } from "./i18n";

interface Quill {
  container: HTMLElement;
  root: HTMLElement; // edit area
  on: any;
}
interface QuillResizeModuleOptions {
  [index: string]: any;
  locale?: Locale;
}

function QuillResizeModule(quill: Quill, options?: QuillResizeModuleOptions) {
  const container: HTMLElement = quill.root as HTMLElement;
  let resizeTarge: HTMLElement | null;
  let resizePlugin: ResizePlugin | null;
  container.addEventListener("click", (e: Event) => {
    const target: HTMLElement = e.target as HTMLElement;
    if (e.target && ["img", "video"].includes(target.tagName.toLowerCase())) {
      resizeTarge = target;
      resizePlugin = new ResizePlugin(
        target,
        container.parentElement as HTMLElement,
        options
      );
    }
  });

  quill.on("text-change", (delta: any, source: string) => {
    // iframe 大小调整
    container.querySelectorAll("iframe").forEach((item: HTMLIFrameElement) => {
      IframeOnClick.track(item, () => {
        resizeTarge = item;
        resizePlugin = new ResizePlugin(
          item,
          container.parentElement as HTMLElement,
          options
        );
      });
    });
  });

  document.addEventListener(
    "mousedown",
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target !== resizeTarge &&
        !resizePlugin?.resizer?.contains?.(target)
      ) {
        resizePlugin?.destory?.();
        resizePlugin = null;
        resizeTarge = null;
      }
    },
    { capture: true }
  );
}

export default QuillResizeModule;
