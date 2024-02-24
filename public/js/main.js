
const create_newgroup_btn = document.getElementById('create_newgroup_btn');
const group_container = document.getElementById('group_container');
const token = localStorage.getItem('token');
ShowGroup();
const group_editbtn = document.getElementById('three_dotes')
const send_btn = message_form.querySelector('div');

var dots = document.querySelector(".dots");
var optionsMenu = document.querySelector(".options_menu");
var removeUserForm = document.querySelector("#remove_user_form");
var addUserForm = document.querySelector("#add_user_form");

function afterSetUp(groupId) {
    console.log("in afterSetUp method.");
    let html = `<ul>
                   <li><a href="#" class="option_edit">Group Profile Edit</a></li>
                   <li><a href="#" class="option_add" id="${groupId}" onclick='addUserform(${groupId})'>Add User</a></li>
                   <li><a href="#" class="option_remove" id="${groupId}" onclick='removeUserform(${groupId})'>Remove User</a></li>
                   <li><a href="#" onclick='deleteGroup(${groupId})'>Delete Group</a></li>
                </ul>`;
    optionsMenu.innerHTML = html;
    dots.addEventListener("click", displayMenu);

    document.addEventListener("click", function (event) {
        if (!event.target.closest('.options')) {
            optionsMenu.style.display = "none";
        }
    });
}

function displayMenu() {
    if (optionsMenu.style.display === "block") {
        optionsMenu.style.display = "none";
    } else {
        optionsMenu.style.display = "block";
        // optionRemove = document.querySelector(".option_remove");
    }
    // optionRemove.addEventListener("click", function (event) {
    // event.preventDefault();
    // removeUserForm.style.display = "block";
    // removeUserForm.style.visibility = 'visible';

    // });
}

async function addUserform(groupId) {
    console.log("clicked");
    addUserForm.style.visibility = 'visible';
    const userSearchInput = document.getElementById('adduserSearch');
    const userList = document.getElementById('adduserList');

    const response = await axios.get('http://localhost:3000/user/getAll', { headers: { 'Authorization': token } });
    const users = response.data.users

    // Initialize checked state for each user
    const userCheckedState = {};
    users.forEach(user => {
        userCheckedState[user.id] = false;
    });

    // Function to render user list
    function renderUserList(users) {
        userList.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            const isChecked = userCheckedState[user.id];
            div.innerHTML = `<div>
                              <label for="${user.id}"><img src="/dp.PNG" alt="" class="avatar">${user.name}</label>
                           </div>
                           <input type="checkbox" id="${user.id}" name="users" value="${user.id}" ${isChecked ? 'checked' : ''}>`;
            userList.appendChild(div);
        });
    }

    // Initial render of user list
    renderUserList(users);

    // Event listener for search input
    userSearchInput.addEventListener('input', () => {
        const searchText = userSearchInput.value.toLowerCase();
        const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText));
        renderUserList(filteredUsers);
    });

    // Event listener for checkbox changes
    userList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const userId = e.target.id;
            userCheckedState[userId] = e.target.checked;
        }
    });

    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedUsers = Object.keys(userCheckedState).filter(user => userCheckedState[user]);
        // Reset checked state of all users
        Object.keys(userCheckedState).forEach(user => {
            userCheckedState[user] = false;
        });
        groupForm.reset();
        const response = await axios.post(`http://localhost:3000/user/update-group/add-user?groupId=${groupId}`,{usersToAddIds: selectedUsers}, { headers: { 'Authorization': token } });
        alert(response.data.message);
        // Re-render user list with all users unchecked
        renderUserList(users);
    });
    const cancel_btn = document.getElementById('add_cancel_btn');
    cancel_btn.addEventListener('click', (e) => {
        e.preventDefault();
        addUserForm.style.visibility = 'hidden';
    })
}

