/* ------------------------------------------------------------------
   learning the rules

   Seven screens, each one a rule and a small exercise on it. You do not
   move on by reading — you move on by sending a number that proves you
   can use the rule, which is what `asserts` below pins down.

   The colouring is roles, not escape codes: head() names a rule, note()
   is notation and worked examples, body() is prose, and `backticks`
   pick out the digit the rule is about. terminal.js does the rest.
   ------------------------------------------------------------------ */

const { print, clear, ask, hide, keys, status,
        head, body, note, aside, good, warn } = Term;

const READY = "Tell the princess you are ready: ";
const TRY   = "Try a number: ";
const ONWARD = "press ENTER for the tests: ";

const INTRO = [
	body(""),
	aside("`the_princess_test`   —   a logic puzzle in six tests"),
	body(""),
	body("There is a princess who lives far away,\n" +
	     "She has a way with numbers, by the way.\n" +
	     "She has this game she plays, a number game:\n" +
	     "You send her a number, she'll do the same.\n" +
	     "Her number will be in response to yours,\n" +
	     "And yes, she'll teach you how it works, of course.\n" +
	     "She will reward the one that meets her test,\n" +
	     "Just learn six rules and figure out the rest."),
	body(""),
	body("The princess is waiting...\n" +
	     "First she will teach you the rules."),
	body(""),
	aside("press ENTER to begin   ·   Esc skips straight to the tests"),
	body("")
];

/* Each screen teaches one rule and then asks for a number that only
   somebody who understood it could send. */
const RULES = [
	[
		head("Rule 0: notation"),
		body(""),
		body("▸ A single letter can be used to represent\n" +
		     "    either a single-digit or a multi-digit number,\n" +
		     "    so x can be 2 or it can be 1234\n" +
		     "▸ No letter has any special meaning,\n" +
		     "    they are all just variables (a, b, x)\n" +
		     "▸ When you see variables next to each other\n" +
		     "    it means concatenation, not multiplication,\n" +
		     "    so if a = 543 and b = 987 then ab means 543987\n" +
		     "    and 3a means 3543\n" +
		     "▸ a → b means: when you send the princess a,\n" +
		     "    she will respond with b"),
		body(""),
		head("Rule I: getting a response"),
		note("            `1`a`2` → a"),
		body(""),
		note("Examples:   `1`654`2` → 654\n" +
		     "            `1`192`2` → 192"),
		body(""),
		body("Play with the rule. Does it make sense?\n" +
		     "What number would you send to get 1643 back?\n" +
		     "In the notation: find an x such that"),
		note("            x → 1643"),
		body("")
	],

	[
		head("Rule II: doubling"),
		note("            if a → b, then `3`a → bb"),
		body(""),
		note("Examples:   since   116432 → 1643\n" +
		     "            then   `3`116432 → 16431643\n" +
		     "            since     1432 → 43\n" +
		     "            then     `3`1432 → 4343\n" +
		     "            and     `33`1432 → 43434343"),
		body(""),
		body("Using rule II,\n" +
		     "what number would you send to get 123123 back?"),
		note("            x → 123123"),
		body("")
	],

	[
		head("Rule III: reversal"),
		note("            if a → b, then `4`a → b↩\n" +
		     "            (b with its digits reversed)"),
		body(""),
		note("Example:    since   19872 → 987\n" +
		     "            then   `4`19872 → 789"),
		body(""),
		body("Use rule III to make her send back 123"),
		body("")
	],

	[
		head("Rule IV: erasure"),
		note("            if a → b, then `5`a → ◌b\n" +
		     "            (b with its first digit removed)"),
		body(""),
		note("Example:    since   127432 → 2743\n" +
		     "            then   `5`127432 → 743"),
		body(""),
		body("Use rule IV to make her send back 375"),
		body("")
	],

	[
		head("Rule V: addition (1)"),
		note("            if a → b, then `6`a → 1b"),
		body(""),
		note("Example:    since   15552 → 555\n" +
		     "            then   `6`15552 → 1555"),
		body(""),
		body("Use rule V to make her send back 1919"),
		body("")
	],

	[
		head("Rule VI: addition (2)"),
		note("            if a → b, then `7`a → 2b"),
		body(""),
		note("Example:    since   13432 → 343\n" +
		     "            then   `7`13432 → 2343"),
		body(""),
		body("Use rule VI to make her send back 222"),
		body("")
	],

	[
		head("Rule ∞: the rules combine"),
		body(""),
		note("Example:    since     14342 → 434\n" +
		     "            and      `6`14342 → 1434       (addition (1))\n" +
		     "            then    `36`14342 → 14341434   (doubling)"),
		body(""),
		body("Use rule IV (erasure) and rule II (doubling)\n" +
		     "to get the princess to send you the number 47747"),
		body("")
	],

	[
		warn("And those are all the rules."),
		body(""),
		body("Do not forget them:"),
		body(""),
		note("Rule I                        `1`a`2` → a\n" +
		     "Rule II        if a → b, then `3`a → bb\n" +
		     "Rule III       if a → b, then `4`a → b↩\n" +
		     "Rule IV        if a → b, then `5`a → ◌b\n" +
		     "Rule V         if a → b, then `6`a → 1b\n" +
		     "Rule VI        if a → b, then `7`a → 2b"),
		body(""),
		body("Now you are ready for the tests ↴"),
		aside("send the princess a ? during the tests for a reminder"),
		body("")
	]
];

/* What each screen will accept: the number she has to say back, the
   digit the answer must start with so that the rule just taught is the
   one doing the work, and what to call that rule when somebody reaches
   the number by another road — which is easy to do, since rule I alone
   can produce most of these. */
const ASSERTS = [
	{ start: "1",  answer: "1643",   rule: "rule I" },
	{ start: "3",  answer: "123123", rule: "rule II" },
	{ start: "4",  answer: "123",    rule: "rule III" },
	{ start: "5",  answer: "375",    rule: "rule IV" },
	{ start: "6",  answer: "1919",   rule: "rule V" },
	{ start: "7",  answer: "222",    rule: "rule VI" },
	{ start: "53", answer: "47747",  rule: "rules IV and II" }
];

const LAST = RULES.length - 1;   /* the summary; nothing to answer */

/* ── the flow ────────────────────────────────────────────────────── */

let i = 0;

function show() {
	print(RULES[i]);
	if (i === LAST) {
		status(null, "the rules");
		ask(ONWARD, answer);
	} else {
		status(null, "rule " + (i + 1) + " of " + ASSERTS.length);
		ask(TRY, answer);
	}
}

function begin() {
	clear();
	show();
}

function answer(line) {
	if (i === LAST) return leave();     /* any Enter, as the screen says */
	if (line === "") return;

	const want = ASSERTS[i];
	const reply = princess(line);

	if (reply === "") print(aside("the princess says nothing"));
	else print(note("the princess would return: " + reply));

	if (reply !== want.answer) return;

	/* Getting the number is not the point — she is asking to see the rule
	   she has just taught, and refusing without saying so is a dead end:
	   the screen agrees you got the number and then does nothing. */
	if (!line.startsWith(want.start)) {
		print(warn("that is the number, but not by " + want.rule));
		return;
	}

	i++;
	print(good("\nCorrect\n"));
	show();
}

/* The rules are optional; anyone who has them can go straight to the
   tests. `replace` rather than a new entry, so Back from the tests
   leaves the way it came instead of restarting the introduction. */
function leave() {
	hide();
	location.replace("princess.html");
}

keys(e => {
	if (e.key === "Escape") { leave(); return true; }
	return false;
});

print(INTRO);
status("rules", "the introduction");
ask(READY, begin);
