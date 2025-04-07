// javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getDatabase,
    ref,
    push,
    onValue,
    update,
    remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"

const firebaseConfig = {
    databaseURL: "https://endorsement-app-b9d64-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const referenceInDB = ref(database, "endorsements")

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


const inputField = document.getElementById("endorsement-input")
const publishBtn = document.getElementById("publish-btn")
const ulEl = document.getElementById("ul-el")
const senderField = document.getElementById("sender")
const receiverField = document.getElementById("receiver")

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
    }
    
})



function render(list) {
    let listItems = ""
    
    list.reverse() //to reverse the order of the list so the newest appear first and the oldest last
    
    for(let i = 0; i < list.length; i++) {
        let listArray = list[i]
        let listID = listArray[0]
        let {sender, message, receiver, likes} = listArray[1]
        let heartIcon = localStorage.getItem(`liked-${listID}`) ? "❤️" : "🖤"
        
        listItems += `
            <li class="list-item" data-id="${listID}">
                <strong>From ${sender}</strong><br>
                <p>${message}</p><br>
                <strong>To ${receiver}</strong>
                <button class="likes-btn" data-id="${listID}">${heartIcon}</button>
                <span class="likes-count">${likes}</span>
            </li>
        `
    }
    
    ulEl.innerHTML = listItems
    
    document.querySelectorAll(".likes-btn").forEach(button => {
        button.addEventListener("click", function() {
            const buttonID = button.getAttribute("data-id")
            const exactLocationOfButtonInDB = ref(database, `endorsements/${buttonID}`)
            
            if(localStorage.getItem(`liked-${buttonID}`)) {
                alert("You've already liked this message.")
                return
            }
            button.textContent = "❤️" //need to make this work dynamic
            onValue(exactLocationOfButtonInDB, function(snapshot) {
                const data = snapshot.val()
                if(data) {
                    const newLikes = (data.likes || 0) + 1
                    update(exactLocationOfButtonInDB, {likes: newLikes})
                    
                    const likeSpan = button.nextElementSibling
                    likeSpan.textContent = newLikes
                }
            }, {onlyOnce: true}) // Prevent duplicate calls
            
            localStorage.setItem(`liked-${buttonID}`, "true")
        })
    })
    
    document.querySelectorAll(".list-item").forEach(item => {
        item.addEventListener("dblclick", function() {
            const itemID = item.getAttribute("data-id")
            const exactLocationOfItemInDB = ref(database, `endorsements/${itemID}`)
        
            remove(exactLocationOfItemInDB)
        })
    })
}
