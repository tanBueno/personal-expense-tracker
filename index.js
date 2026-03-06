require('dotenv').config();

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;
console.log(mongoURI)

const express = require('express')
const mongoose = require('mongoose')
const app = express()

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))
app.use(express.json());

mongoose.connect(mongoURI)
const db = mongoose.connection
db.once('open', () => {
    console.log("MongoDB connection successful")
})

const transactionSchema = new mongoose.Schema({
    type: String,
    amount: Number,
    category:String,
    date: Date,
})

const Transactions = mongoose.model("transaction", transactionSchema)

app.post('/post',async (req, res)=>{
    const {trans_type, trans_amount, trans_category, trans_date} = req.body
    const transaction = new Transactions({
        type: trans_type, 
        amount: trans_amount,
        category: trans_category,
        date: trans_date,
    })
    await transaction.save()
    console.log(transaction)
    res.status(200).json({ message: "Success" });
})

app.get("/transactions", async (req, res) => {
    let collection = await db.collection("transactions")
    let results = await collection.find({}).limit(50).toArray();
    res.send(results).status(200);
});

app.put("/transactions/:id", async (req, res) => {
    try {
        const updatedData = {
            type: req.body.trans_type,
            amount: req.body.trans_amount,
            category: req.body.trans_category,
            date: req.body.trans_date,
        };
        await Transactions.findByIdAndUpdate(req.params.id, updatedData);
        res.json({message: "Updated Successfully"});
    }
    catch(err){
        res.status(500).json({error: "Update Failed"});
    }
})

app.delete('/transactions/:id', async (req, res) => {
    try {
        const result = await Transactions.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log('Server is running on part 3000');
});

app.get('/', (req, res) => {
    res.send("Hello from Node API")
});

