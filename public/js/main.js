// require('dotenv').config();
const create_newgroup_btn = document.getElementById('create_newgroup_btn');
const group_container = document.getElementById('group_container');
const token = localStorage.getItem('token');
ShowGroup();
const group_editbtn = document.getElementById('three_dotes')
const send_btn = message_form.querySelector('.send_btn');

var dots = document.querySelector(".dots");
var optionsMenu = document.querySelector(".options_menu");
var removeUserForm = document.querySelector("#remove_user_form");
var addUserForm = document.querySelector("#add_user_form");
var groupId;

function afterSetUp(groupId) {
    console.log("in afterSetUp method.");
    let html = `<ul>
                   <li><a href="#" class="" onclick='viewGroupProfile(${groupId})'>View Group Profile</a></li>
                   <li><a href="#" class="option_editProfile" onclick='groupProfileEditform(${groupId})'>Edit Group Profile</a></li>
                   <li><a href="#" class="option_add" onclick='addUserform(${groupId})'>Add User</a></li>
                   <li><a href="#" class="option_remove"  onclick='removeUserform(${groupId})'>Remove User</a></li>
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
}

async function addUserform(groupId) {
    addUserForm.style.visibility = 'visible';
    const userSearchInput = document.getElementById('adduserSearch');
    const userList = document.getElementById('adduserList');

    const memberApi = await axios(`get-group-members?groupId=${groupId}`, { headers: { 'Authorization': token } });
    const { userIds } = memberApi.data;
    console.log(userIds);

    const response = await axios.get(`/user/getAllUserExcept`, { headers: { 'Authorization': token, userIds: JSON.stringify(userIds) } });
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
                              <label for="${user.id}"><img src="/img/user.PNG" alt="" class="avatar">${user.name}</label>
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
        const response = await axios.post(`/user/update-group/add-user?groupId=${groupId}`, { usersToAddIds: selectedUsers }, { headers: { 'Authorization': token } });
        alert(response.data.message);
        addUserForm.style.visibility = 'hidden';
        // Re-render user list with all users unchecked
        // renderUserList(users);
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
                               <label for="${user.id}"><img src="/img/user.PNG" alt="" class="avatar">${user.name}</label>
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
        const selectedUsers = Object.keys(userCheckedState).filter(user => userCheckedState[user]);

        console.log(selectedUsers.length);
        console.log('Selected Users:', selectedUsers);
        removeUserForm.reset();
        const response = await axios.post(`/user/update-group/remove-user?groupId=${groupId}`, { usersToRemoveIds: selectedUsers }, { headers: { 'Authorization': token } });
        alert(response.data.message);
    }
}

async function groupProfileEditform(groupId) {
    var groupProfileEditForm = document.querySelector("#group_profile_edit_Form");
    groupProfileEditForm.style.visibility = 'visible';
    const preview3 = document.getElementById('preview3');
    const groupName = document.getElementById('groupEditName');
    const description = document.getElementById('edit_description');

    const APIresponse = await axios(`/user/get-group?groupId=${groupId}`);
    const { group } = APIresponse.data;
    preview3.src = group.dp_url;
    groupName.value = `${group.name}`;
    description.value = `${group.description}`;


    groupProfileEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.querySelector('input[name="avatar-upload3"]');
        const file = fileInput.files[0];

        if(file){
            const formData = new FormData();
            formData.append('media', file);
            axios.post('/upload', formData)
                .then(response => {
                    const data = {
                        name: groupName.value,
                        description: description.value,
                        dp_url: response.data,
                        groupId: groupId
                    }
                    console.log(data);
                    axios.post(`/user/update-group`, data, { headers: { 'Authorization': token } });
                })
                .then(res => {
                    alert("Group successfully updated.");
                    groupName.value = '';
                    description.value = '';
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
        else{
            const data = {
                name: groupName.value,
                description: description.value,
                dp_url: group.dp_url,
                groupId: groupId
            }
            axios.post(`/user/update-group`, data, { headers: { 'Authorization': token } })
            .then(res => {
                alert("Group successfully updated.");
            })
            .catch(error => {
                console.error('Error:', error);
            });
            groupName.value = '';
            description.value = '';
        }
    })

}

const view_groupProfile_form = document.querySelector("#view_groupProfile_form");
const VGP_groupname = document.getElementById('VGP_groupname');
const VGP_description = document.getElementById('VGP_description');
const preview2 = document.getElementById('preview2');
async function viewGroupProfile2() {
    view_groupProfile_form.style.visibility = 'visible';
    const APIresponse = await axios(`/user/get-group?groupId=${groupId}`);
    const { group } = APIresponse.data;
    preview2.src = group.dp_url;
    VGP_groupname.innerHTML = `${group.name}`;
    VGP_description.innerHTML = ` ${group.description}`;
}

async function viewGroupProfile(groupId) {
    view_groupProfile_form.style.visibility = 'visible';
    const APIresponse = await axios(`/user/get-group?groupId=${groupId}`);
    const { group } = APIresponse.data;
    preview2.src = group.dp_url;
    VGP_groupname.innerHTML = `${group.name}`;
    VGP_description.innerHTML = ` ${group.description}`;
}

async function deleteGroup(groupId) {
    try {
        const response = await axios.delete(`/user/delete-group?groupId=${groupId}`, { headers: { 'Authorization': token } });
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

    const response = await axios.get(`/user/getAll`, { headers: { 'Authorization': token } });
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
                               <label for="${user.id}"><img src="/img/user.PNG" alt="" class="avatar">${user.name}</label>
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
        // console.log(userCheckedState);
    });

    groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const groupName = document.getElementById('groupName').value;
        const description = document.getElementById('description').value;
        const fileInput = document.querySelector('input[name="profile"]');
        const selectedUsers = Object.keys(userCheckedState).filter(user => userCheckedState[user]);

        // Reset checked state of all users
        Object.keys(userCheckedState).forEach(user => {
            userCheckedState[user] = false;
        });

        // Re-render user list with all users unchecked
        renderUserList(users);

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('media', file);

        axios.post('/upload', formData)
            .then(response => {
                const data = {
                    name: groupName,
                    membersNo: selectedUsers.length + 1,
                    membersIds: selectedUsers,
                    description: description,
                    dp_url: response.data
                }
                axios.post(`/user/create-group`, data, { headers: { 'Authorization': token } });
            })
            .then(res => {
                alert("Group successfully created");
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
    cancel_btn.addEventListener('click', (e) => {
        e.preventDefault();
        groupForm.style.visibility = 'hidden';
    })

    groupForm.reset();
})

async function ShowGroup() {
    try {
        const groupsResponse = await axios(`/user/get-mygroups`, { headers: { 'Authorization': token } });
        const { groups } = groupsResponse.data;
        let html = "";
        groups.forEach((ele) => {
            const date = new Date(ele.date);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = date.toLocaleString('en-US', options);
            html += `               
            <li onclick="showGroupChat(${ele.id})">
               <div>
                   <img src="${ele.dp_url}" alt="Profile Picture" onclick='viewGroupProfile(${ele.id})'>
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
        groupId = id;
        const getUserResponse = await axios.get('/user/get-user', { headers: { 'Authorization': token } });
        const userId = getUserResponse.data.userId
        if (groupId && groupId != "group_body") {
            setupGroup(groupId, userId)
            if (groupId == 0) {
                ShowCommonChats();
            } else {
                const APIresponse = await axios(`get-group-messages?groupId=${groupId}`);
                const apiChats = APIresponse.data.chats
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
            if (ele.isImage) {
                messageText += `<div class="card outgoing">
                                   <small class="text-primary">${ele.name}</small>
                                    <div>
                                      <a href="${ele.message}" target="_blank">
                                      <img src="${ele.message}" class="chat-image">
                                    </a>
                                    </div>
                                   <small class="text-muted text-end">${formattedDate}</small>
                                </div>`;
            } else {
                messageText += `                            
                <div class="card outgoing">
                   <small class="text-primary">${ele.name}</small>
                   <p class="chat">${ele.message}</p>
                   <small class="text-muted text-end">${formattedDate}</small>
               </div>`
            }
        } else {
            if (ele.isImage) {
                messageText += `<div class="card incoming">
                                   <small class="text-primary">${ele.name}</small>
                                    <div>
                                      <a href="${ele.message}" target="_blank">
                                      <img src="${ele.message}" class="chat-image">
                                    </a>
                                    </div>
                                   <small class="text-muted text-end">${formattedDate}</small>
                                </div>`;
            } else {
                messageText += `                     
                <div class="card incoming">
                   <small class="text-danger">${ele.name}</small>
                   <p class="chat">${ele.message}</p>
                   <small class="text-muted text-end">${formattedDate}</small>
                </div>`
            }
        }

    })
    chat_body.innerHTML = messageText;
    // chat_container.scrollTop = chat_container.scrollHeight;
}

