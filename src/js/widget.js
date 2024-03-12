export default class Widget {
    constructor(url) {
        console.log(3333)
        this.url = url;
        this.container = document.querySelector('body');
        this.usersOnline = [];
        this.currentUser = null;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('connected');
        };

        this.ws.onmessage = (evt) => {
            const response = JSON.parse(evt.data);

            if (response.type === 'error') {
                alert('Такой никнейм занят, необходимо выбрать другой');
            } else if (response.type === 'users') {
                this.usersOnline = response.data;
                this.deleteForm();
                this.showChat();
            } else if (response.type === 'send') {
                this.showNewMess(response.data.data);
            }
        };

        this.ws.onclose = (evt) => {
            console.log('connection closed', evt.code);
        };

        this.ws.onerror = () => {
            console.log('error');
        };

        // Удаления пользователя при закрытии страницы
        window.addEventListener('beforeunload', () => {
            this.ws.send(JSON.stringify({type: 'deleteUser', user: this.currentUser}));
        });
    }

    // Форма при загрузке3
    createForm() {
        const form = document.createElement('form');
        form.classList.add('widget');
        form.innerHTML = ` <h2>Выберите псевдоним</h2>
        <input class="input widget-input" type="text" name="nick" required>
        <button type="submit" class="btn">Продолжить</button>`;

        this.container.insertAdjacentElement('afterbegin', form);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nickName = form.nick.value;
            const response = {type: 'addUser', user: nickName};
            this.currentUser = nickName;

            const res = await fetch("http://localhost:3000/new-user", {
                method: "post",
                body: JSON.stringify({
                    name: nickName
                }),
            })
            let {user} = await res.json();
            this.currentUser = user
            console.log(this.currentUser, "result")
            this.deleteForm();
            this.showChat();

        });
    }

    // Удаление формы
    deleteForm() {
        this.container.removeChild(this.container.firstChild);
    }

    // Создание чата
    showChat() {
        if (!document.querySelector('.container')) {
            const container = document.createElement('div');
            container.classList.add('container');

            container.innerHTML = `<section class="chat-users"></section>
            <section class="chat">
             <div class="chat-content"></div>
                       <form class="chat-form">
                    <input class="input chat-form-input" type="text" aria-label="Ваше сообщение" name="message" placeholder="Напишите сообщение" required>
                </form>
            </section>`;

            this.container.appendChild(container);
            const chatForm = container.querySelector('.chat-form');

            // Ввод сообщения
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const message = chatForm.message.value;
                const time = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, -3)}`;
                this.ws.send(JSON.stringify({
                    type: 'message',
                    data: {
                        name: this.currentUser,
                        message,
                        time,
                    },
                }));

                chatForm.message.value = '';
            });
        }

        this.showUsers();
    }

    // Список пользователей
    showUsers() {
        const users = document.querySelector('.chat-users');


        users.innerHTML = `<main class="chat-page"> 
            <article class = "chat-list"> 
                <ul class="users">
                    <li class="user"><img src="//1673978368_flomaster-club-p-risunok-beseda-vkontakte-8.jpg" class="user_image" alt="">
                    <span class="name">${this.currentUser.name}</span>
                    </li> 
                    <li class="user"><img src="//1673978368_flomaster-club-p-risunok-beseda-vkontakte-8.jpg" class="user_image" alt="">
                    <span class="name">${this.currentUser.name}</span>
                    </li>
                    <li class="user"><img src="//1673978368_flomaster-club-p-risunok-beseda-vkontakte-8.jpg" class="user_image" alt="">
                    <span class="name">${this.currentUser.name}</span>
                    </li> 
                    <li class="user"><img src="//1673978368_flomaster-club-p-risunok-beseda-vkontakte-8.jpg" class="user_image" alt="">
                    <span class="name">${this.currentUser.name}</span>
                    </li>
            </ul> 
            </article>`

        this.usersOnline.forEach((user) => {
            const userItem = document.createElement('li')
            userItem.classList.add('user');
            userItem.innerHTML = `<img src="//1673978368_flomaster-club-p-risunok-beseda-vkontakte-8.jpg" class="user_image" alt="">
                        <span class="name">${user.name}</span>`;

            const userName = document.createElement('div');
            userName.classList.add('user-name');
            userName.textContent = user.name;

            if (user.name === this.currentUser.name) {
                userItem.querySelector('.name').textContent = "Вы"
            }

            users.firstElementChild.appendChild(userItem);
        });
    }

    // Создание сообщения
    createMessage(data) {
        const newMes = document.createElement('div');
        newMes.classList.add('chat-message');

        newMes.innerHTML = ` <div class="mes-top"><span class="chat-message-name"></span>
            <span class="chat-message-time">${data.time}</span></div>
            <div class="chat-mes-content">${data.message}</div>`;

        const userChatName = newMes.querySelector('.chat-message-name');

        if (data.name === this.currentUser) {
            userChatName.textContent = 'You';
            newMes.classList.add('you-mes');
        } else {
            newMes.classList.remove('you-mes');
            userChatName.textContent = data.name;
        }

        return newMes;
    }

    // Добавление сообщения в чат
    showNewMess(data) {

        const message = this.createMessage(data);
        this.container.querySelector('.chat-content').appendChild(message);
    }
}