let body = document.querySelector("body");
body.spellcheck = false; //  wrong word ke niche jo red-line ata hai uska htane ke liye

let menuBarPtags = document.querySelectorAll(".menu-bar p");
let columnTags = document.querySelector(".column-tags")
let rownNumbers = document.querySelector(".row-numbers")
let grid = document.querySelector(".grid");
let selectedCell = document.querySelector("#selected-cell");
let formulaInput = document.querySelector("#complete-formula");

let oldCell;

let fileOptions = menuBarPtags[0];


fileOptions.addEventListener("click", (e) => {

    if (e.currentTarget.classList.length == 0) {
        e.currentTarget.innerHTML = `File
        <span>
           <span>Clear</span>
           <span>Open</span>
           <span>Save</span>
        </span>`

        // let allFileOptions = document.querySelectorAll(".menu-bar-option-selected>span>span");

        let allFileOptions = e.currentTarget.querySelectorAll("span>span")

        //clear
        allFileOptions[0].addEventListener("click", function () {
            let allCells = document.querySelectorAll(".cell");
            for (let i = 0; i < allCells.length; i++) {
                allCells[i].innerText = "";
                let cellAdd = allCells[i].getAttribute("data-address");
                dataObj[cellAdd] = {
                    value: "",
                    formula: "",
                    upstream: [],
                    downstream: [],
                    fontSize: 10,
                    fontFamily: "Arial",
                    fontWeight: "normal",
                    color: "black",
                    backgroundColor: "white",
                    underline: "none",
                    italics: "normal",
                    textAlign: "left",
                };
            }
        });

        //open
        allFileOptions[1].addEventListener("click", () => {
            // 1->fetch dataObj from localStorage
            // 2->replace current dataObj with fetched obj;
            dataObj = JSON.parse(localStorage.getItem("sheet"));

            // 3->populate UI withc data

            for (let j = 1; j <= 100; j++) {
                for (let i = 0; i < 26; i++) {
                    let address = String.fromCharCode(i + 65) + j;
                    let cellObj = dataObj[address];
                    let cellOnUi = document.querySelector(`[data-address=${address}]`);
                    cellOnUi.innerText = cellObj.value;
                    cellOnUi.style.backgroundColor = cellObj.backgroundColor;
                    //same kam Css ke styling
                }
            }

        });


        //save
        allFileOptions[2].addEventListener("click", () => {
            localStorage.setItem("sheet", JSON.stringify(dataObj))

        });

    } else {
        e.currentTarget.innerHTML = `File`
    }
})



let dataObj = {}

for (let i = 0; i < menuBarPtags.length; i++) {
    menuBarPtags[i].addEventListener("click", (e) => {
        if (e.currentTarget.classList.contains("menu-bar-option-selected")) {
            e.currentTarget.classList.remove("menu-bar-option-selected")
        } else {

            for (let j = 0; j < menuBarPtags.length; j++) {
                if (menuBarPtags[j].classList.contains("menu-bar-option-selected"))
                    menuBarPtags[j].classList.remove("menu-bar-option-selected")
            }
            e.currentTarget.classList.add("menu-bar-option-selected")
        }
    })
}

for (let i = 0; i < 26; i++) {
    let div = document.createElement("div");
    div.classList.add("column-tags-cell");
    div.innerText = String.fromCharCode(65 + i);
    columnTags.append(div);
}

for (let i = 1; i <= 100; i++) {
    let div = document.createElement("div");
    div.classList.add("row-numbers-cell");
    div.innerText = i;
    rownNumbers.append(div);
}


for (let j = 1; j <= 100; j++) {
    let row = document.createElement("div");
    row.classList.add("row");

    for (let i = 0; i < 26; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        let address = String.fromCharCode(i + 65) + j;
        cell.setAttribute("data-address", address);

        dataObj[address] = {
            value: "",
            formula: "",
            upstream: [],
            downstream: [],
            fontSize: 12,
            fontFamily: "Arial",
            fontWeight: "normal",
            color: "white",
            backgroundColor: "white",
            underline: "none",
            italics: "normal",
            textAlign: "left",
        }


        cell.addEventListener("click", (e) => {

            //check if any old cell is selected form be4
            if (oldCell) {
                // if yes remove grid-selected-cell from its classList
                oldCell.classList.remove("grid-selected-cell")
            }
            e.currentTarget.classList.add("grid-selected-cell");

            let cellAddress = e.currentTarget.getAttribute("data-address");
            selectedCell.value = cellAddress;

            // naye selected cell ko oldCell me daal do
            oldCell = e.currentTarget;
        })

        cell.addEventListener("input", (e) => {
            let address = e.currentTarget.getAttribute("data-address");
            dataObj[address].value = Number(e.currentTarget.innerText);

            dataObj[address].formula = "";

            //upstream clear krni hai

            let currCellUpstream = dataObj[address].upstream;

            for (let i = 0; i < currCellUpstream.length; i++) {
                removeFromUpstream(address, currCellUpstream[i]);
            }

            dataObj[address].upstream = [];

            //downstream ke cell ko update krna hai

            let currCellDownStream = dataObj[address].downstream;

            for (let i = 0; i < currCellDownStream.length; i++) {
                updateDownstreamElements(currCellDownStream[i]);
            }

        })

        cell.contentEditable = true;
        row.append(cell);

    }
    grid.append(row);
}



