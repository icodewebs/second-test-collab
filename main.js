
function calcFact(event) {
    event.preventDefault(); 
    
    let num = Number(document.querySelector('#my-form input').value);
    
    let factorial = 1;
    for (let i = 1; i <= num; i++) {
        factorial *= i;
    }
    
    document.getElementById('result').innerHTML = `<b>Factorial of ${num} is:</b> ${factorial}`;
}

function resetline(event) {
    document.getElementById('result').innerHTML = ``;
}
