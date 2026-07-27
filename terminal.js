/* ------------------------------------------------------------------
   the_princess_test — the terminal

   The machine the landing page runs on, with the shell taken out: a
   scrollback made of DOM rows, and one real <input> laid invisibly over
   styled text. That input is the whole trick. It brings the mobile
   keyboard, the IME, backspace, paste, select, undo and the arrow keys
   with it, none of which have to be written here — where an emulator
   hands you a grid of cells and leaves all of that as your problem.

   What is left to do is colour, and it is done in two ways:

     a role      colours a whole block   note("(1a2 → a)")
     `backticks` colour a run inside one note("(`1`a`2` → a)")

   There are no escape codes, and no fixed number of rows and columns,
   so nothing here ever has to be told how big the window is.

   Content files (rules.js, princess.js) drive it:

     Term.print(blocks)        write to the scrollback
     Term.ask(label, handler)  show the prompt; handler(line) per Enter
     Term.keys(handler)        raw keys, for Esc
     Term.status(chip, note)   the modeline
   ------------------------------------------------------------------ */

const Term = (function () {
'use strict';

/* The landing page's key: pick a look over there and it carries. */
const THEME_KEY = 'bv-theme';

const screen  = document.querySelector('.screen');
const tbody   = document.getElementById('tbody');
const log     = document.getElementById('log');
const promptline = document.getElementById('promptline');
const label   = document.getElementById('p-label');
const shown   = document.getElementById('p-input');
const cli     = document.getElementById('cli');
const sChip   = document.getElementById('s-chip');
const sNote   = document.getElementById('s-note');

let onLine = null;      /* what to do with a finished line */
let onKey  = null;      /* first look at every key */

const hist = [];
let histIdx = -1;

/* ── rows ────────────────────────────────────────────────────────── */

/* One line of the scrollback. Text is split on backticks, and every
   other piece — the odd ones — is the accent colour. Nothing else is
   interpreted, so a rule can contain →, ◌ or ↩ without ceremony. */
function rowEl(role, text) {
	const div = document.createElement('div');

	if (text === '') {
		div.className = 'row blank';
		return div;
	}

	div.className = 'row';
	text.split('`').forEach((part, i) => {
		if (part === '') return;
		const span = document.createElement('span');
		span.className = 'seg-' + (i % 2 ? 'accent' : role);
		span.textContent = part;
		div.appendChild(span);
	});
	return div;
}

function scrollDown() {
	tbody.scrollTop = tbody.scrollHeight;
}

/* A block is { role, text }; its text may be as many lines as it likes.
   A bare string is a block in the body role, and an array is a screen. */
function print(blocks) {
	const frag = document.createDocumentFragment();
	for (const b of [].concat(blocks)) {
		const block = typeof b === 'string' ? { role: 'body', text: b } : b;
		for (const ln of String(block.text).split('\n')) {
			frag.appendChild(rowEl(block.role || 'body', ln));
		}
	}
	log.appendChild(frag);
	scrollDown();
}

function clear() {
	log.textContent = '';
	scrollDown();
}

/* ── the prompt ──────────────────────────────────────────────────── */

function setInput(v) {
	cli.value = v;
	shown.textContent = v;
}

/* What was typed, left behind in the scrollback where a terminal leaves
   it: the prompt it answered, and then the answer. */
function echo(v) {
	const div = document.createElement('div');
	div.className = 'row';

	const l = document.createElement('span');
	l.className = 'seg-good';
	l.textContent = label.textContent;

	const t = document.createElement('span');
	t.className = 'seg-typed';
	t.textContent = v;

	div.appendChild(l);
	div.appendChild(t);
	log.appendChild(div);
}

/* Install the prompt. The handler stays put across turns, so a content
   file calls this once per phase rather than once per line. */
function ask(text, handler) {
	label.textContent = text;
	onLine = handler;
	promptline.hidden = false;
	setInput('');
	scrollDown();
	focus();
}

/* Nothing more to type — after the last test, or on the way out. */
function hide() {
	promptline.hidden = true;
	onLine = null;
}

cli.addEventListener('input', () => { setInput(cli.value); histIdx = -1; });

cli.addEventListener('keydown', e => {
	if (onKey && onKey(e)) { e.preventDefault(); return; }

	if (e.key === 'Enter') {
		e.preventDefault();
		const v = cli.value.trim();
		if (v !== '') { hist.push(v); echo(v); }
		histIdx = -1;
		setInput('');
		if (onLine) onLine(v);
		scrollDown();

	/* Answers here are long strings of digits built out of the last one.
	   Getting the previous attempt back to edit it is most of the game. */
	} else if (e.key === 'ArrowUp') {
		e.preventDefault();
		if (!hist.length) return;
		histIdx = histIdx === -1 ? hist.length - 1 : Math.max(0, histIdx - 1);
		setInput(hist[histIdx]);
	} else if (e.key === 'ArrowDown') {
		e.preventDefault();
		if (histIdx === -1) return;
		histIdx++;
		if (histIdx >= hist.length) { histIdx = -1; setInput(''); }
		else setInput(hist[histIdx]);
	}
});

function keys(handler) { onKey = handler; }

/* ── chrome ──────────────────────────────────────────────────────── */

/* Either half may be left out — pass null to keep what is there. */
function status(chip, note) {
	if (chip != null && sChip) sChip.textContent = chip;
	if (note != null && sNote) sNote.textContent = note;
}

function setTheme(name) {
	document.documentElement.setAttribute('data-theme', name);
	try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
	document.querySelectorAll('[data-set-theme]').forEach(b => {
		b.classList.toggle('active', b.dataset.setTheme === name);
	});
}

document.querySelectorAll('[data-set-theme]').forEach(b => {
	b.addEventListener('click', () => setTheme(b.dataset.setTheme));
});

/* A phone should not be ambushed by the keyboard on load; there, the
   first tap asks for it. Everywhere else the prompt is ready to type
   into, because typing is the only thing there is to do here. */
const COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

function focus() {
	if (!COARSE && !promptline.hidden) cli.focus();
}

/* Clicking the screen puts you back on the prompt — unless you were
   selecting something, in which case taking focus would drop it. */
screen.addEventListener('mouseup', () => {
	if (promptline.hidden) return;
	if (String(window.getSelection() || '') !== '') return;
	cli.focus();
});

screen.addEventListener('touchend', e => {
	if (promptline.hidden) return;
	if (e.target.closest('button, a')) return;
	cli.focus();
});

setTheme(document.documentElement.getAttribute('data-theme') || 'dark');

/* ── blocks ──────────────────────────────────────────────────────── */

const block = role => text => ({ role: role, text: text });

return {
	print:  print,
	clear:  clear,
	ask:    ask,
	hide:   hide,
	keys:   keys,
	status: status,

	head:  block('head'),    /* the name of a rule                */
	body:  block('body'),    /* what it says                      */
	note:  block('note'),    /* notation, and worked examples     */
	aside: block('dim'),     /* instructions about the program    */
	good:  block('good'),    /* she accepted it                   */
	warn:  block('warn')     /* look at this one                  */
};

})();
