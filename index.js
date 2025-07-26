// javascript 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getDatabase,
    ref,
    push,
    onValue,
    get,
    update,
    remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"

const firebaseConfig = {
    databaseURL: "https://endorsement-app-b9d64-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const referenceInDB = ref(database, "endorsements")

const inputField = document.getElementById("endorsement-input")
const publishBtn = document.getElementById("publish-btn")
const ulEl = document.getElementById("ul-el")
const senderField = document.getElementById("sender")
const receiverField = document.getElementById("receiver")


onValue(referenceInDB, function(snapshot) {
    const doesSnapshotExist = snapshot.exists()
    if(doesSnapshotExist) {
        const snapshotValues = snapshot.val()
        const endorsementList = Object.entries(snapshotValues)
        
    render(endorsementList)
    }
    else {
        ulEl.innerHTML = ""
    }
})


publishBtn.addEventListener("click", function() {
    const sender = senderField.value.trim()
    const receiver = receiverField.value.trim()
    const message = inputField.value.trim()
    let likes = 0
    
    if(sender && message && receiver) {
        push(referenceInDB, {sender, message, receiver, likes})
        inputField.value = ""
        senderField.value = ""
        receiverField.value = ""
        return
    }
    alert("Please fill out all fields.")

})



function render(list) {
    console.log("Rendering list:", list)

    let listItems = ""
    
    list.reverse() //to reverse the order of the list so the newest appear first and the oldest last
    
    for(let i = 0; i < list.length; i++) {
        const listArray = list[i]
        const listID = listArray[0]
        const {sender, message, receiver, likes} = listArray[1]
        const heartIconClass = localStorage.getItem(`liked-${listID}`) ? "fa-solid" : "fa-regular"


        
        listItems += `
            <li class="list-item" data-id="${listID}">
                <div>
                    <strong>To ${receiver}</strong><br>
                    <p>${message}</p><br>
                    <strong>From ${sender}</strong>
                </div>
                <div class="likes-ctn">
                    <i class= "${heartIconClass} fa-heart" data-id="${listID}"></i>
                    <span class="likes-count">${likes}</span>
                </div>
            </li>
        `  
    }
    
    ulEl.innerHTML = listItems
    
    document.querySelectorAll(".fa-heart").forEach(i => {
        i.addEventListener("click", function() {
            const heartButtonID = i.dataset.id
            const exactLocationOfButtonInDB = ref(database, `endorsements/${heartButtonID}`)

            const likeSpan = i.nextElementSibling

           if(localStorage.getItem(`liked-${heartButtonID}`)) {
                alert("You've already liked this message.")
                return
            } else {
                i.classList.remove("fa-regular")
                i.classList.add("fa-solid")
                localStorage.setItem(`liked-${heartButtonID}`, "true")
            } /* this else is what updated the heart icon dynamically */
            
            get(exactLocationOfButtonInDB).then(snapshot => {
                const data = snapshot.val()
                if(data) {
                    const newLikes = (data.likes || 0) + 1
                    update(exactLocationOfButtonInDB, {likes: newLikes})

                    likeSpan.textContent = newLikes
                    i.classList.remove("fa-regular")
                    i.classList.add("fa-solid")
                    localStorage.setItem(`liked-${heartButtonID}`, "true")
                }
            }).catch(error => console.error("Error getting data:", error))
            // {onlyOnce: true}) Prevent duplicate calls
        })
    })

    document.querySelectorAll(".list-item").forEach(item => {
        item.addEventListener("dblclick", function() {
            const itemID = item.dataset.id
            const exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)

        
            if (confirm("Are you sure you want to delete this endorsement?")) {
                remove(exactLocationOfItemInDB)
            }
        })
    })
}