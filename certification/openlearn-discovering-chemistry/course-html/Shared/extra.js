// This file contains extra JavaScript required only for the alt formats
// implementation, and not based on the standard oucontent.js.

if (window.addEventListener !== undefined) {
    window.addEventListener('load', function () {
        altFormatsInitAccessibleMatchings();
    });
}

function altFormatsInitAccessibleMatchings() {
    var interactions = document.getElementsByClassName('oucontent-interaction-print');
    for (var i = 0; i < interactions.length; i++) {
        var matches = interactions[i].getElementsByClassName('oucontent-matching-matches');
        if (matches && matches.length) {
            var answers = interactions[i].getElementsByClassName('oucontent-matching-answers')[0];
            altFormatsInitAccessibleMatching(matches, answers);
        }
    }
}

function altFormatsInitAccessibleMatching(matching, answers) {
    // shuffle the matches
    var matches = matching[0];
    for (var i = matches.children.length; i >= 0; i--) {
        matches.appendChild(matches.children[Math.floor(Math.random() * i)]);
    }

    // match them up to fill in the answers
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < matches.children.length; i++) {
        // the listmarker contains the number of the matching option
        var listmarker = matches.children[i].getElementsByClassName('oucontent-listmarker')[0];

        // the answers are listed in numerical order so use the listmarker to find the correct answer
        var answer = answers.children[listmarker.textContent - 1];

        // the matches are labelled in alphabetical order so append the correct letter to the answer
        answer.textContent = answer.textContent.concat(letters.charAt(i));
    }
}
