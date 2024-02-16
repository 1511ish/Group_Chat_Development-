const send_btn = document.getElementById('send_btn');
const message = document.getElementById('message_field');
const ul = document.querySelector('ul');
send_btn.addEventListener('click', sendMessage);

async function sendMessage(e) {
    e.preventDefault();
    console.log(message.value);
    const data = {
        token: localStorage.getItem('token'),
        message: message.value
    }
    try {
        const response = await axios.post('http://localhost:3000/chat/add', data)
        const li = document.createElement('li');
        li.innerHTML = response.data.message;
        ul.appendChild(li);
        ul.innerHTML += `<br>`;
    } catch (err) {
        console.log(err);
    }
    message.value = '';
}

window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/chat/get', { headers: { 'Authorization': token } });
    console.log(response);
    const chats = response.data.chats;
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.innerHTML = chat.message;
        ul.appendChild(li);
        ul.innerHTML += `<br>`;
    });
})