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
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

//helper function
//this function changes toggles visibility property
function toggleElement(element) {
    if (element.style.visibility === 'visible'){
        element.style.visibility = "hidden"
    } else {
        element.style.visibility = "visible" 
    }
}


async function getCategoryIds() {
    const response = await axios.get(`${BASE_URL}/random/?count=100`);//count value 
    //is arbitrary. Did not use Lodash
    let uniqueNumbers = [];//set array to account for 6 random unique numbers
    let categoryIds = [];

    //this loop is to generate unique numbers
    while (uniqueNumbers.length < 6) {
        let number = Math.floor(Math.random() * 100) + 1;
        //check if numbers are random unique
        if (uniqueNumbers.indexOf(number) === -1) {
            uniqueNumbers.push(number)
        }
    }
    //this for loop to randomize 100 ids we got from api against random numbers
    for (let i = 0; i < uniqueNumbers.length; i++) {
        categoryIds.push(response.data[uniqueNumbers[i]].category_id)//
    }
    return categoryIds;//returning 6 random category ids
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
//this function single category id
async function getCategory(categoryID) {
    let response = await axios.get(`${BASE_URL}/category?id=${categoryID}`);//api request using string interpolation
    let clues = [];//array to store five clues from clue-array { title: "Math", clues: clue-array }
    let uniqueNumbers = [];//random unique indexes for clue values array
    let categoryObj;//this is what is going to be returned
    let number;//random num

    function getFiveClues() {
        while (uniqueNumbers.length < 5) {//loop to generate 5 random clues indexes
            number = Math.floor(Math.random() * response.data.clues.length);
            if (uniqueNumbers.indexOf(number) === -1) {//same logic as in previous function
                uniqueNumbers.push(number)
            }
        }

        for (let i = 0; i < uniqueNumbers.length; i++) {
            clues.push(response.data.clues[uniqueNumbers[i]])//same logic as in previous function
        }
        return clues;
    }
    //obj to be returned
    categoryObj = {
        title: response.data.title,
        clues: getFiveClues()//calling function within the object
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
    //six column top th
    for (let i = 0; i < 6; i ++) {
        $(`.categories-head-${i}`).append(data[i].title);//populate with data 
        //from second api call => th category bar
        //5 rows with clues
        for (let j = 0; j < 5; j ++) {
            $(`.row-${j}-categories-col-${i}-answer`)//selecting HTML element
                .append(data[i].clues[j].answer)//appending the answer to DOM
                .toggle();//hiding it
            //5 rows with clues
            $(`.row-${j}-categories-col-${i}-question`)//select
                .append(data[i].clues[j].question)//append
                .toggle()//toggle to hide or unhide
        }
    }
    $(".cell").click(function () {//this function binds click event to .cell 
        //class 
        handleClick(this)//takes the event target and passes to handleClick function
    });
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if curerntly "answer", ignore click
 * */

function handleClick(instance) {//parameter instance instead of reserved word this
    let regex = new RegExp(/answer/g);//g global flag on this regular expression
    //string matching
    //returns boolean
    if (!regex.test(JSON.stringify(instance.className))) {//strigify this 
        //classname of target which is answer and search for it using test method
        $(instance).toggle();//hiding targeted element if not answer
        $(instance).prev().toggle();//goes up the DOM tree and reveals it
        //so from class initial to class question to class answer
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
//this function show loading animation and shows jeopardy starting view 
//and hides loading animation once finished 
async function showLoadingView() {
    let loader = document.getElementById("loader");//loader animation  is in css file 
    //selects class loader on a div
    let container = document.getElementById("container");//selects the table with class container
    let loadingButton = document.getElementById("loading");//selects loading button in DOM
    let restart = document.getElementById("restart");//selects restart button in DOM

    toggleElement(loadingButton);//shows loading button instead of start button
    toggleElement(loader);//shows loading animation
        //how to show loading animation for 2 secs => stackoverflow copied 
        //stackoverflow.com/questions/19389200/javascript-sleep-delay-wait-function
        //waits 2 sec 
        async function wait() {
            await new Promise(resolve => setTimeout(resolve, 2000));//resolving 
            toggleElement(loadingButton);//then toggles and hides loading button
            toggleElement(restart);//show the restart button
            toggleElement(container);//shows the table div   
        }
    setupAndStart();//launches populating function
    await wait();//executes after 2000 milliseconds or 2 sec
}

/** Remove the loading spinner and update the button used to fetch data. */
//this function hides loading animation
function hideLoadingView() {
    let loader = document.getElementById("loader");//selects loader animation div
    toggleElement(loader)//hides loader animation
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

//actually starts the game 
async function setupAndStart() {
    let data = [];
    let categoryIds = await getCategoryIds();//calling function to pass 6 
    //random unique numbers from first api call
    for (let i = 0; i < categoryIds.length; i ++) {
        data.push(await getCategory(categoryIds[i]));//calling function to
        //pass obj with { title: "Math", clues: clue-array } from second api
    }
    fillTable(data);//passing data using FillTable function for the initial 
    //population of the table => 6 category titles th cells and 30 
    //question answer td cells 
}

/** On click of start / restart button, set up game. */
//this is start button to begin game
async function startGame() {
    let startButton = document.getElementById("start");//extracts and targets 
    //start button in the DOM
    toggleElement(startButton);//hides start button after its presses using toggleElement function
    await showLoadingView();//shows loading animation => w3 schools.com loader css
    hideLoadingView();//hides loading animation
}

/** On page load, add event handler for clicking clues */

