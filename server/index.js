const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Assuming your static files are in a 'public' directory
app.use(express.json());


mongoose.connect('mongodb+srv://Loiy:12345@nedaa.dnlqzqp.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(console.log("Mongodb connected"));

const appointmentSchema = new mongoose.Schema({
  dateone: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  datetwo: {
    type: String,
    required: true,
  },
  time: {
    type: String, 
    required: true,
  },
  timetwo: {
    type: String,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/add', async (req, res) => {

  const { dateone, name, datetwo, number, time, timetwo, deposit, rent } = req.body;

  const newAppointment = new Appointment({
    dateone,
    name,
    datetwo,
    number,
    time,
    timetwo,
    deposit,
    rent
  });


  try {
    await newAppointment.save();
    //const savedAppointment = 
    //console.log('Kaydedildi:', savedAppointment);
    res.status(200).json({ message: 'Appointment added successfully' });
  } catch (error) {
    console.error('kaydedilemedi:', error);
    res.status(500).json({ error: 'Error adding appointment' });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    console.error('Veriler getirilemedi:', error);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Veri silinemedi:', error);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
