/* ------------------------------------------------------------------
   the six tests

   Six things she can be made to do. Each test is a predicate over the
   number you send and the number she sends back — nothing is checked
   against a stored answer, so any number that satisfies the test
   passes it, and most of them have more than one.

   This is the hard half. Hours, not minutes.
   ------------------------------------------------------------------ */

const { print, ask, hide, status,
        head, body, note, aside, good } = Term;

const SEND = "Send her a number... ";

/* x → x, x → xx, and so on: the number you send, and what she has to
   make of it. */
const TESTS = [
	{
		title: "The first test: Echo",
		body:  "Get the princess to echo your number.",
		form:  "            x → x",
		pass:  x => princess(x) === x
	},
	{
		title: "The second test",
		body:  "Get her to say it twice.",
		form:  "            x → xx",
		pass:  x => princess(x) === x + x
	},
	{
		title: "The third test",
		body:  "Get her to say it backwards.",
		form:  "            x → x↩",
		pass:  x => princess(x) === reverse(x)
	},
	{
		title: "The fourth test",
		body:  "Get her to drop the final digit.",
		form:  "            x → x◌",
		pass:  x => princess(x) === x.substring(0, x.length - 1)
	},
	{
		title: "The fifth test",
		body:  "Get her answer to answer itself.",
		form:  "            x → y → x",
		pass:  x => princess(princess(x)) === x
	},
	{
		title: "The sixth test",
		body:  "And then to come back reversed.",
		form:  "            x → y → x↩",
		pass:  x => princess(princess(x)) === reverse(x)
	}
];

const REMINDER = note("Rule I                        `1`a`2` → a\n" +
                      "Rule II        if a → b, then `3`a → bb\n" +
                      "Rule III       if a → b, then `4`a → b↩\n" +
                      "Rule IV        if a → b, then `5`a → ◌b\n" +
                      "Rule V         if a → b, then `6`a → 1b\n" +
                      "Rule VI        if a → b, then `7`a → 2b");

const OPENING = [
	body(""),
	aside("`the_princess_test`   —   the six tests"),
	body(""),
	body("Six times she will ask for something. Send her a number that\n" +
	     "makes her answer the way the test asks. There is no penalty\n" +
	     "for a wrong guess."),
	body(""),
	aside("send a ?  for the rules   ·   ↑  brings back what you last sent"),
	body("")
];

const WON = [
	body(""),
	good("All six tests passed."),
	body("The princess has nothing more to ask of you."),
	body(""),
	aside("reload to play them again")
];

function reverse(s) { return s.split("").reverse().join(""); }

/* ── the flow ────────────────────────────────────────────────────── */

let i = 0;

function show() {
	const t = TESTS[i];
	print([head(t.title), body(t.body), body(""), note(t.form), body("")]);
	status(null, "test " + (i + 1) + " of " + TESTS.length);
}

function answer(line) {
	if (line === "") return;

	if (line === "?") {
		print([body(""), REMINDER, body("")]);
		return;
	}

	const reply = princess(line);
	if (reply === "") print(aside("the princess says nothing"));
	else print(note("the princess returns: " + reply));

	if (!TESTS[i].pass(line)) return;

	i++;
	print(good("\nYou passed test " + i + "\n"));

	if (i === TESTS.length) {
		print(WON);
		status(null, "all six passed");
		hide();
		return;
	}

	show();
}

print(OPENING);
show();
ask(SEND, answer);
