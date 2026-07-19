import { autocompletion } from "@codemirror/autocomplete";

let tagsCache = null;

async function fetchTags() {
  if (tagsCache) return tagsCache;
  const res = await fetch("/tags.json");
  tagsCache = await res.json();
  return tagsCache;
}

export function tagAutocompleteExtension(minChars = 1, debounceMs = 100) {
  function tagCompletionSource(context) {
    const word = context.matchBefore(/#[^\s#]*/);
    if (!word) return null;

    const query = word.text.slice(1);
    if (query.length < minChars) return null;

    const from = word.from;

    return new Promise((resolve) => {
      const timerId = setTimeout(async () => {
        if (context.aborted) {
          resolve(null);
          return;
        }
        const tags = await fetchTags();
        const lowerQuery = query.toLowerCase();
        const filtered = tags.filter((tag) =>
          tag.toLowerCase().startsWith(lowerQuery)
        );
        if (filtered.length === 0) {
          resolve(null);
          return;
        }
        resolve({
          from,
          options: filtered.map((tag) => ({
            label: `#${tag}`,
            displayLabel: tag,
            apply(view, _completion, from, to) {
              view.dispatch({
                changes: { from, to, insert: `#${tag} ` },
                selection: { anchor: from + tag.length + 2 },
              });
            },
          })),
          validFor: /#[^\s#]*$/,
          filter: false,
        });
      }, debounceMs);

      context.addEventListener("abort", () => {
        clearTimeout(timerId);
        resolve(null);
      });
    });
  }

  return autocompletion({
    override: [tagCompletionSource],
    activateOnTyping: true,
  });
}
