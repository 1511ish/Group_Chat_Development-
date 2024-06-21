const socket = io();

const create_newgroup_btn = document.getElementById('create_newgroup_btn');
const group_container = document.getElementById('group_container');
const group_editbtn = document.getElementById('three_dotes')
const send_btn = message_form.querySelector('.send_btn');

var dots = document.querySelector(".dots");
var optionsMenu = document.querySelector(".options_menu");
var removeUserForm = document.querySelector("#remove_user_form");
var addUserForm = document.querySelector("#add_user_form");

const view_groupProfile_form = document.querySelector("#view_groupProfile_form");
const VGP_groupname = document.getElementById('VGP_groupname');
const VGP_description = document.getElementById('VGP_description');
const preview2 = document.getElementById('preview2');

const message = document.getElementById('message_field');
const chat_body = document.getElementById('chat_body');

const messageForm = document.getElementById('message_form');
const fileInput = document.querySelector('input[name="media"]');
const preview = document.getElementById('preview');
const messageInput = document.querySelector('input[name="message"]');

var groupId;
var src;
getToken();
ShowGroup();

create_newgroup_btn.addEventListener('click', create_newgroup)

function afterSetUp(groupId) {
    console.log("in afterSetUp method.");
    let html = `<ul>
                   <li><a href="#" class="" onclick='viewGroupProfile(${groupId})'>View Group Profile</a></li>
                   <li><a href="#" class="option_editProfile" onclick='groupProfileEditform(${groupId})'>Edit Group Profile</a></li>
                   <li><a href="#" class="option_add" onclick='addUserform(${groupId})'>Add User</a></li>
                   <li><a href="#" class="option_remove"  onclick='removeUserform(${groupId})'>Remove User</a></li>
                   <li><a href="#" onclick='deleteGroup(${groupId})'>Delete Group</a></li>
                   <li><a href="#" onclick='logOut()'>Log Out <span class="fa-solid fa-arrow-right-from-bracket login_icon"></span></a></li>
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

    const memberApi = await axios(`/group/get-group-members?groupId=${groupId}`, { headers: { 'Authorization': getToken() } });
    const { userIds } = memberApi.data;

    const response = await axios.get(`/user/getAllUserExcept`, { headers: { 'Authorization': getToken(), userIds: JSON.stringify(userIds) } });
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
        // const response = await axios.post(`/user/update-group/add-user?groupId=${groupId}`, { usersToAddIds: selectedUsers }, { headers: { 'Authorization': getToken() } });
        let id = `${'small'+groupId}`;
        let small = document.getElementById(id);
        let membersNo = small.innerHTML.substring(0,1);

        const response = await axios.post(`/group/update-group/add-user?groupId=${groupId}`, { usersToAddIds: selectedUsers }, { headers: { 'Authorization': getToken() } });
        let newMembersNo = response.data.updatedGroup.length + parseInt(membersNo);

        small.innerHTML = `${newMembersNo} Members <small id="${groupId}" class="incoming_msgCount" style="visibility: hidden;">0</small>`;

        group_members.innerHTML = ` ${newMembersNo} Members`;
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

    // const memberApi = await axios(`get-group-members?groupId=${groupId}`, { headers: { 'Authorization': token } });
    const memberApi = await axios(`/group/get-group-members?groupId=${groupId}`, { headers: { 'Authorization': getToken() } });
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

        console.log('Selected Users:', selectedUsers);
        removeUserForm.reset();
        const response = await axios.post(`/group/update-group/remove-user?groupId=${groupId}`, { usersToRemoveIds: selectedUsers }, { headers: { 'Authorization': getToken() } });
        removeUserForm.style.visibility = 'hidden';
        alert(response.data.message);
        console.log(response.data);
        let id = `${'small'+groupId}`;
        let small = document.getElementById(id);
        let membersNo = small.innerHTML.substring(0,1);
        let newMembersNo = parseInt(membersNo) - response.data.updatedGroup;

        small.innerHTML = `${newMembersNo} Members <small id="${groupId}" class="incoming_msgCount" style="visibility: hidden;">0</small>`;
        group_members.innerHTML = ` ${newMembersNo} Members`;
    }
}

async function logOut() {
    localStorage.clear();
    // window.location.replace(`/home`);
    window.location.replace(`/login`);
}

function getToken() {
    const token = localStorage.getItem('token');
    if (token) {
        return token;
    } else {
        window.location.replace(`${window.location.origin}/login`);
    }
}

async function groupProfileEditform(groupId) {
    var groupProfileEditForm = document.querySelector("#group_profile_edit_Form");
    groupProfileEditForm.style.visibility = 'visible';
    const preview3 = document.getElementById('preview3');
    const groupName = document.getElementById('groupEditName');
    const description = document.getElementById('edit_description');

    const APIresponse = await axios(`/group/get-group?groupId=${groupId}`);
    const { group } = APIresponse.data;
    if (group.dpUrl)
        preview3.src = group.dpUrl;
    else
        preview3.src = src;
    groupName.value = `${group.name}`;
    description.value = `${group.description}`;


    groupProfileEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.querySelector('input[name="avatar-upload3"]');
        const file = fileInput.files[0];

        if (file) {
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
                    return axios.post(`/group/update-group`, data, { headers: { 'Authorization': getToken() } });
                })
                .then(res => {
                    groupProfileEditForm.style.visibility = 'hidden';
                    groupName.value = '';
                    description.value = '';
                    var ele = res.data.group;
                    if(!ele.dpUrl){
                        ele.dpUrl = '/img/user.PNG';
                    }
                    let id = `${'group'+ele.id}`;
                    let li = document.getElementById(id);
                    li.innerHTML = `
                        <div>
                          <img src="${ele.dpUrl}" alt="Profile Picture" onclick='viewGroupProfile(${ele.id})'>
                          <strong>${ele.name}</strong>
                          <small>${ele.membersNo} Members <small id="${ele.id}" class="incoming_msgCount" style="visibility: hidden;">0</small></small>
                       </div>
                    `;
                    console.log("kaam karri yaha p toh y..");
                    showGroupChat(groupId);
                    alert("Group successfully updated.");
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
        else {
            const data = {
                name: groupName.value,
                description: description.value,
                dp_url: group.dp_url,
                groupId: groupId
            }
            axios.post(`/group/update-group`, data, { headers: { 'Authorization': getToken() } })
                .then(res => {
                    var ele = res.data.group;
                    let id = `${'group'+ele.id}`;
                    let li = document.getElementById(id);
                    li.innerHTML = `
                        <div>
                          <img src="${ele.dpUrl}" alt="Profile Picture" onclick='viewGroupProfile(${ele.id})'>
                          <strong>${ele.name}</strong>
                          <small>${ele.membersNo} Members <small id="${ele.id}" class="incoming_msgCount" style="visibility: hidden;">0</small></small>
                       </div>
                    `;
                    groupProfileEditForm.style.visibility = 'hidden';
                    showGroupChat(groupId);
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

async function viewGroupProfile2() {
    view_groupProfile_form.style.visibility = 'visible';
    const APIresponse = await axios(`/group/get-group?groupId=${groupId}`);
    const { group } = APIresponse.data;
    if (group.dpUrl)
        preview2.src = group.dpUrl;
    else
        preview2.src = src;
    VGP_groupname.innerHTML = `${group.name}`;
    VGP_description.innerHTML = ` ${group.description}`;
}

async function viewGroupProfile(groupId) {
    view_groupProfile_form.style.visibility = 'visible';
    const APIresponse = await axios(`/group/get-group?groupId=${groupId}`);
    const { group } = APIresponse.data;
    if (group.dpUrl)
        preview2.src = group.dpUrl;
    else
        preview2.src = src;
    VGP_groupname.innerHTML = `${group.name}`;
    VGP_description.innerHTML = ` ${group.description}`;
}

async function deleteGroup(groupId) {
    try {
        const response = await axios.delete(`/group/delete-group?groupId=${groupId}`, { headers: { 'Authorization': getToken() } });
        alert(response.data.message);
        ShowGroup();
        group_heading.innerHTML = `this group has been deleted!`;
        group_members.innerHTML = `0 Members`;
        messageForm.style.visibility = 'hidden';
        chat_body.innerHTML = "";
    } catch (err) {
        console.log(err);
    }
}

async function create_newgroup(e) {
    e.preventDefault();
    const groupForm = document.getElementById('groupForm');
    const cancel_btn = document.getElementById('cancel_btn');
    const userSearchInput = document.getElementById('userSearch');
    const userList = document.getElementById('userList');
    groupForm.style.visibility = 'visible';

    const response = await axios.get(`/user/getAll`, { headers: { 'Authorization': getToken() } });
    const users = response.data.users

    // Initialize checked state for each user
    const userCheckedState = {};

    // Function to render user list
    function renderUserList(users) {
        userList.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            // const isChecked = userCheckedState[user.id];
            div.innerHTML = `<div>
                               <label for="${user.id}"><img src="/img/user.PNG" alt="" class="avatar">${user.name}</label>
                            </div>
                            <input type="checkbox" id="${user.id}" name="users" value="${user.id}" >`;
            userList.appendChild(div);
        });
    }

    // Initial render of user list
    renderUserList(users);

    // Event listener for search input
    userSearchInput.addEventListener('input', () => {
        const searchText = userSearchInput.value.toLowerCase();
        const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText));
        // console.log(filteredUsers);
        renderUserList(filteredUsers);
    });

    // Event listener for checkbox changes
    userList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const userId = e.target.id;
            userCheckedState[userId] = e.target.checked;
        }
    });

    groupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const groupName = document.getElementById('groupName').value;
        const description = document.getElementById('description').value;
        const fileInput = document.querySelector('input[name="profile"]');
        const selectedUsers = Object.keys(userCheckedState).filter(user => userCheckedState[user]);

        const file = fileInput.files[0];

        if (file) {
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
                    return axios.post(`/group/create-group`, data, { headers: { 'Authorization': getToken() } });
                })
                .then(res => {
                    alert("Group successfully created");
                    //create from shouild be disappear
                    groupForm.style.visibility = 'hidden';
                    //group list mein new group should be seen
                    const ele = res.data.group;
                    console.log("group details:.........................",ele);
                    if(!ele.dpUrl){
                        ele.dpUrl = '/img/user.PNG';
                    }
                    group_container.innerHTML += `               
                    <li onclick="showGroupChat(${ele.id})">
                       <div>
                          <img src="${ele.dpUrl}" alt="Profile Picture" onclick='viewGroupProfile(${ele.id})'>
                          <strong>${ele.name}</strong>
                          <small>${ele.membersNo} Members <small id="${ele.id}" class="incoming_msgCount" style="visibility: hidden;">0</small></small>
                       </div>
                    </li>`
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
        else {
            const data = {
                name: groupName,
                membersNo: selectedUsers.length + 1,
                membersIds: selectedUsers,
                description: description,
            }
            axios.post(`/group/create-group`, data, { headers: { 'Authorization': getToken() } })
                .then(res => {
                    alert("Group successfully created");
                    //create from shouild be disappear
                    groupForm.style.visibility = 'hidden';
                    //group list mein new group should be seen
                    const ele = res.data.group;
                    if (ele.dp_url) {
                        src = ele.dp_url;
                    }
                    group_container.innerHTML += `               
                <li onclick="showGroupChat(${ele.id})">
                   <div>
                      <img src="${src}" alt="Profile Picture" onclick='viewGroupProfile(${ele.id})'>
                      <strong>${ele.name}</strong>
                      <small>${ele.membersNo} Members <small id="${ele.id}" class="incoming_msgCount" style="visibility: hidden;">0</small></small>
                   </div>
                </li>`
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });

    cancel_btn.addEventListener('click', (e) => {
        e.preventDefault();
        groupForm.style.visibility = 'hidden';
    })

    groupForm.reset();
}

async function ShowGroup() {
    try {
        const groupsResponse = await axios(`/group/get-mygroups`, { headers: { 'Authorization': getToken() } });
        const { groups } = groupsResponse.data;
        let html = "";
        groups.forEach((ele) => {
            if (ele.dpUrl) {
                src = `${ele.dpUrl}`;
            } else {
                src = `https://groupchat-application.s3.ap-south-1.amazonaws.com/groupProfile.svg`;
                // src = `<i class="fa-solid fa-user-group"></i>`;
            }
            html += `               
            <li onclick="showGroupChat(${ele.id})" id = "${'group'+ele.id}">
               <div>
                   <img src="${src}" alt="Profile Picture" onclick='viewGroupProfile(${ele.id})'>
                   <strong>${ele.name}</strong>
                   <small id ="${'small'+ele.id}">${ele.membersNo} Members <small id="${ele.id}" class="incoming_msgCount" style="visibility: hidden;">0</small></small>
               </div>
            </li>    
        `
        })
        group_container.innerHTML = html;
    } catch (error) {
        console.log(error);
    }
}

