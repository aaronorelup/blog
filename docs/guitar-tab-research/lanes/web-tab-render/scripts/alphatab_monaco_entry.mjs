// Gap round 2 (web-tab-render): esbuild entry for pages/alphatab_monaco.html. It only re-exports what the page needs
// from monaco-editor 0.57.0 and @coderline/alphatab-monaco 1.9.0 as window globals, because the package ships ES
// modules that import CommonJS dependencies by bare name (vscode-languageserver-protocol/browser and others), which a
// browser cannot load without a bundler. Built by build_alphatab_monaco.sh.
import * as monaco from 'monaco-editor';
import { addTextMateGrammarSupport, registerAlphaTexGrammar } from '@coderline/alphatab-monaco';
import { basicEditorLspIntegration } from '@coderline/alphatab-monaco/lsp';

window.monaco = monaco;
window.atMonaco = { addTextMateGrammarSupport, registerAlphaTexGrammar, basicEditorLspIntegration };
