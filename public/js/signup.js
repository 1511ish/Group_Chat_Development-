var form = document.getElementById("signupForm");
const signUpButton = document.getElementById('signUp');
signUpButton.addEventListener("click", signup);

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
        console.log('chal toh raha bhai..');
        const response = await axios.post('user/signup', user);
        alert("user signup successfully.");
    } catch (err) {
        form_container.innerHTML += `<div style='color:red ;margin:5px'>${err.response.data.message} <div>`;
    }

    name.value = '';
    email.value = '';
    phone_no.value = '';
    password.value = '';
}