async function showGroupChat(id) {
    try {
        groupId = id;
        const getUserResponse = await axios.get('/user/get-user', { headers: { 'Authorization': getToken() } });
        const userId = getUserResponse.data.userId
        if (groupId) {
            setupGroup(groupId, userId)
            const APIresponse = await axios(`/group/get-group-messages?groupId=${groupId}`);
            const apiChats = APIresponse.data.chats
            showChatOnScreen(apiChats, userId)
        } else {
            console.log("no group id");
        }

    } catch (error) {
        console.log(error);
        alert("you have to login first.")
    }
}

function showChatOnScreen(chatHistory, userId) {
    const incoming_msg = document.getElementById(groupId);
    incoming_msg.innerText = 0;
    incoming_msg.style.visibility = 'hidden';

    let messageText = "";
    chatHistory.forEach((ele) => {
        const date = new Date(ele.createdAt);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleString('en-US', options);
        if (ele.userId == userId) {
            if (ele.fileType == 'image') {
                if (ele.text) {
                    messageText += `<div class="card outgoing">
                                       <small class="text-primary">${ele.name}</small>
                                       <div>
                                          <img src="${ele.fileUrl}" class="chat-image" onclick="expandImage(this.src)">
                                          <p>${ele.text}</p>
                                       </div>
                                       <small class="text-muted text-end">${formattedDate}</small>
                                    </div>`;
                }
                else {
                    messageText += `<div class="card outgoing">
                                       <small class="text-primary">${ele.name}</small>
                                       <div>
                                          <img src="${ele.fileUrl}" class="chat-image" onclick="expandImage(this.src)">
                                       </div>
                                       <small class="text-muted text-end">${formattedDate}</small>
                                    </div>`;
                }
            }
            else if (ele.fileType == 'video') {
                if (ele.text) {
                    messageText += `                            
                                    <div class="card outgoing">
                                       <small class="text-primary">${ele.name}</small>  
                                       <video controls style="max-width: 300px; max-height: 300px;"><source src="${ele.fileUrl}"></video>;  
                                       <p>${ele.text}</p>                     
                                       <small class="text-muted text-end">${formattedDate}</small>
                                    </div>`
                }
                else {
                    messageText += `                            
                                   <div class="card outgoing">
                                      <small class="text-primary">${ele.name}</small>  
                                      <video controls style="max-width: 300px; max-height: 300px;"><source src="${ele.fileUrl}"></video>;                    
                                      <small class="text-muted text-end">${formattedDate}</small>
                                  </div>`
                }
            }
            else {
                messageText += `                            
                <div class="card outgoing">
                   <small class="text-primary">${ele.name}</small>
                   <p class="chat">${ele.text}</p> 
                   <small class="text-muted text-end">${formattedDate}</small>
               </div>`
            }
        } else {
            if (ele.fileType == 'image') {
                if (ele.text) {
                    messageText += `<div class="card incoming">
                                       <small class="text-primary">${ele.name}</small>
                                        <div>
                                          <a href="${ele.fileUrl}" target="_blank">
                                          <img src="${ele.fileUrl}" class="chat-image" onclick="expandImage(this.src)">
                                          </a>
                                        </div>
                                        <p>${ele.text}</p>
                                       <small class="text-muted text-end">${formattedDate}</small>
                                    </div>`;
                } else {
                    messageText += `<div class="card incoming">
                                       <small class="text-primary">${ele.name}</small>
                                       <div>
                                          <a href="${ele.fileUrl}" target="_blank">
                                          <img src="${ele.fileUrl}" class="chat-image" onclick="expandImage(this.src)">
                                          </a>
                                       </div>
                                       <small class="text-muted text-end">${formattedDate}</small>
                                    </div>`;
                }
            }
            else if (ele.fileType == 'video') {
                if (ele.text) {
                    messageText += `                            
                    <div class="card incoming">
                       <small class="text-danger">${ele.name}</small>  
                       <video controls style="max-width: 300px; max-height: 300px;"><source src="${ele.fileUrl}"></video>;  
                       <p>${ele.text}</p>                     
                       <small class="text-muted text-end">${formattedDate}</small>
                   </div>`
                } else {
                    messageText += `                            
                    <div class="card incoming">
                       <small class="text-danger">${ele.name}</small>  
                       <video controls style="max-width: 300px; max-height: 300px;"><source src="${ele.fileUrl}"></video>;                     
                       <small class="text-muted text-end">${formattedDate}</small>
                   </div>`
                }
            }
            else {
                messageText += `                     
                <div class="card incoming">
                   <small class="text-danger">${ele.name}</small>
                   <p class="chat">${ele.text}</p>
                   <small class="text-muted text-end">${formattedDate}</small>
                </div>`
            }
        }

    })
    chat_body.innerHTML = messageText;
    chat_body.scrollTop = chat_body.scrollHeight;

    // var scrollHeight = chat_body.scrollHeight;
    // var currentScroll = chat_body.scrollTop;
    // var difference = scrollHeight - currentScroll;
    // var speed = 10; // Adjust this value to control the speed of scrolling

    // Perform scrolling gradually
    // var scrollInterval = setInterval(function () {
    //     if (chat_body.scrollTop < scrollHeight) {
    //         chat_body.scrollTop += difference > speed ? speed : difference;
    //     } else {
    //         clearInterval(scrollInterval); // Stop scrolling when reached the bottom
    //     }
    // }, 10); // Adjust this value to control the smoothness of scrolling

}

