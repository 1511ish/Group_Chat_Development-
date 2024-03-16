const signup_btn = document.getElementById('signup_btn');
const login_btn = document.getElementById('login_btn');
const login_form = document.getElementById('login_form');
const email = document.getElementById('login_email');
const password = document.getElementById('login_password');
signup_btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = "../home";
})
login_btn.addEventListener('click', login);

async function login(e) {
    try {
        if (login_form.checkValidity()) {
            e.preventDefault();
            const data = {
                email: email.value,
                password: password.value
            }
            const Response = await axios.post("/user/login", data);
            login_form.reset();
            localStorage.setItem("token",Response.data.token);
            window.alert(Response.data.message);
            window.location.href = '/user/main';
        }


    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert(error.response.data.message);
        } else if (error.response && error.response.status === 404) {
            alert(error.response.data.message);
        } else {
            alert("Something went wrong - Sign in again");
            console.log(error);
        }
        login_form.reset();

    }
}