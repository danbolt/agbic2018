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

var ChatChris = [
	{
		"line": "I've really gotten into puppies lately."
	},
	{
		"choice": "Swipe left if you don't like puppies.",
		"options": [
			{
				"name": "I love puppies.",
				"result": "ChrisLike"
			},
			{
				"name": "Ugh, I am not entertaining this.",
				"result": "ChrisDislike"
			},
			{
				"name": "k",
				"result": "ChrisWhatever"
			}
		]
	}
];
var ChrisLike = [
	{
		"line": "I'm glad that superior people like you are around."
	}
];
var ChrisDislike = [
	{
		"line": "...what?"
	},
	{
		"line": "How could you be such a monster?"
	},
	{
		"line": "You're emotionally stunted."
	}
];
var ChrisWhatever = [
	{
		"line": "ok"
	}
];


var ChatJedah = [
	{
		"line": "I am not Chris."
	},
	{
		"line": "No questions here."
	}
];


var ChatZain = [
	{
		"line": "Wow, you found me!"
	},
	{
		"line": "I'm really hidden away, aren't I?"
	}
];


/* Access from the game side  */
var DialogueMap = {
	"SampleChoice" : SampleChoice,
	"SampleDialogue": SampleDialogue,
	"SampleBoy": SampleBoy,
	"SampleGirl": SampleGirl,
	"SampleNonBinary": SampleNonBinary,

	"ChatChris": ChatChris,
	"ChrisLike": ChrisLike,
	"ChrisDislike": ChrisDislike,
	"ChrisWhatever": ChrisWhatever,

	"ChatJedah": ChatJedah,
	"ChatZain": ChatZain
};
var dialogueFor = function (key) {
	return DialogueMap[key] ? DialogueMap[key] : ErrorDialogue;
}