async function setupGroup(groupId, userId) {
    try {
        const APIresponse = await axios(`/group/get-group?groupId=${groupId}`);
        const { group } = APIresponse.data;
        if (group.dpUrl) {
            group_img.src = group.dpUrl;
        }
        else {
            group_img.src = src;
        }
        group_heading.innerHTML = `${group.name}`;
        group_members.innerHTML = ` ${group.membersNo} Members`;
        const memberApi = await axios(`/group/get-group-members?groupId=${groupId}`, { headers: { 'Authorization': getToken() } });
        const { users } = memberApi.data;

        const usersString = users.map(item => item.name.trim()).join(',');
        group_members.setAttribute("title", `You,${usersString}`);
        // yaha pe issue hai bro...
        send_btn.id = groupId
        // console.log("bhar toh working hai..")
        // console.log(group);
        if (group.adminId == userId) {
            // console.log("but ander issue hai..")
            group_editbtn.classList.remove('d-none')
            group_heading.innerHTML = `${group.name}`;
            afterSetUp(groupId);
        } else {
            group_editbtn.classList.add('d-none')
        }

    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}

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
                preview.innerHTML = `<video controls style="max-width: 100%; max-height: 100%; min-height:80%"><source src="${src}" type="${file.type}"></video>`;
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
    let message = messageInput.value.trim();
    messageInput.value = '';
    console.log(message);
    // if (!message) {
    //     message = 'Null';
    // }

    // Get the selected media file
    const file = fileInput.files[0];
    console.log(file);
    // Create a new FormData object
    const formData = new FormData();
    // if (message) {
    //     const data = {
    //         token: localStorage.getItem('token'),
    //         message: message,
    //         groupId: groupId,
    //     }
    //     const response = await axios.post(`/chat/add`, data)
    //     // socket.emit('new-group-message', groupId);
    //     const date = new Date(response.data.date_time);
    //     const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    //     const formattedDate = date.toLocaleString('en-US', options);

    //     chat_body.innerHTML += ` <div class="card outgoing">
    //                     <small class="text-primary">${response.data.name}</small>
    //                     <p class="chat">${response.data.message}</p>
    //                     <small class="text-muted text-end">${formattedDate}</small>
    //                 </div>`;

    //     socket.emit('new-group-message', groupId);
    // }
    // else if (file.type.startsWith('video')) {
    //     formData.append('media', file);
    //     axios.post('/upload', formData)
    //         .then(async (res) => {
    //             const data = {
    //                 token: localStorage.getItem('token'),
    //                 message: res.data,
    //                 groupId: groupId,
    //                 isImage: false,
    //                 isVideo: true
    //             }
    //             console.log(data);
    //             const response = await axios.post(`/chat/add`, data)
    //             const date = new Date(response.data.date_time);
    //             const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    //             const formattedDate = date.toLocaleString('en-US', options);

    //             chat_body.innerHTML += ` <div class="card outgoing">
    //                             <small class="text-primary">${response.data.name}</small>
    //                             <div>
    //                             <video controls style="max-width: 300px; max-height: 300px;"><source src="${response.data.message}"></video>
    //                             </div>
    //                             <small class="text-muted text-end">${formattedDate}</small>
    //                         </div>`;

    //             socket.emit('new-group-message', groupId);
    //             fileInput.value = '';
    //             preview.innerHTML = '';

    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //         });
    // }
    // else {
    //     formData.append('media', file);
    //     axios.post('/upload', formData)
    //         .then(async (res) => {
    //             const data = {
    //                 token: localStorage.getItem('token'),
    //                 message: res.data,
    //                 groupId: groupId,
    //                 isImage: true,
    //                 isVideo: false
    //             }
    //             const response = await axios.post(`/chat/add`, data)
    //             const date = new Date(response.data.date_time);
    //             const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    //             const formattedDate = date.toLocaleString('en-US', options);

    //             chat_body.innerHTML += ` <div class="card outgoing">
    //                             <small class="text-primary">${response.data.name}</small>
    //                             <div>
    //                                 <a href="${response.data.message}" target="_blank">
    //                                 <img src=${response.data.message} alt="Selected Image" style="max-width: 300px; max-height: 300px;">
    //                             </div>
    //                             <small class="text-muted text-end">${formattedDate}</small>
    //                         </div>`;

    //             socket.emit('new-group-message', groupId);
    //             fileInput.value = '';
    //             preview.innerHTML = '';

    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //         });
    // }
    if (file) {
        formData.append('media', file);
        let fileType;
        if (file.type.startsWith('video'))
            fileType = 'video';
        else
            fileType = 'image';

        axios.post('/upload', formData)
            .then(async (res) => {
                const data = {
                    token: localStorage.getItem('token'),
                    message: message,
                    fileUrl: res.data,
                    fileType: fileType,
                    groupId: groupId
                }
                // console.log(data);
                const response = await axios.post(`/chat/add`, data)
                console.log(response.data);
                const date = new Date();
                const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const formattedDate = date.toLocaleString('en-US', options);

                if (fileType == 'video') {
                    chat_body.innerHTML += ` <div class="card outgoing">
                       <small class="text-primary">${response.data.name}</small>
                       <div>
                          <video controls style="max-width: 300px; max-height: 300px;"><source src="${response.data.fileUrl}"></video>
                       </div>
                       <p>${response.data.text}</p>
                       <small class="text-muted text-end">${formattedDate}</small>
                    </div>`;
                } else {
                    chat_body.innerHTML += ` <div class="card outgoing">
                       <small class="text-primary">${response.data.name}</small>
                       <div>
                          <a href="${response.data.fileUrl}" target="_blank">
                          <img src=${response.data.fileUrl} alt="Selected Image" style="max-width: 300px; max-height: 300px;">
                          </a>
                       </div>
                       <p>${response.data.text}</p>
                       <small class="text-muted text-end">${formattedDate}</small>
                    </div>`;
                }

                socket.emit('new-group-message', groupId);
                fileInput.value = '';
                preview.innerHTML = '';

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    else if (message) {
        const data = {
            token: localStorage.getItem('token'),
            message: message,
            fileUrl: 'Null',
            fileType: 'text',
            groupId: groupId
        }
        console.log(data);
        const response = await axios.post(`/chat/add`, data)
        // y nicche wali prolem discuse karni hai
        // console.log(response.data);
        const date = new Date();
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleString('en-US', options);
        chat_body.innerHTML += ` <div class="card outgoing">
                                 <small class="text-primary">${response.data.name}</small>
                                 <p class="chat">${response.data.text}</p>
                                 <small class="text-muted text-end">${formattedDate}</small>
                                 </div>`;

        socket.emit('new-group-message', groupId);
        fileInput.value = '';
        preview.innerHTML = '';
    }

    // showGroupChats(groupId)
    chat_body.scrollTop = chat_body.scrollHeight;

});


socket.on('group-message', async (groupId_P) => {
    if (groupId === groupId_P) {
        showGroupChat(groupId);
    }
    else {
        const APIresponse = await axios(`/group/get-group?groupId=${groupId_P}`);
        const { group } = APIresponse.data;
        const incoming_msg = document.getElementById(group.id);
        incoming_msg.style.visibility = 'visible';
        incoming_msg.innerText = parseInt(incoming_msg.innerText) + 1;

    }
})

function expandImage(src) {
    var expandedImage = document.getElementById('expanded-image');
    var imageElement = expandedImage.querySelector('img');
    imageElement.src = src;
    expandedImage.style.display = 'block';
}

function closeExpandedImage() {
    var expandedImage = document.getElementById('expanded-image');
    expandedImage.style.display = 'none';
}