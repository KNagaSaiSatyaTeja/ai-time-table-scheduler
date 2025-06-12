const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Faculty = require('./models/Faculty');
require('dotenv').config();

const sampleData = {
  "subjects": [
    {
      "name": "Discrete Mathematics",
      "duration": 50,
      "time": 50,
      "no_of_classes_per_week": 4,
      "periods_per_day": 1,
      "periods_per_week": 4,
      "max_continuous_periods": 2,
      "faculty": [
        {
          "id": "F1",
          "name": "Dr. Anil Sharma",
          "availability": [
            {"day": "MONDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "TUESDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "WEDNESDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "THURSDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "FRIDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "SATURDAY", "startTime": "09:30", "endTime": "14:50"}
          ]
        }
      ]
    },
    {
      "name": "Automata Theory and Compiler Design",
      "duration": 50,
      "time": 50,
      "no_of_classes_per_week": 5,
      "periods_per_day": 1,
      "periods_per_week": 5,
      "max_continuous_periods": 2,
      "faculty": [
        {
          "id": "F1",
          "name": "Dr. Anil Sharma",
          "availability": [
            {"day": "MONDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "TUESDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "WEDNESDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "THURSDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "FRIDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "SATURDAY", "startTime": "09:30", "endTime": "14:50"}
          ]
        }
      ]
    },
    {
      "name": "Database Management Systems",
      "duration": 50,
      "time": 50,
      "no_of_classes_per_week": 4,
      "periods_per_day": 1,
      "periods_per_week": 4,
      "max_continuous_periods": 2,
      "faculty": [
        {
          "id": "F3",
          "name": "Dr. Sameer Patel",
          "availability": [
            {"day": "MONDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "WEDNESDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "THURSDAY", "startTime": "09:30", "endTime": "13:00"}
          ]
        }
      ]
    },
    {
      "name": "Introduction to Artificial Intelligence",
      "duration": 50,
      "time": 50,
      "no_of_classes_per_week": 4,
      "periods_per_day": 1,
      "periods_per_week": 4,
      "max_continuous_periods": 2,
      "faculty": [
        {
          "id": "F4",
          "name": "Ms. Neha Gupta",
          "availability": [
            {"day": "MONDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "WEDNESDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "THURSDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "FRIDAY", "startTime": "09:30", "endTime": "13:00"}
          ]
        }
      ]
    },
    {
      "name": "Object-Oriented Programming through Java",
      "duration": 100,
      "time": 100,
      "no_of_classes_per_week": 3,
      "periods_per_day": 1,
      "periods_per_week": 3,
      "max_continuous_periods": 2,
      "faculty": [
        {
          "id": "F5",
          "name": "Mr. Vikram Singh",
          "availability": [
            {"day": "FRIDAY", "startTime": "09:30", "endTime": "13:00"},
            {"day": "SATURDAY", "startTime": "09:30", "endTime": "14:50"}
          ]
        }
      ]
    },
    {
      "name": "Database Management Systems Lab",
      "duration": 100,
      "time": 100,
      "no_of_classes_per_week": 1,
      "periods_per_day": 1,
      "periods_per_week": 1,
      "max_continuous_periods": 2,
      "faculty": [
        {
          "id": "F6",
          "name": "Ms. Priya Menon",
          "availability": [
            {"day": "WEDNESDAY", "startTime": "09:30", "endTime": "13:00"}
          ]
        }
      ]
    }
  ]
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Subject.deleteMany({});
    await Faculty.deleteMany({});
    console.log('Cleared existing data');

    // Extract unique faculty members
    const facultyMap = new Map();
    sampleData.subjects.forEach(subject => {
      subject.faculty.forEach(fac => {
        if (!facultyMap.has(fac.id)) {
          facultyMap.set(fac.id, {
            _id: new mongoose.Types.ObjectId(),
            id: fac.id,
            name: fac.name,
            availability: fac.availability
          });
        }
      });
    });

    // Insert faculty
    const facultyDocs = Array.from(facultyMap.values());
    await Faculty.insertMany(facultyDocs);
    console.log(`Inserted ${facultyDocs.length} faculty members`);

    // Insert subjects with faculty references
    const subjectDocs = sampleData.subjects.map(subject => ({
      name: subject.name,
      duration: subject.duration,
      time: subject.time,
      no_of_classes_per_week: subject.no_of_classes_per_week,
      periods_per_day: subject.periods_per_day,
      periods_per_week: subject.periods_per_week,
      max_continuous_periods: subject.max_continuous_periods,
      faculty: subject.faculty.map(fac => ({
        id: fac.id,
        name: fac.name,
        availability: fac.availability
      }))
    }));

    await Subject.insertMany(subjectDocs);
    console.log(`Inserted ${subjectDocs.length} subjects`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();