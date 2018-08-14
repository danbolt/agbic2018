var ErrorDialogue = [
	{
		"line": "(dialogue not found)"
	}
];

var SampleDialogue = [
	{
		"line": "Hello, world, I am here!"
	},
	{
		"line": "Isn't that great?"
	}
];

var SampleChoice = [
	{
		"line": "Here's a b/g/n pick"
	},
	{
		"choice": "Are you a boy or a girl?",
		"options": [
			{
				"name": "Boy",
				"sideEffect": "was_bold",
				"result": "SampleBoy"
			},
			{
				"name": "Girl",
				"sideEffect": "was_bold",
				"result": "SampleGirl"
			},
			{
				"name": "Um...",
				"sideEffect": "was_bold",
				"result": "SampleNonBinary"
			}
		]
	}
];
var SampleBoy = [
	{
		"line": "You're a boiiii"
	}
];
var SampleGirl = [
	{
		"line": "You're a grrrllll"
	}
];
var SampleNonBinary = [
	{
		"line": "You're a queeerrr"
	}
];



/* Access from the game side  */
var DialogueMap = {
	"SampleChoice" : SampleChoice,
	"SampleDialogue": SampleDialogue,
	"SampleBoy": SampleBoy,
	"SampleGirl": SampleGirl,
	"SampleNonBinary": SampleNonBinary,
};
var dialogueFor = function (key) {
	return DialogueMap[key] ? DialogueMap[key] : ErrorDialogue;
}