async function removeUserform(groupId) {
    removeUserForm.style.visibility = 'visible';
    const userSearchInput = document.getElementById('removeuserSearch');
    const userList = document.getElementById('removeuserList');

    const memberApi = await axios(`get-group-members?groupId=${groupId}`, { headers: { 'Authorization': token } });
    const { users } = memberApi.data;
    // console.log(users);

    // Initialize checked state for each user
    const userCheckedState = {};
    users.forEach(user => {
        userCheckedState[user.id] = false;
    });

    // Function to render user list
    function renderUserList(users) {
        userList.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            const isChecked = userCheckedState[user.id];
            div.innerHTML = `<div>
                               <label for="${user.id}"><img src="/dp.PNG" alt="" class="avatar">${user.name}</label>
                            </div>
                            <input type="checkbox" id="${user.id}" name="users" value="${user.id}" ${isChecked ? 'checked' : ''}>`;
            userList.appendChild(div);
        });
    }

    // Initial render of user list
    renderUserList(users);

    // Event listener for search input
    userSearchInput.addEventListener('input', () => {
        const searchText = userSearchInput.value.toLowerCase();
        const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText));
        renderUserList(filteredUsers);
    });

    // Event listener for checkbox changes
    userList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const userId = e.target.id;
            userCheckedState[userId] = e.target.checked;
        }
    });

    const cancel_btn = document.getElementById('remove_cancel_btn');
    cancel_btn.addEventListener('click', (e) => {
        e.preventDefault();
        removeUserForm.style.visibility = 'hidden';
    })

    removeUserForm.addEventListener('submit', removeUser);
    async function removeUser(e) {
        e.preventDefault();
        console.log("atleast chal toh araha hai...");
        const selectedUsers = Object.keys(userCheckedState).filter(user => userCheckedState[user]);

        console.log(selectedUsers.length);
        console.log('Selected Users:', selectedUsers);
        removeUserForm.reset();
        const response = await axios.post(`http://localhost:3000/user/update-group/remove-user?groupId=${groupId}`, { usersToRemoveIds: selectedUsers }, { headers: { 'Authorization': token } });
        alert(response.data.message);
    }
}

async function deleteGroup(groupId) {
    try {
        const response = await axios.delete(`http://localhost:3000/user/delete-group?groupId=${groupId}`, { headers: { 'Authorization': token } });
        alert(response.data.message);
    } catch (err) {
        console.log(err);
    }
}

create_newgroup_btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const groupForm = document.getElementById('groupForm');
    const cancel_btn = document.getElementById('cancel_btn');
    const userSearchInput = document.getElementById('userSearch');
    const userList = document.getElementById('userList');
    groupForm.style.visibility = 'visible';

    const response = await axios.get('http://localhost:3000/user/getAll', { headers: { 'Authorization': token } });
    const users = response.data.users

    // Initialize checked state for each user
    const userCheckedState = {};
    users.forEach(user => {
        userCheckedState[user.id] = false;
    });

    // Function to render user list
    function renderUserList(users) {
        userList.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            const isChecked = userCheckedState[user.id];
            div.innerHTML = `<div>
                               <label for="${user.id}"><img src="/dp.PNG" alt="" class="avatar">${user.name}</label>
                            </div>
                            <input type="checkbox" id="${user.id}" name="users" value="${user.id}" ${isChecked ? 'checked' : ''}>`;
            userList.appendChild(div);
        });
    }

    // Initial render of user list
    renderUserList(users);

    // Event listener for search input
    userSearchInput.addEventListener('input', () => {
        const searchText = userSearchInput.value.toLowerCase();
        const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText));
        renderUserList(filteredUsers);
    });

    // Event listener for checkbox changes
    userList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const userId = e.target.id;
            userCheckedState[userId] = e.target.checked;
        }
        console.log(userCheckedState);
    });

    groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Collect form data
        const groupName = document.getElementById('groupName').value;
        const description = document.getElementById('description').value;
        const selectedUsers = Object.keys(userCheckedState).filter(user => userCheckedState[user]);
        console.log(token)

        const data = {
            name: groupName,
            membersNo: selectedUsers.length + 1,
            membersIds: selectedUsers
        }

        // Here you can perform AJAX request to the server to handle group creation
        console.log('Group Name:', groupName);
        console.log('Description:', description);
        console.log('Selected Users:', selectedUsers);

        // Reset checked state of all users
        Object.keys(userCheckedState).forEach(user => {
            userCheckedState[user] = false;
        });
        groupForm.reset();
        await axios.post('http://localhost:3000/user/create-group', data, { headers: { 'Authorization': token } });
        alert("Group successfully created")

        // Re-render user list with all users unchecked
        renderUserList(users);
    });
    cancel_btn.addEventListener('click', (e) => {
        e.preventDefault();
        groupForm.style.visibility = 'hidden';
    })
})

