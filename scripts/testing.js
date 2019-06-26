let questions = [];

let question = {
    qText:"This is the question",
    options:[starparameters1,starparameters2,starparameters3,starparameters4],
    rightOption: 2,
}

let optionOne = document.getElementById('optionOne');
let optionTwo = document.getElementById('optionTwo');
let optionThree = document.getElementById('optionThree');
let optionFour = document.getElementById('optionFour');

let optionDivs = [optionOne,optionTwo,optionThree,optionFour];

for(let i=0;i<optionDivs.length;i++){
    optionDivs[i].onclick = function(){
        answerCheck(optionDiv);
    }
}