formulaInput.addEventListener("change", (e) => {
    let fInput = e.currentTarget.value;

    let selectedCellAddresss = oldCell.getAttribute("data-address");


    dataObj[selectedCellAddresss].formula = fInput;

    let formulaArr = fInput.split(" ");



    let eleArr = [];

    for (let i = 0; i < formulaArr.length; i++) {

        if (formulaArr[i] != "+" && formulaArr[i] != "-" && formulaArr[i] != "*" && formulaArr[i] != "/" && isNaN(Number(formulaArr[i]))) {
            eleArr.push(formulaArr[i]);
        }

    }

    if (cycleDetection(selectedCellAddresss, eleArr)) {
        alert("Cycle Detected");
        formulaInput.value = "";
        refError(selectedCellAddresss, eleArr)
        return;
    }

    //before setting new upstream empty old upstream
    let oldUpstream = dataObj[selectedCellAddresss].upstream
    for (let k = 0; k < oldUpstream.length; k++) {
        removeFromUpstream(selectedCellAddresss, oldUpstream[k]);
    }


    //new upstream ko save krna
    dataObj[selectedCellAddresss].upstream = eleArr;


    // apne upstream ke elements ke downstrea me khud ko add krna
    for (let j = 0; j < eleArr.length; j++) {
        addTODownStream(selectedCellAddresss, eleArr[j])
    }

    let valObj = {

    }

    for (let i = 0; i < eleArr.length; i++) {
        let formulaDependency = eleArr[i];

        valObj[formulaDependency] = dataObj[formulaDependency].value;
    }


    for (let j = 0; j < formulaArr.length; j++) {
        if (valObj[formulaArr[j]] !== undefined) {
            formulaArr[j] = valObj[formulaArr[j]];
        }
    }

    fInput = formulaArr.join(" ");

    let newValue = eval(fInput);

    dataObj[selectedCellAddresss].value = newValue;

    let selectedCellDownstream = dataObj[selectedCellAddresss].downstream;

    for (let i = 0; i < selectedCellDownstream.length; i++) {
        updateDownstreamElements(selectedCellDownstream[i]);
    }


    oldCell.innerText = newValue;
    formulaInput.value = ""
});


function removeFromUpstream(dependent, onWhichItsDependent) {

    let newDownStream = [];

    let oldDownStream = dataObj[onWhichItsDependent].downstream;

    for (let i = 0; i < oldDownStream.length; i++) {
        if (oldDownStream[i] != dependent) newDownStream.push(oldDownStream[i]);
    }

    dataObj[onWhichItsDependent].downstream = newDownStream;
}


function updateDownstreamElements(elementAddress) {

    let valObj = {

    }

    let currCellUpstream = dataObj[elementAddress].upstream;

    for (let i = 0; i < currCellUpstream.length; i++) {
        let upStreamCellAddress = currCellUpstream[i];
        let upStreamCellValue = dataObj[upStreamCellAddress].value;


        valObj[upStreamCellAddress] = upStreamCellValue;
    }

    let currFormula = dataObj[elementAddress].formula;
    let formulaArr = currFormula.split(" "); // arry

    for (let j = 0; j < formulaArr.length; j++) {
        if (valObj[formulaArr[j]]) {
            formulaArr[j] = valObj[formulaArr[j]];
        }
    }

    currFormula = formulaArr.join(" "); // string
    console.log(currFormula);
    let newValue = eval(currFormula);

    dataObj[elementAddress].value = newValue;

    let cellOnUI = document.querySelector(`[data-address=${elementAddress}]`)
    cellOnUI.innerText = newValue;

    let currCellDownStream = dataObj[elementAddress].downstream;

    //apne downstream ko bhi update recursively
    if (currCellDownStream.length > 0) {
        for (let k = 0; k < currCellDownStream.length; k++) {
            updateDownstreamElements(currCellDownStream[k]);
        }
    }

}


function cycleDetection(cellAddress, formulaArr) {

    let downstream = dataObj[cellAddress].downstream;

    let found = formulaArr.find((ele) => {
        return ele === cellAddress


    });
    if (found) {
        return true;
    }

    for (let i = 0; i < downstream.length; i++) {
        for (let j = 0; j < formulaArr.length; j++) {
            if (downstream[i] === formulaArr[j]) return true;
        }
    }

    for(let i=0;i<downstream.length;i++){
        if(cycleDetection(downstream[i],formulaArr)) return true;
    }

    return false;

}


function refError(cellAddress) {

    dataObj[cellAddress].value = "refErr!";
    document.querySelector(`div[data-address=${cellAddress}]`).innerHTML = "refErr!";

    let downstream = dataObj[cellAddress].downstream;

    for (let i = 0; i < downstream.length; i++) {
        refError(downstream[i])

    }


}

function addTODownStream(toBeAdded, inWhichWeRadding) {

    dataObj[inWhichWeRadding].downstream.push(toBeAdded);
}