async function ShowGroup() {
    try {
        const groupsResponse = await axios(`http://localhost:3000/user/get-mygroups`, { headers: { 'Authorization': token } });
        const { groups } = groupsResponse.data;
        // console.log(groups);
        let html = "";
        groups.forEach((ele) => {
            const date = new Date(ele.date);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = date.toLocaleString('en-US', options);
            html += `               
            <li onclick="showGroupChat(${ele.id})">
               <div>
                   <img src="https://picsum.photos/seed/${ele.id}/200" alt="Profile Picture">
                   <strong id="${ele.id}">${ele.name}</strong>
                   <small id="${ele.id}">${ele.membersNo} Members</small>
               </div>
            </li>    
        `
        })
        group_container.innerHTML += html;
    } catch (error) {
        console.log(error);
    }
}

async function showGroupChat(id) {
    try {
        // const groupId = e.target.id;
        const groupId = id;

        const getUserResponse = await axios.get('/user/get-user', { headers: { 'Authorization': token } });
        const userId = getUserResponse.data.userId
        // console.log(userId);
        if (groupId && groupId != "group_body") {
            setupGroup(groupId, userId)
            if (groupId == 0) {
                ShowCommonChats();
            } else {
                const APIresponse = await axios(`get-group-messages?groupId=${groupId}`);
                const apiChats = APIresponse.data.chats
                // console.log(APIresponse.data);
                showChatOnScreen(apiChats, userId)
            }
        } else {
            console.log("no group id");
        }

    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
        // window.location = '/';
    }
}

function showChatOnScreen(chatHistory, userId) {
    chat_body.innerHTNL = "";
    let messageText = "";
    chatHistory.forEach((ele) => {
        const date = new Date(ele.date_time);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleString('en-US', options);

        if (ele.userId == userId) {
            // if (ele.isImage) {
            //     messageText += `      
            // <div class="col-12 mb-2 pe-0">
            //     <div class="card p-2 float-end rounded-4 self-chat-class">
            //         <p class="text-primary my-0"><small>${ele.name}</small></p>
            //         <a href="${ele.message}" target="_blank">
            //           <img src="${ele.message}" class="chat-image">
            //         </a>
            //         <small class="text-muted text-end">${formattedDate}</small>
            //     </div>
            // </div>
            // `
            // } 
            // else { }
            // messageText += `                            
            // <div class="col-12 mb-2 pe-0">
            //     <div class="card p-2 float-end rounded-4 self-chat-class">
            //         <p class="text-primary my-0"><small>${ele.name}</small></p>
            //         <p class="my-0">${ele.message}</p>
            //         <small class="text-muted text-end">${formattedDate}</small>
            //     </div>
            // </div>`
            messageText += `                            
            <div class="card outgoing">
               <small class="text-primary">${ele.name}</small>
               <p class="chat">${ele.message}</p>
               <small class="text-muted text-end">${formattedDate}</small>
           </div>`
        } else {
            // if (ele.isImage) {
            //     messageText += `                            
            //     <div class="col-12 mb-2 pe-0">
            //         <div class="card p-2 float-start rounded-4 chat-class">
            //             <p class="text-danger my-0"><small>${ele.name}</small></p>
            //             <a href="${ele.message}" target="_blank">
            //             <img src="${ele.message}" class="chat-image">
            //           </a>
            //             <small class="text-muted">${formattedDate}</small>
            //         </div>
            //     </div>`

            // } else { }
            // messageText += `                            
            // <div class="col-12 mb-2 pe-0">
            //     <div class="card p-2 float-end rounded-4 chat-class">
            //         <p class="text-danger my-0"><small>${ele.name}</small></p>
            //         <p class="my-0">${ele.message}</p>
            //         <small class="text-muted">${formattedDate}</small>
            //     </div>
            // </div>`
            messageText += `                     
            <div class="card incoming">
               <small class="text-danger">${ele.name}</small>
               <p class="chat">${ele.message}</p>
               <small class="text-muted text-end">${formattedDate}</small>
            </div>`
        }

    })
    chat_body.innerHTML = messageText;
    // chat_container.scrollTop = chat_container.scrollHeight;
}

