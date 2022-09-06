import "./ResizePlugin.less";
import { I18n, Locale, defaultLocale } from "./i18n";
import { format } from "./utils";

interface Size {
  width: number;
  height: number;
}
interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}
class ResizeElement extends HTMLElement {
  public originSize?: Size | null = null;
}

interface ResizePluginOption {
  locale?: Locale;
  ratioLock: boolean;
  [index: string]: any;
}
const template = `
<div class="handler" title="{0}"></div>
<div class="toolbar">
  <div class="btn-group">
    <a class="btn btn-white app-toolbar-control" data-width="100%">100%</a>
    <a class="btn btn-white app-toolbar-control" data-width="50%">50%</a>
    <a class="btn btn-white btn-icon app-toolbar-control" data-width="-5" class="btn btn-white btn-icon inner-btn">
         <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-minus" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
           <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    </a>
    <a class="btn btn-white btn-icon app-toolbar-control" data-width="5" class="btn btn-white btn-icon inner-btn">
         <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
           <line x1="12" y1="5" x2="12" y2="19"></line>
           <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    </a>
    <a class="btn btn-white btn-icon app-toolbar-control" data-float="left">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-align-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
         <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
         <line x1="4" y1="6" x2="20" y2="6"></line>
         <line x1="4" y1="12" x2="14" y2="12"></line>
         <line x1="4" y1="18" x2="18" y2="18"></line>
      </svg>
    </a>
    <a class="btn btn-white btn-icon app-toolbar-control" data-float="center">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-align-center" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
           <line x1="4" y1="6" x2="20" y2="6"></line>
           <line x1="8" y1="12" x2="16" y2="12"></line>
           <line x1="6" y1="18" x2="18" y2="18"></line>
        </svg>    
    </a>
    <a class="btn btn-white btn-icon app-toolbar-control" data-float="right">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-align-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
           <line x1="4" y1="6" x2="20" y2="6"></line>
           <line x1="10" y1="12" x2="20" y2="12"></line>
           <line x1="6" y1="18" x2="20" y2="18"></line>
        </svg>
    </a>
  </div>
</div>
`;
class ResizePlugin {
  resizeTarget: ResizeElement;
  resizer: HTMLElement | null = null;
  container: HTMLElement;
  startResizePosition: Position | null = null;
  i18n: I18n;
  options: any;

  constructor(
    resizeTarget: ResizeElement,
    container: HTMLElement,
    options?: ResizePluginOption
  ) {
    this.i18n = new I18n(options?.locale || defaultLocale);
    this.options = options;
    this.resizeTarget = resizeTarget;
    if (!resizeTarget.originSize) {
      resizeTarget.originSize = {
        width: resizeTarget.clientWidth,
        height: resizeTarget.clientHeight,
      };
    }

    this.container = container;
    this.initResizer();
    this.positionResizerToTarget(resizeTarget);

    this.resizing = this.resizing.bind(this);
    this.endResize = this.endResize.bind(this);
    this.startResize = this.startResize.bind(this);
    this.toolbarClick = this.toolbarClick.bind(this);
    this.bindEvents();
  }

  initResizer() {
    let resizer: HTMLElement | null =
      this.container.querySelector("#editor-resizer");
    if (!resizer) {
      resizer = document.createElement("div");
      resizer.setAttribute("id", "editor-resizer");
      resizer.innerHTML = format(
        template,
        this.i18n.findLabel("altTip"),
        this.i18n.findLabel("floatLeft"),
        this.i18n.findLabel("center"),
        this.i18n.findLabel("floatRight"),
        this.i18n.findLabel("restore")
      );
      this.container.appendChild(resizer);
    }
    this.resizer = resizer;
  }
  positionResizerToTarget(el: HTMLElement) {
    if (this.resizer !== null) {
      this.resizer.style.setProperty("left", el.offsetLeft + "px");
      this.resizer.style.setProperty("top", el.offsetTop + "px");
      this.resizer.style.setProperty("width", el.clientWidth + "px");
      this.resizer.style.setProperty("height", el.clientHeight + "px");
    }
  }
  bindEvents() {
    if (this.resizer !== null) {
      this.resizer.addEventListener("mousedown", this.startResize);
      this.resizer.addEventListener("click", this.toolbarClick);
    }
    window.addEventListener("mouseup", this.endResize);
    window.addEventListener("mousemove", this.resizing);
  }
  toolbarClick(e: MouseEvent) {
    const target: HTMLElement = e.target as HTMLElement;
    const control: HTMLElement = target.closest('.app-toolbar-control') as HTMLElement;
    if (control) {
      let width: any = control.dataset.width as string;
      const float: string = control.dataset.float as string;
      const style: CSSStyleDeclaration = this.resizeTarget.style;
      if (width) {
        if (this.resizeTarget.tagName.toLowerCase() !== "iframe") {
          style.removeProperty("height");
        }
        if (width === "auto") {
          style.removeProperty("width");
        } else if (width.includes("%")) {
          style.setProperty("width", width);
        } else {
          let styleWidth = style.getPropertyValue("width");
          width = parseInt(width);

          if (styleWidth.includes("%")) {
            styleWidth = Math.min(Math.max(parseInt(styleWidth) + width, 5), 100) + "%";
          } else {
            styleWidth = Math.max(this.resizeTarget.clientWidth + width, 10) + "px";
          }

          style.setProperty("width", styleWidth);
        }
      } else {
        if (float === "center") {
          style.setProperty("display", "block");
          style.setProperty("margin", "auto");
          style.removeProperty("float");
        } else {
          style.removeProperty("display");
          style.removeProperty("margin");
          style.setProperty("float", float);
        }
      }
      this.positionResizerToTarget(this.resizeTarget);

      this.options?.onChange(this.resizeTarget);
    }
  }
  startResize(e: MouseEvent) {
    const target: HTMLElement = e.target as HTMLElement;
    if (target.classList.contains("handler") && e.which === 1) {
      this.startResizePosition = {
        left: e.clientX,
        top: e.clientY,
        width: this.resizeTarget.clientWidth,
        height: this.resizeTarget.clientHeight,
      };
    }
  }
  endResize() {
    this.startResizePosition = null;
    this.options?.onChange(this.resizeTarget);
  }
  resizing(e: MouseEvent) {
    if (!this.startResizePosition) return;
    const deltaX: number = e.clientX - this.startResizePosition.left;
    const deltaY: number = e.clientY - this.startResizePosition.top;
    let width = this.startResizePosition.width;
    let height = this.startResizePosition.height;
    width += deltaX;
    height += deltaY;

    if (e.altKey || this.options.ratioLock) {
      const originSize = this.resizeTarget.originSize as Size;
      const rate: number = originSize.height / originSize.width;
      height = rate * width;
    }

    this.resizeTarget.style.setProperty("width", Math.max(width, 30) + "px");
    this.resizeTarget.style.setProperty("height", Math.max(height, 30) + "px");
    this.positionResizerToTarget(this.resizeTarget);
  }

  destory() {
    this.container.removeChild(this.resizer as HTMLElement);
    window.removeEventListener("mouseup", this.endResize);
    window.removeEventListener("mousemove", this.resizing);
    this.resizer = null;
  }
}

export default ResizePlugin;
