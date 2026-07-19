<script>
  import { EditorView, keymap, placeholder } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { defaultKeymap } from '@codemirror/commands';

  let container;
  let view;
  let rawContent = $state('');

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
      doc: '',
      extensions: [
        singleLine,
        updateListener,
        placeholder('Search...'),
        keymap.of(defaultKeymap),
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
          '&.cm-focused': { outline: 'none' },
        }),
      ],
      parent: container,
    });

    return () => view.destroy();
  });
</script>

<h1>Search</h1>

<div class="search-row">
  <div class="editor-wrapper" bind:this={container}></div>
  <button>Apply</button>
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
</style>
