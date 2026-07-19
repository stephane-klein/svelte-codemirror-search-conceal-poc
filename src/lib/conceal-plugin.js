import { ViewPlugin, Decoration } from "@codemirror/view";
import { TagWidget } from "./tag-widget.js";

const TAG_PATTERN = /#[^\s#]+/g;

function expandRange(from, to, threshold, max) {
  return [
    Math.max(0, from - threshold),
    Math.min(max, to + threshold),
  ];
}

function tagDecorations(view, threshold) {
  const widgets = [];
  const doc = view.state.doc;
  const docStr = doc.toString();
  const docLength = docStr.length;
  const selections = view.state.selection.ranges;
  const hasFocus = view.hasFocus;

  TAG_PATTERN.lastIndex = 0;

  let match;
  while ((match = TAG_PATTERN.exec(docStr)) !== null) {
    const from = match.index;
    const to = from + match[0].length;
    const tagName = match[0].slice(1);

    const [eFrom, eTo] = expandRange(from, to, threshold, docLength);

    const nearCursor = hasFocus && selections.some(
      (sel) => eFrom <= sel.to && sel.from <= eTo
    );

    if (nearCursor) continue;

    const toPos = to;
    widgets.push(Decoration.replace({}).range(from, to));
    widgets.push(
      Decoration.widget({
        widget: new TagWidget({
          tag: tagName,
          onClick: () => {
            view.dispatch({
              selection: { anchor: toPos },
              scrollIntoView: true,
            });
            view.focus();
          },
        }),
      }).range(from)
    );
  }

  return Decoration.set(widgets, true);
}

export function concealPlugin(threshold = 1) {
  return ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = tagDecorations(view, threshold);
      }

      update(update) {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.viewportChanged ||
          update.focusChanged
        ) {
          this.decorations = tagDecorations(update.view, threshold);
        }
      }
    },
    { decorations: (v) => v.decorations }
  );
}
