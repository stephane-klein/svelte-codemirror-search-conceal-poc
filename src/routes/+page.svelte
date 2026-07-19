<script>
  import { EditorView, keymap, placeholder } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { defaultKeymap } from '@codemirror/commands';
  import { concealPlugin } from '$lib/conceal-plugin.js';
  import { tagAutocompleteExtension } from '$lib/autocomplete-plugin.js';

  let container;
  let view = $state(null);
  let rawContent = $state('');
  let threshold = $state(1);
  let autocompleteMinChars = $state(1);
  let autocompleteDebounceMs = $state(100);

  const concealCompartment = new Compartment();
  const autocompleteCompartment = new Compartment();

  const singleLine = EditorState.transactionFilter.of((tr) => {
    if (tr.newDoc.lines > 1) return [];
    return tr;
  });

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      rawContent = update.state.doc.toString();
    }
  });

  $effect(() => {
    if (!container) return;

    view = new EditorView({
      doc: '#linux #git #postgresql',
      extensions: [
        singleLine,
        updateListener,
        placeholder('Search...'),
        keymap.of(defaultKeymap),
        concealCompartment.of(concealPlugin(1)),
        autocompleteCompartment.of(tagAutocompleteExtension(1, 100)),
        EditorView.theme({
          '&': { height: '100%', maxWidth: '100%', overflow: 'hidden' },
          '.cm-scroller': { overflow: 'hidden' },
          '.cm-content': {
            padding: '0 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            caretColor: '#000',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            overflowX: 'hidden',
          },
          '.cm-line': { overflow: 'hidden' },
          '.cm-cursor': { borderLeftColor: '#000' },
          '.cm-gutters': { display: 'none' },
          '.cm-tag-pill': {
            padding: '0.15em 0.5em',
            borderRadius: '0.4em',
            fontSize: '0.9em',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontFamily: 'inherit',
            margin: '0 0.1em',
          },
          '.cm-tooltip': {
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            color: '#1a1a1a',
            fontSize: '14px',
            maxHeight: '280px',
          },
          '.cm-tooltip.cm-tooltip-autocomplete ul': {
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
          '.cm-tooltip.cm-tooltip-autocomplete ul li': {
            padding: '3px 8px',
            lineHeight: '1.5',
          },
          '.cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]': {
            backgroundColor: '#0066cc',
            color: '#fff',
          },
          '.cm-completionMatchedText': {
            fontWeight: '700',
          },
          '&.cm-focused': { outline: 'none' },
        }),
      ],
      parent: container,
    });

    return () => view.destroy();
  });

  $effect(() => {
    if (!view) return;
    const t = threshold;
    view.dispatch({
      effects: concealCompartment.reconfigure(concealPlugin(t)),
    });
  });

  $effect(() => {
    if (!view) return;
    const m = autocompleteMinChars;
    const d = autocompleteDebounceMs;
    view.dispatch({
      effects: autocompleteCompartment.reconfigure(
        tagAutocompleteExtension(m, d)
      ),
    });
  });
</script>

<h1>Search</h1>

<div class="search-row">
  <div class="editor-wrapper" bind:this={container}></div>
  <button>Apply</button>
</div>

<div class="config-row">
  <label for="threshold">Conceal threshold (chars):</label>
  <input type="number" id="threshold" bind:value={threshold} min="0" max="20" />
  <span class="config-value">={threshold}</span>
</div>

<div class="config-row">
  <label for="autocomplete-min-chars">Autocomplete min chars:</label>
  <input type="number" id="autocomplete-min-chars" bind:value={autocompleteMinChars} min="0" max="10" />
  <span class="config-value">={autocompleteMinChars}</span>
</div>

<div class="config-row">
  <label for="autocomplete-debounce">Autocomplete debounce (ms):</label>
  <input type="number" id="autocomplete-debounce" bind:value={autocompleteDebounceMs} min="0" max="2000" step="50" />
  <span class="config-value">={autocompleteDebounceMs}ms</span>
</div>

<p>Search input raw value: {rawContent}</p>

<style>
  .search-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
  }

  .editor-wrapper {
    flex: 1;
    min-width: 0;
    border: 1px solid #aaa;
    border-radius: 4px;
  }

  .editor-wrapper:focus-within {
    border-color: #66f;
  }

  .config-row {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-row input[type="number"] {
    width: 60px;
  }

  .config-value {
    font-family: monospace;
    color: #666;
  }
</style>
