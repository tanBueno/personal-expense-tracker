
const transaction_list_tbody = document.getElementById('transaction_list_tbody');
const add_transaction_form = document.getElementById('add_transaction_form');
const baseURL = window.location.origin;

let idToDelete = null;
let idToEdit = null;

function displayElement(id){
    document.getElementById(id).style.display = "flex";
}

function hideElement(id){
    document.getElementById(id).style.display = "none";
}

const loadTransactions = async () => {
    const response = await fetch(`${baseURL}/transactions`);
    const results = await response.json();

    let totalBalance = 0;

    transaction_list_tbody.innerHTML = '';
    results.forEach(result => {

        const amount = parseFloat(result.amount);
        if (result.type === 'income') {
            totalBalance += amount;
        } else {
            totalBalance -= amount;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${result.type}</td>
        <td>${result.amount}</td>
        <td>${result.category}</td>
        <td>${new Date(result.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
        <td>
        <button onclick="displayEditPopup('${result._id}')">Edit</button>
        <button onclick="displayDeletePopup('${result._id}')">Delete</button>
        </td>
        `;
        transaction_list_tbody.appendChild(tr);

        const balance_num = document.getElementById('current_balance_num');
        balance_num.innerText = `${totalBalance.toFixed(2)}`;
        balance_num.style.color = totalBalance >= 0 ? "green" : "red";
    })
}

function prepareForm(mode = 'add') {
    const form = add_transaction_form;
    const title = form.querySelector('h1');
    const submitBtn = form.querySelector('.submit-btn');

    form.reset();
    idToEdit = null;

    if (mode === 'add') {
        title.innerText = "Add Transaction";
        submitBtn.innerText = "Add";
    } else {
        title.innerText = "Edit Transaction";
        submitBtn.innerText = "Save Changes";
    }
}

async function displayEditPopup(id) {
    prepareForm('edit')
    idToEdit = id;
    
    const response = await fetch(`${baseURL}/transactions`);
    const transactions = await response.json();
    const item = transactions.find(t => t._id === id);

    const form = document.getElementById('add_transaction_form');
    form.querySelector(`input[value="${item.type}"]`).checked = true;
    form.querySelector('input[name="trans_amount"]').value = item.amount;
    form.querySelector('select[name="trans_category"]').value = item.category;
    form.querySelector('input[name="trans_date"]').value = item.date.split('T')[0];

    displayElement('add_transaction_popup');
}

function editTransaction(id){
    idToDelete = id;
    displayElement('add_transaction_form');

}

function displayDeletePopup(id) {
    idToDelete = id;
    displayElement('delete_transaction_popup');
}

async function deleteTransaction(id){
    if (!idToDelete) return;
    await fetch(`${baseURL}/transactions/${idToDelete}`, { method: 'DELETE' });
    hideElement('delete_transaction_popup');
    idToDelete = null;
    loadTransactions();
}

add_transaction_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const method = idToEdit ? 'PUT' : 'POST';
    const url = idToEdit ? `${baseURL}/transactions/${idToEdit}` : `${baseURL}/post`;

    const formData = new FormData(add_transaction_form);
    const data = Object.fromEntries(formData);

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    hideElement('add_transaction_popup');
    idToEdit = null;
    add_transaction_form.reset();
    loadTransactions();
});

loadTransactions();