async function setupGroup(groupId, userId) {
    try {
        if (groupId == 0) {
            group_img.src = `https://picsum.photos/seed/common/200`;
            group_heading.innerHTML = `Common Group`;
            group_members.innerHTML = ` All Members`;
            group_members.setAttribute("title", `All Members can access this group !`);
            formElements.message_btn.id = groupId;
            group_editbtn.classList.add('d-none')

        } else {
            // console.log("chalu hai bhai........");
            const APIresponse = await axios(`http://localhost:3000/user/get-group?groupId=${groupId}`);
            const { group } = APIresponse.data;
            group_img.src = `https://picsum.photos/seed/${groupId}/200`;
            group_heading.innerHTML = `${group.name}`;
            group_members.innerHTML = ` ${group.membersNo} Members`;
            const memberApi = await axios(`get-group-members?groupId=${groupId}`, { headers: { 'Authorization': token } });
            const { users } = memberApi.data;

            const usersString = users.map(item => item.name.trim()).join(',');
            group_members.setAttribute("title", `${usersString}`);
            send_btn.id = groupId
            if (group.AdminId == userId) {
                // group_editbtn.id = groupId;
                group_editbtn.classList.remove('d-none')
                afterSetUp(groupId);
            } else {
                group_editbtn.classList.add('d-none')
            }
        }


    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}

async function showGroupChats(groupId) {
    try {
        const APIresponse = await axios.get(`user/get-group-messages?groupId=${groupId}`);
        const apiChats = APIresponse.data.chats
        const getUserResponse = await axios.get('/user/get-user');
        const userId = getUserResponse.data.userId
        showChatOnScreen(apiChats, userId)
    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}







const message = document.getElementById('message_field');
const chat_body = document.getElementById('chat_body');
send_btn.addEventListener('click', sendMessage);

// let oldChat = []; ######yo pehle bhi commented tha...........

async function sendMessage(e) {
    e.preventDefault();
    const groupId = e.target.id;
    console.log(message.value);
    console.log(e.target);
    console.log(groupId);
    const data = {
        token: localStorage.getItem('token'),
        message: message.value,
        groupId: groupId
    }
    try {
        // if (localStorage.getItem('oldChat')) { ######yo pehle bhi commented tha...........
        //     oldChat = localStorage.getItem('oldChat');
        // }
        const response = await axios.post('http://localhost:3000/chat/add', data)
        const date = new Date(response.data.date_time);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleString('en-US', options);
        console.log(formattedDate);
        chat_body.innerHTML += ` <div class="card outgoing">
                                    <small class="text-primary">${response.data.name}</small>
                                    <p class="chat">${response.data.message}</p>
                                    <small class="text-muted text-end">${formattedDate}</small>
                                </div>`;

        // oldChat.push({ id: response.data.id, message: response.data.message });
        // localStorage.setItem('oldChat',oldChat);
    } catch (err) {
        console.log(err);
    }
    message.value = '';
}

// window.addEventListener('DOMContentLoaded', async () => {
//     const token = localStorage.getItem('token');
//     // if (localStorage.getItem('oldChat')) {
//     //     oldChat = localStorage.getItem('oldChat');
//     // }
//     const response = await axios.get(`http://localhost:3000/chat/get`, { headers: { 'Authorization': token } });
//     console.log(response);
//     const chats = response.data.chats;
//     chats.forEach(chat => {
//         const li = document.createElement('li');
//         li.innerHTML = chat.message;
//         chat_ul.appendChild(li);
//         chat_ul.innerHTML += `<br>`;
//     });
// })