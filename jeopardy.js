// categories is the main data structure for the app; it looks like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const BASE_URL = "http://jservice.io/api";

$(document).ready(function () {
    const startButton = document.getElementById("start");
    if (window.location.hash === '#reload') {
        startGame();
        window.location.hash = '';
    }

    startButton.style.visibility = "visible"
});

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get(`${BASE_URL}/random/?count=100`);
    const uniqueNumbers = [];
    const categoryIds = [];
    let number;

    while(uniqueNumbers.length < 6) {
        number = Math.floor(Math.random() * 100) + 1;
        if(uniqueNumbers.indexOf(number) === -1) {
            uniqueNumbers.push(number)
        }
    }

    for (let i = 0; i < uniqueNumbers.length; i++) {
        categoryIds.push(response.data[uniqueNumbers[i]].category_id)
    }

    return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(categoryID) {
    const response = await axios.get(`${BASE_URL}/category?id=${categoryID}`);
    const clues = [];
    const uniqueNumbers = [];
    let categoryObj;
    let number;

    function getFiveClues() {
        while(uniqueNumbers.length < 5) {
            number = Math.floor(Math.random() * response.data.clues.length);

            if(uniqueNumbers.indexOf(number) === -1) {
                uniqueNumbers.push(number)
            }
        }

        for (let i = 0; i < uniqueNumbers.length; i++) {
            clues.push(response.data.clues[uniqueNumbers[i]])
        }

        return clues;
    }

    categoryObj = {
        title: response.data.title,
        clues: getFiveClues()
    };

    return categoryObj;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM-QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */




async function fillTable(data) {
    for (let i = 0; i < 6; i++) {
        $(`.categories-head-${i}`).append(data[i].title);

        for (let j = 0; j < 5; j++) {
            $(`.row-${j}-categories-col-${i}-answer`)
                .append(data[i].clues[j].answer)
                .toggle();

            $(`.row-${j}-categories-col-${i}-question`)
                .append(data[i].clues[j].question)
                .toggle()
        }
    }

    $(".cell").click(function() {
        handleClick(this)
    })
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if curerntly "answer", ignore click
 * */

function handleClick(instance) {
    const regex = new RegExp(/answer/g);

    if (!regex.test(JSON.stringify(instance.className))) {
        $(instance).toggle();
        $(instance).prev().toggle();
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

async function showLoadingView() {
    const loader = document.getElementById("loader");
    const container = document.getElementById("container");
    const loadingButton = document.getElementById("loading");
    const restart = document.getElementById("restart");

    toggleElement(loadingButton);
    toggleElement(loader);

    function sleep(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function wait(ms) {
        await sleep(ms);
        toggleElement(loadingButton);
        toggleElement(restart);
        toggleElement(container);
    }

    setupAndStart();

    await wait(2000);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    const loader = document.getElementById("loader");
    toggleElement(loader)
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const data = [];
    let categoryIds = await getCategoryIds();

    for (let i = 0; i < categoryIds.length; i++) {
       data.push(await getCategory(categoryIds[i]));
    }

    fillTable(data);
}

/** On click of start / restart button, set up game. */
async function startGame() {
    const startButton = document.getElementById("start");
    toggleElement(startButton);
    await showLoadingView();
    hideLoadingView();
}

async function restartGame() {
    window.location.hash = 'reload';
    location.reload();
}

/** On page load, add event handler for clicking clues */
function toggleElement(element){
    return element.style.visibility === 'visible'
           ? element.style.visibility = "hidden"
           : element.style.visibility = "visible";
}
