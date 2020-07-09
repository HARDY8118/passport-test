let scrollPos = 0

window.addEventListener('scroll', () => {
    const s = window.pageYOffset || document.scrollTop
    s > scrollPos ? scrollTo(0, 1000) : scrollTo(0, 0)
    scrollPos = s <= 0 ? 0 : s
})

const loginBox = document.querySelector('#login-box')
const logupBox = document.querySelector('#logup-box')

document.querySelector('#login').addEventListener('click', () => {
    document.querySelector('#logup-box #name').style.display = "none"
    document.querySelector('#logup-box #username').style.display = "none"
    document.querySelector('#logup-box #email').style.display = "none"
    document.querySelector('#logup-box #password').style.display = "none"
    document.querySelector('#logup-box > input[type=button]').style.display = "none"

    loginBox.style.right = '50vw'
    logupBox.style.left = '100vw'

    document.querySelector('#login-box #username').style.display = "block"
    document.querySelector('#login-box #password').style.display = "block"
    document.querySelector('#login-box > input[type=button]').style.display = "block"
})

document.querySelector('#logup').addEventListener('click', () => {
    document.querySelector('#login-box #username').style.display = "none"
    document.querySelector('#login-box #password').style.display = "none"
    document.querySelector('#login-box > input[type=button]').style.display = "none"

    logupBox.style.left = '50vw'
    loginBox.style.right = '100vw'

    document.querySelector('#logup-box #name').style.display = "block"
    document.querySelector('#logup-box #username').style.display = "block"
    document.querySelector('#logup-box #password').style.display = "block"
    document.querySelector('#logup-box #email').style.display = "block"
    document.querySelector('#logup-box > input[type=button]').style.display = "block"
})

document.querySelector('#login-box>input[type=button]').addEventListener('click', () => {
    fetch(`${window.location.origin}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": document.querySelector('#login-box>input#username').value,
            "password": document.querySelector('#login-box>input#password').value
        })
    })
        .then(res => res.json())
        .then(res => {
            console.log(res)
            const d = document.createElement('div')
            d.id = 'profile'

            d.innerHTML =
                `
                    <div id="profile">
                    <div>NAME: ${res.name}</div>
                    <div>USERNAME: ${res.username}</div>
                    <div>EMAIL: ${res.email}</div>
                    </div>
                `
            document.body.appendChild(d)
        })
        .catch(err => console.log(err))
})

document.querySelector('#logup-box>input[type=button]').addEventListener('click', () => {
    fetch(`${window.location.origin}/logup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": document.querySelector('#logup-box>input#name').value,
            "username": document.querySelector('#logup-box>input#username').value,
            "password": document.querySelector('#logup-box>input#password').value
        })
    })
        .then(res => res.json())
        .then(res => console.log(res))
        .catch(err => console.log(err))
})

window.addEventListener('load', () => {
    const nextUrl = window.location.href || 'http://127.0.0.1:5000'
    document.querySelector('#google>a').setAttribute("href", "/auth/google?next=" + nextUrl)

    document.querySelector('#facebook>a').setAttribute("href", "/auth/facebook?next=" + nextUrl)

    document.querySelector('#twitter>a').setAttribute("href", "/auth/twitter?next=" + nextUrl)

    document.querySelector('#github>a').setAttribute("href", "/auth/github?next=" + nextUrl)
})