async function setupGroup(groupId, userId) {
    try {
        // groupId = GroupId;
        if (groupId == 0) {
            group_img.src = `https://picsum.photos/seed/common/200`;
            group_heading.innerHTML = `Common Group`;
            group_members.innerHTML = ` All Members`;
            group_members.setAttribute("title", `All Members can access this group !`);
            formElements.message_btn.id = groupId;
            group_editbtn.classList.add('d-none')

        } else {
            const APIresponse = await axios(`/user/get-group?groupId=${groupId}`);
            const { group } = APIresponse.data;
            group_img.src = group.dp_url;
            group_heading.innerHTML = `${group.name}`;
            group_members.innerHTML = ` ${group.membersNo} Members`;
            const memberApi = await axios(`get-group-members?groupId=${groupId}`, { headers: { 'Authorization': token } });
            const { users } = memberApi.data;

            const usersString = users.map(item => item.name.trim()).join(',');
            group_members.setAttribute("title", `You,${usersString}`);
            // yaha pe issue hai bro...
            send_btn.id = groupId
            if (group.AdminId == userId) {
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

const messageForm = document.getElementById('message_form');
const fileInput = document.querySelector('input[name="media"]');
const preview = document.getElementById('preview');
const messageInput = document.querySelector('input[name="message"]');

fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0]; // Get the selected file

    // Check if a file is selected
    if (file) {
        const reader = new FileReader(); // Create a FileReader object

        // Define what happens when the FileReader has loaded the file
        reader.onload = function (event) {
            const src = event.target.result; // Get the file's data URL

            // Display the selected image or video in the preview container
            preview.style.visibility = 'visible';
            if (file.type.startsWith('image')) {
                preview.innerHTML = `<img src="${src}" alt="Selected Image" style="min-width: 100%; min-height: 100%">`;
            } else if (file.type.startsWith('video')) {
                preview.innerHTML = `<video controls style="max-width: 300px; max-height: 300px;"><source src="${src}" type="${file.type}"></video>`;
            }
        };

        // Read the selected file as a data URL
        reader.readAsDataURL(file);
    } else {
        // Clear the preview container if no file is selected
        preview.innerHTML = '';
    }
});

messageForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    // const messageInput = document.querySelector('input[name="message"]');
    const message = messageInput.value.trim();
    messageInput.value = '';
    console.log(message);

    // Get the selected media file
    const file = fileInput.files[0];

    // Create a new FormData object
    const formData = new FormData();

    if (message) {
        const data = {
            token: localStorage.getItem('token'),
            message: message,
            groupId: groupId,
            isImage: false
        }
        const response = await axios.post(`/chat/add`, data)
        const date = new Date(response.data.date_time);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleString('en-US', options);

        chat_body.innerHTML += ` <div class="card outgoing">
                        <small class="text-primary">${response.data.name}</small>
                        <p class="chat">${response.data.message}</p>
                        <small class="text-muted text-end">${formattedDate}</small>
                    </div>`;
    }
    else {
        formData.append('media', file);
        axios.post('/upload', formData)
            .then(async (res) => {
                const data = {
                    token: localStorage.getItem('token'),
                    message: res.data,
                    groupId: groupId,
                    isImage: true
                }
                console.log(data);
                const response = await axios.post(`/chat/add`, data)
                const date = new Date(response.data.date_time);
                const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const formattedDate = date.toLocaleString('en-US', options);

                chat_body.innerHTML += ` <div class="card outgoing">
                                <small class="text-primary">${response.data.name}</small>
                                <div>
                                    <a href="${response.data.message}" target="_blank">
                                    <img src=${response.data.message} alt="Selected Image" style="max-width: 300px; max-height: 300px;">
                                </div>
                                <small class="text-muted text-end">${formattedDate}</small>
                            </div>`;

                fileInput.value = '';
                preview.innerHTML = '';                   

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

});
