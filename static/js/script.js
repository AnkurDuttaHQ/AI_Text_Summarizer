// ==============================================
// SELECT ELEMENTS
// ==============================================

const inputText = document.getElementById("inputText");
const charCount = document.getElementById("charCount");

const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

const summaryBox = document.getElementById("summaryBox");
const loading = document.getElementById("loading");

// ==============================================
// CHARACTER COUNTER
// ==============================================

inputText.addEventListener("input", () => {

    charCount.innerText = `${inputText.value.length} Characters`;

});

// ==============================================
// CLEAR BUTTON
// ==============================================

clearBtn.addEventListener("click", () => {

    inputText.value = "";

    summaryBox.innerHTML = "Your AI generated summary will appear here...";

    charCount.innerText = "0 Characters";

});

// ==============================================
// COPY BUTTON
// ==============================================

copyBtn.addEventListener("click", async () => {

    if(summaryBox.innerText.trim() === "" ||
       summaryBox.innerText === "Your AI generated summary will appear here...")
    {
        alert("Nothing to copy.");
        return;
    }

    try{

        await navigator.clipboard.writeText(summaryBox.innerText);

        copyBtn.innerHTML =
        `<i class="ri-check-line"></i> Copied`;

        setTimeout(()=>{

            copyBtn.innerHTML =
            `<i class="ri-file-copy-line"></i> Copy Summary`;

        },2000);

    }

    catch{

        alert("Copy failed!");

    }

});

// ==============================================
// SUMMARIZE BUTTON
// ==============================================

summarizeBtn.addEventListener("click", generateSummary);

// ==============================================
// CTRL + ENTER
// ==============================================

inputText.addEventListener("keydown",(e)=>{

    if(e.ctrlKey && e.key==="Enter"){

        generateSummary();

    }

});

// ==============================================
// GENERATE SUMMARY
// ==============================================

async function generateSummary(){

    const text = inputText.value.trim();

    if(text===""){

        alert("Please enter some text.");

        return;

    }

    loading.style.display="flex";

    summaryBox.innerHTML="";

    summarizeBtn.disabled=true;

    summarizeBtn.innerHTML=
    `<i class="ri-loader-4-line"></i> Summarizing...`;

    try{

        const response = await fetch("/summarize",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                text:text

            })

        });

        if(!response.ok){

            throw new Error("Server Error");

        }

        const data = await response.json();

        summaryBox.innerHTML=data.summary;

    }

    catch(error){

        console.error(error);

        summaryBox.innerHTML=
        "Something went wrong while generating the summary.";

    }

    finally{

        loading.style.display="none";

        summarizeBtn.disabled=false;

        summarizeBtn.innerHTML=
        `<i class="ri-magic-line"></i> Summarize`;

    }

}