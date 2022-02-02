const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const OurPlayer  = localStorage.getItem("Player") 

function RegisterFormSubmit(e) {
    e.preventDefault()
    const name = e.target.email.value
    const email = e.target.email.value
    const password = e.target.pwd.value
    if (!(email == "" && password == "" && name == "")) {
        const Forid = email.split("@")
        const id = Forid[0]
        db.collection("Users").doc(`${id}`).set({
            Name: name,
            Email: email,
            Password: password
        })
        name = ""
        email = ""
        password = ""
        alert("Register Successfully")

    } else {
        alert("Fill all the fields")
    }
}

function LoginFormSubmit(e) {
    e.preventDefault()
    const email = e.target.Logemail.value
    const password = e.target.Logpwd.value
    if (!(email == "" && password == "")) {
        const Forid = email.split("@")
        const id = Forid[0]
        db.collection("Users").doc(`${id}`).get().then(snapshot => {
            if (snapshot.exists) {
                if (snapshot.data().Password == password) {
                    localStorage.setItem("Player", JSON.stringify(snapshot.data()))
                    if (confirm("Succesfully Login!") == true) {

                        window.location.reload()
                    } else {
                        window.location.reload()
                    }


                    email = ""
                    password = ""

                    document.location.reload()
                } else {
                    alert("Incorrect password")
                    email = ""
                    password = ""

                }
            } else {
                alert("Signup first")
                email = ""
                password = ""
                window.location.reload()
            }
        })

    } else {
        alert("Fill all the fields")
    }

}


function setKey(event){
    if(OurPlayer){
const Player = localStorage.getItem("Player")
const id = JSON.parse(Player).Email.split("@")
    console.log("Key",event.target.alt)
    const key = event.target.alt
    if(key=="Arrow Keys"){
        db.collection("KeyBoard_Keys").doc(`${id[0]}`).set({
            key:"arrow"
        })
    }
    else{
        db.collection("KeyBoard_Keys").doc(`${id[0]}`).set({
            key:"wasd"
        })
    }}
    else{
        alert("First Login")
        window.location.reload()
    }

}

const Player = localStorage.getItem("Player")
if(Player){
const playerName = document.getElementById("PlayerName")
playerName.innerHTML = JSON.parse(Player).Name
const playerEmail = document.getElementById("PlayerEmail")
playerEmail.innerHTML = JSON.parse(Player).Email
    // console.log("Player",)
const id = JSON.parse(Player).Email.split("@")
db.collection("Scores").doc(`${id[0]}`).get().then((e) => {

    const Scores = e.data()
    console.log("SSSSS",Scores.AllScores)
    Scores.AllScores.forEach(
        entry => {
            
            document.getElementById("Profile-score").innerHTML += `<tr>
                
                                <td> ${Scores.AllScores.indexOf(entry)+1})      ${ entry}</td>
                            </tr>`

            // console.log("Date", myDate.getDate(), monthNames[myDate.getMonth()], myDate.getFullYear())
        }
    )



})
}

db.collection("Scores").get().then(snapshot=>{
        snapshot.forEach((doc)=>{
        const id = doc.id
        const ScorersData = doc.data()
        db.collection("Users").doc(`${id}`).get().then(snapshot => {
                const ScorerName = snapshot.data().Name
                console.log("pppppppp",ScorersData.AllScores)
                var highestScore=0;
                var high = 0;

                ScorersData.AllScores.forEach((e)=>{
                    console.log("aa",e)
                    if(e>high){
                    console.log("bbb",e)
                        high = e
                    }
                    highestScore = high
                })
                document.getElementById("ScoreBoard").innerHTML +=
`<div style="display: flex;flex-direction: row">
<strong style="float: left;">${ScorerName}</strong>
<p style="margin-left: auto;">${highestScore}</p>
</div>`
          })
        }

    
    )
        
    })



    function LogOut(){
        if (confirm("Are you sure you want to Logout?") == true) {
            
        localStorage.setItem("Player","")
            window.location.reload()
        } else {
            window.location.reload()
        }

    }
// db.collection("Users").get().then(snapshot=>{
//     snapshot.docs.map((doc)=>{
//       console.log("COLLECTION",doc.data())
//     })

//     })
 

function StartGame (){
    if(OurPlayer){

    if(window.location.pathname=="/E:/Running%203D%20Game/Frontend/index.html"){
    window.location.href = "/E:/Running%203D%20Game/Main Game/index.html"

    }
    else{
        window.location.href = "http://127.0.0.1:5500/Main Game/index.html"
    }
}
else{
    alert("First Login")
    window.location.reload()
}
}