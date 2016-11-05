function openNavleft() {
    document.getElementById("mySidenavleft").style.width = "250px";
    document.getElementById('points').classList.add("active");
}
function closeNavL() {
    document.getElementById("mySidenavleft").style.width = "0";
    document.getElementById('points').classList.remove("active");
    document.body.style.backgroundColor = "white";
}

function openNavright() {
    document.getElementById("mySidenavright").style.width = "250px";
    document.getElementById('points').classList.add("active");
    document.getElementById('hideleaderboard').style.display="block";
    document.getElementById('showleaderboard').style.display="none";
}

function closeNavR() {
    document.getElementById("mySidenavright").style.width = "0";
    document.getElementById('points').classList.remove("active");
    document.body.style.backgroundColor = "white";
    document.getElementById('showleaderboard').style.display="block";
    document.getElementById('hideleaderboard').style.display="none";
    
}