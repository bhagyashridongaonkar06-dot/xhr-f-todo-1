const cl = console.log;

const todoForm = document.getElementById('todoForm')
const todo = document.getElementById('todo')
const addTodo = document.getElementById('addTodo')
const updateTodo = document.getElementById('updateTodo')
const todoContainer = document.getElementById('todoContainer')
const spinner = document.getElementById('spinner')


const stateMng = {
    todoArr: [],
    updateid: null
}

let base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com/`
let todo_url = `${base_url}/todos.json`

//spinner

function spinnerHandling(flag) {
    if (flag) {
        spinner.classList.remove('d-none')
    } else {
        spinner.classList.add('d-none')
    }
}

// snackbar

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500
    })
}

//render data on UI
function renderDataOnUI(arr) {
    let result = '';

    arr.forEach(ele => {
        result += `<li class="list-group-item d-flex justify-content-between align-items-center" id="${ele.id}">
                                <b>${ele.todo}</b>

                                <div>
                                    <button onclick="onEdit(this)" class="btn-sm btn-success ml-2"><i
                                            class="fa-solid fa-pen-to-square fa-2x text-white"></i></button>
                                    <button onclick="onRemove(this)" class="btn-sm btn-danger"><i class="fa-solid fa-trash fa-2x"></i></button>
                                </div>
                            </li>`
    });

    todoContainer.innerHTML = result;
}

function databyApi() {
    // spinnerHandling(true)
    let xhr = new XMLHttpRequest();

    xhr.open("GET", todo_url)

    xhr.send(null)

    xhr.onload = function () {
        let res = JSON.parse(xhr.response)
        // cl(res)

        for (const key in res) {
            res[key].id = key

            stateMng.todoArr.push(res[key])
        }
        renderDataOnUI(stateMng.todoArr)
    }

    xhr.onerror = function () {
        cl("error")
        spinnerHandling()
    }
}

databyApi()

//function create
function onSubmit(eve) {
    eve.preventDefault();
    spinnerHandling(true)

    let newTodo = {
        todo: todo.value
    }
    
    let xhr = new XMLHttpRequest();
    
    xhr.open("POST", todo_url)
    
    xhr.send(JSON.stringify(newTodo))
    
    xhr.onload = function () {
        let res = JSON.parse(xhr.response)
        // cl(res)
        todoForm.reset()
        newTodo.id = res.name
        stateMng.todoArr.push(newTodo)

        let li = document.createElement('li')
        li.id = res.name
        // cl(stateMng.todoArr)
        li.className = `list-group-item d-flex justify-content-between align-items-center`
        li.innerHTML = `<b>${newTodo.todo}</b>

                                <div>
                                    <button onclick="onEdit(this)" class="btn-sm btn-success ml-2"><i
                                            class="fa-solid fa-pen-to-square fa-2x text-white"></i></button>
                                    <button onclick="onRemove(this)" class="btn-sm btn-danger"><i class="fa-solid fa-trash fa-2x"></i></button>
                                </div>`
        todoContainer.append(li)
        spinnerHandling()
        snackbar(`new todo with name ${newTodo.todo} created successfully`, 'success')
    }

    xhr.onerror = function () {
        cl("error")
        spinnerHandling()
    }
}

function onEdit(ele) {
    let editId = ele.closest('li').id;
    // cl(editId)

    stateMng.updateid = editId

    let editObj = stateMng.todoArr.find(e => e.id === editId)
    // cl(editObj)

    todo.value = editObj.todo

    addTodo.classList.add('d-none')
    updateTodo.classList.remove('d-none')
}

function onUpdate() {
    spinnerHandling(true)
    let updateId = stateMng.updateid;
    stateMng.updateid = null
    // cl(updateId)

    let update_url = `${base_url}/todos/${updateId}.json`

    let updateObj = {
        todo: todo.value,
        id: updateId
    }

    let xhr = new XMLHttpRequest();

    xhr.open("PATCH", update_url)

    xhr.send(JSON.stringify(updateObj))

    xhr.onload = function () {
        let res = JSON.parse(xhr.response)
        // cl(res)

        let obj_idx = stateMng.todoArr.findIndex(e => e.id === updateId)
        // cl(obj_idx)
        stateMng.todoArr[obj_idx] = updateObj

        let li = document.getElementById(updateId)
        li.querySelector('b').innerHTML = updateObj.todo

        todoForm.reset()
        spinnerHandling()

        snackbar(`todo with name ${updateObj.todo} updated successfully`, 'success')

        addTodo.classList.remove('d-none')
        updateTodo.classList.add('d-none')
    }

    xhr.onerror = function () {
        cl("error")
        spinnerHandling()
    }
}

function onRemove(ele) {
    let removeId = ele.closest('li').id;
    // cl(removeId)

    let remove_url = `${base_url}/todos/${removeId}.json`


    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            spinnerHandling(true)
            let xhr = new XMLHttpRequest();

            xhr.open("DELETE", remove_url)

            xhr.send(null)

            xhr.onload = function () {
                let res = JSON.parse(xhr.response)

                let getIndex = stateMng.todoArr.findIndex(e => e.id === removeId)
                stateMng.todoArr.splice(getIndex, 1)

                ele.closest('li').remove()
                snackbar(`li with id ${removeId} removed successfully`, 'success')
                spinnerHandling()
            }

            xhr.onerror = function () {
                cl("error")
                spinnerHandling()
            }
        }
    });
}

todoForm.addEventListener('submit', onSubmit)
updateTodo.addEventListener('click', onUpdate)