/* ------------------------------------------------------------------
   the princess

   The whole puzzle is this one function. Send her a number and she
   answers with another; the six rules below are everything she does,
   and the game is working out how to combine them so that her answer
   is the one a test asks for.

     1a2  → a                            a number between 1 and 2
     3a   → bb        if a → b           doubling
     4a   → b↩        if a → b           reversal
     5a   → ◌b        if a → b           the first digit erased
     6a   → 1b        if a → b           a 1 in front
     7a   → 2b        if a → b           a 2 in front

   Anything she cannot read, she does not answer: the empty string.

   Both pages load this file, so there is one copy of the rules and
   the two of them can never drift apart.
   ------------------------------------------------------------------ */

function princess(input) {
	const head = input.charAt(0);
	const tail = input.charAt(input.length - 1);
	const rest = input.substring(1);

	if (head == "1" && tail == "2")
		return input.substring(1, input.length - 1);
	else if (head == "3")
		return princess(rest) + princess(rest);
	else if (head == "4")
		return princess(rest).split("").reverse().join("");
	else if (head == "5")
		return princess(rest).substring(1);
	else if (head == "6")
		return "1" + princess(rest);
	else if (head == "7")
		return "2" + princess(rest);
	else
		return "";
}
