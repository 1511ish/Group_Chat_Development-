var form = document.getElementById("signupForm");
const signUpButton = document.getElementById('signUp');
const AHAButton = document.getElementById('AHA');

signUpButton.addEventListener('click',signup);
async function signup(e) {
    e.preventDefault();

    if (!form.checkValidity()) {
        e.stopPropagation();
        window.alert("please fill all feilds correctly!!")
        return;
    }
    const form_container = document.getElementById('container');
    const name = document.getElementById('signupUsername');
    const email = document.getElementById('signupEmail');
    const phone_no = document.getElementById('signupPhone');
    const password = document.getElementById('signupPassword');
    try {
        const user = {
            name: name.value,
            email: email.value,
            phone_no: phone_no.value,
            password: password.value
        }
        const response = await axios.post('/user/signup', user);
        alert("user signup successfully.");
        window.location.href = "/login";
    } catch (err) {
        form_container.innerHTML += `<div style='color:red ;margin:5px'>${err.response.data.message} <div>`;
    }

    form.reset();
}

